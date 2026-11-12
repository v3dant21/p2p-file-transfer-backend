use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    time::Duration,
};
use tokio::{
    sync::mpsc,
    time::{interval, timeout, Instant},
};
use tower_http::services::ServeDir;
use uuid::Uuid;

const MAX_BYTES: u64 = 1_000_000_000_000;
const CHUNK_BYTES: usize = 1_048_576;
const HEARTBEAT: Duration = Duration::from_secs(20);
type Registry = Arc<Mutex<HashMap<String, Transfer>>>;
type Outbox = mpsc::Sender<Message>;
type Result<T> = std::result::Result<T, &'static str>;

#[derive(Clone, Copy, PartialEq)]
enum Role {
    Sender,
    Receiver,
}
#[derive(Clone, Copy, PartialEq)]
enum Phase {
    Waiting,
    Offered,
    Streaming,
    Writing,
    Saving,
    Complete,
}

/// A socket owns exactly one endpoint. Its role and route cannot be changed by a chunk.
struct Endpoint {
    transfer_id: String,
    role: Role,
}
/// The relay stores metadata and byte counters. File contents live only in bounded frames.
struct Transfer {
    sender: Outbox,
    receiver: Option<Outbox>,
    phase: Phase,
    name: String,
    size: u64,
    bytes: u64,
}

#[derive(Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum Command {
    Create { name: String, size: u64 },
    Join { transfer_id: String },
    Accept,
    Written { bytes: u64 },
    Finish,
    Saved,
}
#[derive(Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum Event<'a> {
    Hello {
        endpoint_id: &'a str,
        max_bytes: u64,
        chunk_bytes: usize,
    },
    Created {
        transfer_id: &'a str,
    },
    Paired,
    Offer {
        name: &'a str,
        size: u64,
    },
    Ready,
    Written {
        bytes: u64,
    },
    Finish,
    Complete,
    Error {
        message: &'a str,
    },
}

fn notify(out: &Outbox, event: Event) -> Result<()> {
    out.try_send(Message::Text(serde_json::to_string(&event).unwrap()))
        .map_err(|_| "Peer unavailable")
}

impl Transfer {
    fn receiver(&self) -> Result<&Outbox> {
        self.receiver.as_ref().ok_or("Receiver disconnected")
    }

    fn advance(&mut self, role: Role, command: Command) -> Result<()> {
        match (self.phase, role, command) {
            (Phase::Offered, Role::Receiver, Command::Accept) => {
                notify(&self.sender, Event::Ready)?;
                self.phase = Phase::Streaming;
            }
            (Phase::Writing, Role::Receiver, Command::Written { bytes }) if bytes == self.bytes => {
                notify(&self.sender, Event::Written { bytes })?;
                self.phase = Phase::Streaming;
            }
            (Phase::Streaming, Role::Sender, Command::Finish) if self.bytes == self.size => {
                notify(self.receiver()?, Event::Finish)?;
                self.phase = Phase::Saving;
            }
            (Phase::Saving, Role::Receiver, Command::Saved) => {
                notify(&self.sender, Event::Complete)?;
                notify(self.receiver()?, Event::Complete)?;
                self.phase = Phase::Complete;
            }
            _ => return Err("Unexpected transfer command"),
        }
        Ok(())
    }

    fn chunk(&mut self, role: Role, data: Vec<u8>) -> Result<()> {
        let end = self.bytes + data.len() as u64;
        if role != Role::Sender
            || self.phase != Phase::Streaming
            || data.is_empty()
            || data.len() > CHUNK_BYTES
            || end > self.size
        {
            return Err("Unexpected file chunk");
        }
        self.receiver()?
            .try_send(Message::Binary(data))
            .map_err(|_| "Receiver unavailable")?;
        self.bytes = end;
        self.phase = Phase::Writing;
        Ok(())
    }
}

