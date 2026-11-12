# Relay file transfer

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
