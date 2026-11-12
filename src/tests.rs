use super::*;
use futures_util::{SinkExt, StreamExt};
use hyper_util::{rt::TokioIo, service::TowerToHyperService};
use serde_json::{json, Value};
use tokio::io::DuplexStream;
use tokio_tungstenite::{client_async, tungstenite::Message as Frame, WebSocketStream};

type Client = WebSocketStream<DuplexStream>;

async fn connect(registry: &Registry) -> Client {
    let (client, server) = tokio::io::duplex(64 * 1024);
    let app = TowerToHyperService::new(router(registry.clone()));
    tokio::spawn(async move {
        hyper::server::conn::http1::Builder::new()
            .serve_connection(TokioIo::new(server), app)
            .with_upgrades()
            .await
            .unwrap();
    });
    let (mut client, _) = client_async("ws://localhost/ws", client).await.unwrap();
    let hello = event(&mut client, "hello").await;
    assert!(Uuid::parse_str(hello["endpoint_id"].as_str().unwrap()).is_ok());
    client
}

async fn send(client: &mut Client, command: Value) {
    client.send(Frame::Text(command.to_string())).await.unwrap();
}

async fn frame(client: &mut Client) -> Frame {
    loop {
        let frame = timeout(Duration::from_secs(3), client.next())
            .await
            .unwrap()
            .unwrap()
            .unwrap();
        if !frame.is_ping() {
            return frame;
        }
        client.flush().await.unwrap();
    }
}
async fn event(client: &mut Client, kind: &str) -> Value {
    let event: Value = serde_json::from_str(frame(client).await.to_text().unwrap()).unwrap();
    assert_eq!(event["type"], kind, "{event}");
    event
}
async fn create(sender: &mut Client, size: u64) -> String {
    send(
        sender,
        json!({"type":"create","name":"sample.bin","size":size}),
    )
    .await;
    event(sender, "created").await["transfer_id"]
        .as_str()
        .unwrap()
        .into()
}

#[tokio::test]
async fn websocket_transfer_requires_receiver_commit() {
    for size in [0, CHUNK_BYTES + 17] {
        let registry = Registry::default();
        let mut sender = connect(&registry).await;
        let mut receiver = connect(&registry).await;
        let id = create(&mut sender, size as u64).await;
        send(&mut receiver, json!({"type":"join","transfer_id":id})).await;
        event(&mut sender, "paired").await;
        assert_eq!(event(&mut receiver, "offer").await["size"], size);
        send(&mut receiver, json!({"type":"accept"})).await;
        event(&mut sender, "ready").await;
        let mut bytes = 0;
        for chunk in vec![0x5a; size].chunks(CHUNK_BYTES) {
            sender.send(Frame::Binary(chunk.into())).await.unwrap();
            assert_eq!(frame(&mut receiver).await.into_data(), chunk);
            bytes += chunk.len();
            send(&mut receiver, json!({"type":"written","bytes":bytes})).await;
            event(&mut sender, "written").await;
        }
        send(&mut sender, json!({"type":"finish"})).await;
        event(&mut receiver, "finish").await;
        assert!(registry.lock().unwrap()[&id].phase == Phase::Saving);
        send(&mut receiver, json!({"type":"saved"})).await;
        event(&mut sender, "complete").await;
        event(&mut receiver, "complete").await;
    }
}

#[tokio::test]
async fn occupied_role_disconnect_and_size_limit() {
    let registry = Registry::default();
    let mut sender = connect(&registry).await;
    let id = create(&mut sender, MAX_BYTES).await;
    let mut receiver = connect(&registry).await;
    send(&mut receiver, json!({"type":"join","transfer_id":id})).await;
    event(&mut receiver, "offer").await;
    event(&mut sender, "paired").await;
    let mut extra = connect(&registry).await;
    send(&mut extra, json!({"type":"join","transfer_id":id})).await;
    event(&mut extra, "error").await;
    receiver.close(None).await.unwrap();
    event(&mut sender, "error").await;
    assert!(registry.lock().unwrap().is_empty());
    let mut sender = connect(&registry).await;
    send(
        &mut sender,
        json!({"type":"create","name":"oversized","size":MAX_BYTES+1}),
    )
    .await;
    event(&mut sender, "error").await;
}

#[test]
fn final_terabyte_boundary_and_invalid_transitions() {
    let (out, _inbox) = mpsc::channel(8);
    let mut transfer = Transfer {
        sender: out.clone(),
        receiver: Some(out),
        phase: Phase::Streaming,
        name: "large".into(),
        size: MAX_BYTES,
        bytes: MAX_BYTES - 1,
    };
    assert!(transfer.advance(Role::Sender, Command::Finish).is_err());
    assert!(transfer.chunk(Role::Receiver, vec![1]).is_err());
    assert!(transfer.chunk(Role::Sender, vec![1, 2]).is_err());
    transfer.chunk(Role::Sender, vec![1]).unwrap();
    assert!(transfer
        .advance(Role::Receiver, Command::Written { bytes: 1 })
        .is_err());
    transfer
        .advance(Role::Receiver, Command::Written { bytes: MAX_BYTES })
        .unwrap();
    transfer.advance(Role::Sender, Command::Finish).unwrap();
    transfer.advance(Role::Receiver, Command::Saved).unwrap();
    assert!(transfer.phase == Phase::Complete);
}