fn handle(
    registry: &Registry,
    endpoint: &mut Option<Endpoint>,
    out: &Outbox,
    frame: Message,
) -> Result<()> {
    let mut transfers = registry.lock().unwrap();
    let command = match frame {
        Message::Text(text) if text.len() <= 4096 => {
            serde_json::from_str(&text).map_err(|_| "Invalid command")?
        }
        Message::Binary(data) => {
            let endpoint = endpoint.as_ref().ok_or("Register first")?;
            return transfers
                .get_mut(&endpoint.transfer_id)
                .ok_or("Transfer ended")?
                .chunk(endpoint.role, data);
        }
        _ => return Err("Invalid frame"),
    };
    match (endpoint.as_ref(), command) {
        (None, Command::Create { name, size })
            if size <= MAX_BYTES && !name.is_empty() && name.len() <= 1024 =>
        {
            let id = Uuid::new_v4().to_string();
            transfers.insert(
                id.clone(),
                Transfer {
                    sender: out.clone(),
                    receiver: None,
                    phase: Phase::Waiting,
                    name,
                    size,
                    bytes: 0,
                },
            );
            *endpoint = Some(Endpoint {
                transfer_id: id.clone(),
                role: Role::Sender,
            });
            notify(out, Event::Created { transfer_id: &id })
        }
        (None, Command::Join { transfer_id }) => {
            let transfer = transfers
                .get_mut(&transfer_id)
                .ok_or("Unknown or expired transfer ID")?;
            if transfer.phase != Phase::Waiting {
                return Err("Transfer already has a receiver");
            }
            transfer.receiver = Some(out.clone());
            transfer.phase = Phase::Offered;
            *endpoint = Some(Endpoint {
                transfer_id,
                role: Role::Receiver,
            });
            notify(&transfer.sender, Event::Paired)?;
            notify(
                out,
                Event::Offer {
                    name: &transfer.name,
                    size: transfer.size,
                },
            )
        }
        (Some(binding), command) => transfers
            .get_mut(&binding.transfer_id)
            .ok_or("Transfer ended")?
            .advance(binding.role, command),
        _ => Err("Invalid registration or file exceeds limit"),
    }
}

async fn connection(mut socket: WebSocket, registry: Registry) {
    let (out, mut inbox) = mpsc::channel(8);
    let id = Uuid::new_v4().to_string();
    let mut endpoint = None;
    let mut heartbeat = interval(HEARTBEAT);
    let mut last_seen = Instant::now();
    let _ = notify(
        &out,
        Event::Hello {
            endpoint_id: &id,
            max_bytes: MAX_BYTES,
            chunk_bytes: CHUNK_BYTES,
        },
    );
    loop {
        let frame = tokio::select! {
            Some(frame) = inbox.recv() => frame,
            _ = heartbeat.tick() => {
                if last_seen.elapsed() > HEARTBEAT * 3 { break; }
                Message::Ping(Vec::new())
            }
            incoming = socket.recv() => {
                last_seen = Instant::now();
                match incoming {
                    Some(Ok(Message::Pong(_))) => continue,
                    Some(Ok(Message::Ping(data))) => Message::Pong(data),
                    None | Some(Err(_)) | Some(Ok(Message::Close(_))) => break,
                    Some(Ok(frame)) => match handle(&registry, &mut endpoint, &out, frame) {
                        Ok(()) => continue,
                        Err(message) => {
                            let error = Message::Text(serde_json::to_string(&Event::Error {message}).unwrap());
                            let _ = timeout(HEARTBEAT, socket.send(error)).await;
                            break;
                        }
                    }
                }
            }
        };
        if !matches!(timeout(HEARTBEAT, socket.send(frame)).await, Ok(Ok(()))) {
            break;
        }
    }
    if let Some(binding) = endpoint {
        let mut transfers = registry.lock().unwrap();
        if let Some(transfer) = transfers.remove(&binding.transfer_id) {
            let peer = match binding.role {
                Role::Sender => transfer.receiver.as_ref(),
                Role::Receiver => Some(&transfer.sender),
            };
            if let Some(peer) = peer.filter(|_| transfer.phase != Phase::Complete) {
                let _ = notify(
                    peer,
                    Event::Error {
                        message: "Peer disconnected. Start a new transfer.",
                    },
                );
            }
        }
    }
}

async fn upgrade(ws: WebSocketUpgrade, State(registry): State<Registry>) -> impl IntoResponse {
    ws.max_message_size(CHUNK_BYTES)
        .max_frame_size(CHUNK_BYTES)
        .on_upgrade(move |socket| connection(socket, registry))
}

fn router(registry: Registry) -> Router {
    Router::new()
        .route("/ws", get(upgrade))
        .route("/healthz", get(|| async { "ok" }))
        .fallback_service(ServeDir::new("frontend/out"))
        .with_state(registry)
}

#[tokio::main]
async fn main() {
    let app = router(Registry::default());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests;
