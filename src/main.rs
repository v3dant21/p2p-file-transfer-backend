use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use serde::Deserialize;
use std::{collections::HashMap, sync::Arc, time::Duration};
use tokio::sync::{mpsc, Mutex};
use tower_http::services::ServeDir;

type Endpoint = mpsc::Sender<Message>;
#[derive(Default)]
struct Pair {
    sender: Option<Endpoint>,
    receiver: Option<Endpoint>,
}
type Rooms = Arc<Mutex<HashMap<String, Pair>>>;

#[derive(Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
enum Role {
    Sender,
    Receiver,
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Registration {
    #[serde(rename = "type")]
    kind: String,
    connection_id: String,
    role: Role,
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/ws", get(upgrade))
        .route("/healthz", get(|| async { "ok" }))
        .fallback_service(ServeDir::new("static"))
        .with_state(Rooms::default());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".to_owned());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn upgrade(ws: WebSocketUpgrade, State(rooms): State<Rooms>) -> impl IntoResponse {
    ws.max_message_size(128 * 1024)
        .max_frame_size(128 * 1024)
        .on_upgrade(move |socket| relay(socket, rooms))
}

async fn relay(mut socket: WebSocket, rooms: Rooms) {
    let Ok(Some(Ok(Message::Text(text)))) =
        tokio::time::timeout(Duration::from_secs(15), socket.recv()).await
    else {
        return;
    };
    let Ok(reg) = serde_json::from_str::<Registration>(&text) else {
        return;
    };
    let id = reg
        .connection_id
        .split_once("?id=")
        .map_or(reg.connection_id.as_str(), |(_, id)| id);
    if reg.kind != "register"
        || id.is_empty()
        || id.len() > 128
        || !id.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'-')
    {
        return;
    }

    let (tx, mut outgoing) = mpsc::channel(16);
    let ready = {
        let mut rooms = rooms.lock().await;
        let pair = rooms.entry(id.to_owned()).or_default();
        let slot = match reg.role {
            Role::Sender => &mut pair.sender,
            Role::Receiver => &mut pair.receiver,
        };
        if slot.is_some() {
            return;
        }
        *slot = Some(tx.clone());
        pair.receiver.as_ref().and(pair.sender.clone())
    };
    if let Some(sender) = ready {
        let _ = sender
            .send(Message::Text(r#"{"type":"recipient_connected"}"#.into()))
            .await;
    }
    let (mut sink, mut stream) = socket.split();
    let write = async {
        let mut ping = tokio::time::interval(Duration::from_secs(30));
        loop {
            let msg = tokio::select! {
                msg = outgoing.recv() => match msg { Some(msg) => msg, None => break },
                _ = ping.tick() => Message::Ping(Vec::new()),
            };
            let close = matches!(msg, Message::Close(_));
            if sink.send(msg).await.is_err() || close {
                break;
            }
        }
    };
    let read = async {
        while let Some(Ok(msg)) = stream.next().await {
            match msg {
                Message::Close(_) => break,
                Message::Text(_) | Message::Binary(_) => {}
                _ => continue,
            }
            let peer = {
                let rooms = rooms.lock().await;
                rooms.get(id).and_then(|pair| {
                    let (own, other) = match reg.role {
                        Role::Sender => (&pair.sender, &pair.receiver),
                        Role::Receiver => (&pair.receiver, &pair.sender),
                    };
                    own.as_ref()
                        .filter(|slot| slot.same_channel(&tx))
                        .and(other.clone())
                })
            };
            let Some(peer) = peer else { break };
            if peer.send(msg).await.is_err() {
                break;
            }
        }
    };
    tokio::select! { _ = write => {}, _ = read => {} }
    let peer = {
        let mut rooms = rooms.lock().await;
        let Some(pair) = rooms.get_mut(id) else {
            return;
        };
        let (own, peer) = match reg.role {
            Role::Sender => (&mut pair.sender, &pair.receiver),
            Role::Receiver => (&mut pair.receiver, &pair.sender),
        };
        if !own.as_ref().is_some_and(|slot| slot.same_channel(&tx)) {
            return;
        }
        let peer = peer.clone();
        rooms.remove(id);
        peer
    };
    if let Some(peer) = peer {
        let _ = peer.send(Message::Close(None)).await;
    }
}
