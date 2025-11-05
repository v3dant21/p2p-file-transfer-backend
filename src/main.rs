use std::time::Duration;
use std::{collections::HashMap, sync::Arc};
use axum::extract::ws::{Message, WebSocket};
use axum::extract::{State, WebSocketUpgrade};
use axum::response::IntoResponse;
use axum::{Router, routing::get};
use tokio::sync::{broadcast, mpsc, Mutex};
use tokio::time::interval; 
use serde_json::{Value,json};
use tower_http::services::ServeDir;
use futures_util::{StreamExt, SinkExt};
use serde::{Deserialize, Serialize};


use uuid::Uuid;
#[derive(Serialize, Deserialize)]
struct FileMetadata {
    name: String,
    size: u64,
    mime_type: String,
} 
#[derive(Clone)]
struct Pair {
    sender: Option<broadcast::Sender<Message>>,
    receiver: Option<broadcast::Sender<Message>>,
}

#[derive(Clone)]
struct AppState {
    pairs: Arc<Mutex<HashMap<String, Pair>>>,
    conn_index: Arc<Mutex<HashMap<String, (String, String)>>>,
}

fn normalize_id(raw: &str) -> String {
    // If a full URL was pasted (e.g., http://localhost:8000/?id=XYZ), extract the id param
    if let Some(idx) = raw.find("?id=") {
        return raw[idx+4..].to_string();
    }
    // Fallback: if there's an '=', try to take the last segment
    if raw.contains('=') {
        if let Some(last) = raw.rsplit('=').next() {
            return last.to_string();
        }
    }
    raw.to_string()
}
#[tokio::main]
async fn main() {
    let state = AppState{
        pairs: Arc::new(Mutex::new(HashMap::new())),
        conn_index: Arc::new(Mutex::new(HashMap::new())),
    };
    
    // Fix the router configuration
    let app = Router::new()
        .route("/ws", get(WebSocket_handler))
        .nest_service("/", ServeDir::new("./"))
        .with_state(state);

    let listner = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("server is running at http://localhost:8000");
    axum::serve(listner, app).await.unwrap();
}   
 
async fn WebSocket_handler (
    ws : WebSocketUpgrade,
    State(state): State<AppState>,
)    -> impl IntoResponse {
    ws.on_upgrade(move|socket| handle_socket(socket, state))
}




