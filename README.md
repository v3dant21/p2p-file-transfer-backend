# 📁 P2P File Transfer

A real-time peer-to-peer file transfer application. Users can send and receive files directly in their browser via WebSockets, powered by a **Rust + Axum** backend.

## 🔥 Features

- ✅ Real-time communication using **WebSockets**
- ✅ **Peer-to-peer (P2P)** file transfers
- ✅ Supports **large file** transfers via chunked binary messages
- ✅ Clean and minimal **UI/UX**
- ✅ Dark / Light theme toggle

## 🛠️ Technologies Used

- **Rust** – Backend language
- **Axum** – Web framework (with `tower-http` for static file serving and WebSocket support)
- **Tokio** – Async runtime
- **Vanilla JavaScript** – Frontend (served as static files)

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)

### Run the application

1. **Clone the repo**
   ```bash
   git clone https://github.com/v3dant21/p2p-file-transfer-backend
   cd p2p-file-transfer-backend
   ```

2. **Run the server**
   ```bash
   cargo run
   ```

3. **Open the app**
   Navigate to [http://localhost:8000](http://localhost:8000)

## 📆 Project Structure

```
src/           # Rust backend source code
static/        # Static frontend files (HTML, CSS, JS)
Cargo.toml     # Rust dependencies
```

## 🧹 How it works

- The sender visits the site, selects a file, and generates a unique transfer link.
- The recipient opens the link and enters the transfer ID to connect.
- Both parties connect via WebSocket to the Rust backend.
- File data is sent in binary chunks over the WebSocket connection.

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🙌 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open a pull request or issue.

## Current application

The Rust service serves the exported Next.js App Router application from `frontend/out`.
Build it before starting the relay:

```sh
npm ci --prefix frontend
npm run build --prefix frontend
cargo run --locked
```

Open http://localhost:8000. The sender creates a transfer and shares its receiver link.
Each socket gets a unique endpoint ID. The relay generates a separate single-use transfer ID
and binds the sender and receiver roles to their sockets. No database or file storage is required.

The limit is 1,000,000,000,000 bytes per file. One frame of up to 1 MiB is in flight at a time.
The receiver acknowledges each write and confirms completion after closing the destination.
Browsers with a secure-context file picker stream to disk. Other browsers can receive up to
32 MiB into a downloadable Blob. Their completion event means the download is ready.
Transfers require both tabs and sufficient destination storage. Disconnects and restarts
invalidate the link and require a fresh transfer.

The Render Blueprint builds the frontend and relay in one Docker image on the
`render-transfer` branch. Run a single instance because pairing lives in memory.