async fn handle_socket(socket: WebSocket, state: AppState) {
    let conn_id = Uuid::new_v4().to_string();
    let conn_id_clone = conn_id.clone();
    println!("new connection {}", conn_id);

    let (tx, mut rx) = broadcast::channel(100);
    let (mut sender, mut receiver) = socket.split();
    let (message_tx, mut message_rx) = mpsc::channel::<Message>(100);

    let sender_task = tokio::spawn (async move{
        while let Some(msg) = message_rx.recv().await{
            if sender.send(msg).await.is_err(){
                break;
            }

        }
    
    
    });  

    let ping_tx = message_tx.clone();
    let ping_task = tokio::spawn(async move {
        let mut intervel = interval(Duration::from_secs(30));
        loop{
            intervel.tick().await;
            if ping_tx.send(Message::Ping(vec![])).await.is_err(){
                break;
            }
        } 
    });

    let forward_tx = message_tx.clone();
    let forward_task = tokio::spawn(async move {
        while let Ok(msg)= rx.recv().await{
            if forward_tx.send(msg).await.is_err(){

            }
        }
    });
    let receive_task = tokio::spawn({
        let state = state.clone();
        let tx = tx.clone();
        let mut target_map: HashMap<String, String> = HashMap::new();
        let mut total_bytes_forwarded: usize = 0;
        
        async move {
            while let Some(Ok(msg)) = receiver.next().await {
                match msg {
                    Message::Text(text) => {
                        if let Ok(data) = serde_json::from_str::<Value>(&text) {
                            if data["type"] == "register" {
                                if let (Some(id_raw), Some(role)) = (data["connectionId"].as_str(), data["role"].as_str()) {
                                    let id = normalize_id(id_raw);
                                    let mut pairs = state.pairs.lock().await;
                                    let entry = pairs.entry(id.to_string()).or_insert(Pair { sender: None, receiver: None });
                                    if role == "sender" {
                                        entry.sender = Some(tx.clone());
                                    } else if role == "receiver" {
                                        entry.receiver = Some(tx.clone());
                                    }
                                    println!("[register] conn={} pair_id={} role={} (raw={})", conn_id, id, role, id_raw);

                                    state.conn_index.lock().await.insert(conn_id.clone(), (id.to_string(), role.to_string()));

                                    if role == "receiver" {
                                        if let Some(sender_tx) = entry.sender.as_ref() {
                                            let _ = sender_tx.send(Message::Text(json!({
                                                "type": "recipient_connected"
                                            }).to_string()));
                                            println!("[notify] recipient_connected sent to sender for pair_id={}", id);
                                        } else {
                                            println!("[notify] receiver connected but sender missing for pair_id={}", id);
                                        }
                                    }
                                }
                                continue;
                            } 
                            
                            // Handle file metadata
                            if data["type"] == "file_info" {
                                if let Some(pair_id_raw) = data["target_id"].as_str() {
                                    let pair_id = normalize_id(pair_id_raw);
                                    target_map.insert(conn_id.clone(), pair_id.to_string());
                                    let pairs = state.pairs.lock().await;
                                    if let Some((_, role)) = state.conn_index.lock().await.get(&conn_id).cloned() {
                                        if let Some(pair) = pairs.get(&pair_id) {
                                            let target_tx = if role == "sender" { pair.receiver.as_ref() } else { pair.sender.as_ref() };
                                            if let Some(t) = target_tx {
                                                println!("[file_info] from conn={} role={} -> pair_id={} forwarding (raw={})", conn_id, role, pair_id, pair_id_raw);
                                                let _ = t.send(Message::Text(text));
                                            } else {
                                                println!("[file_info] counterpart missing for pair_id={} (role={})", pair_id, role);
                                            }
                                        } else { println!("[file_info] pair not found for pair_id={} (raw={})", pair_id, pair_id_raw); }
                                    }
                                }
                                continue;
                            }

                            // Forward regular messages
                            if let Some(pair_id_raw) = data["target_id"].as_str() {
                                let pair_id = normalize_id(pair_id_raw);
                                target_map.insert(conn_id.clone(), pair_id.to_string());
                                let pairs = state.pairs.lock().await;
                                if let Some((_, role)) = state.conn_index.lock().await.get(&conn_id).cloned() {
                                    if let Some(pair) = pairs.get(&pair_id) {
                                        let target_tx = if role == "sender" { pair.receiver.as_ref() } else { pair.sender.as_ref() };
                                        if let Some(t) = target_tx {
                                            println!("[text] from conn={} role={} -> pair_id={} forwarding (raw={})", conn_id, role, pair_id, pair_id_raw);
                                            let _ = t.send(Message::Text(text));
                                        } else { println!("[text] counterpart missing for pair_id={} (role={})", pair_id, role); }
                                    } else { println!("[text] pair not found for pair_id={} (raw={})", pair_id, pair_id_raw); }
                                }
                            }
                        }
                    }
                    Message::Binary(bin_data) => {
                        if let Some(pair_id) = target_map.get(&conn_id).cloned() {
                            let pairs = state.pairs.lock().await;
                            if let Some((_, role)) = state.conn_index.lock().await.get(&conn_id).cloned() {
                                if let Some(pair) = pairs.get(&pair_id) {
                                    let target_tx = if role == "sender" { pair.receiver.as_ref() } else { pair.sender.as_ref() };
                                    if let Some(t) = target_tx {
                                        total_bytes_forwarded += bin_data.len();
                                        println!("[binary] conn={} role={} -> pair_id={} chunk={} bytes, total={} bytes", conn_id, role, pair_id, bin_data.len(), total_bytes_forwarded);
                                        let _ = t.send(Message::Binary(bin_data));
                                    } else { println!("[binary] counterpart missing for pair_id={} (role={})", pair_id, role); }
                                } else { println!("[binary] pair not found for pair_id={}", pair_id); }
                            }
                        } else {
                            println!("[binary] No target_id set yet for conn={} (expect a preceding JSON with target_id)", conn_id);
                        }
                    }
                    Message::Close(_) => break,
                    _ => continue,
                }
            }
        }
    });
    tokio::select! {
        _= sender_task => {},
        _=ping_task => {},
        _= forward_task=> {},
        _= receive_task=>{},
    }
    if let Some((pair_id, role)) = state.conn_index.lock().await.remove(&conn_id_clone) {
        let mut pairs = state.pairs.lock().await;
        if let Some(entry) = pairs.get_mut(&pair_id) {
            if role == "sender" {
                entry.sender = None;
            } else if role == "receiver" {
                entry.receiver = None;
            }
            if entry.sender.is_none() && entry.receiver.is_none() {
                pairs.remove(&pair_id);
            }
        }
    }
    println!("connection closed{}", conn_id_clone)



}
