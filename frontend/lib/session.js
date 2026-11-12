// The relay announces its file and frame limits on every new socket.
export const Phase = Object.freeze({
  CONNECTING: "Connecting", IDLE: "Ready", REGISTERING: "Registering",
  WAITING: "Waiting for receiver", PAIRED: "Receiver choosing destination",
  OFFERED: "Choose destination", OPENING: "Opening destination",
  STREAMING: "Transferring", SAVING: "Finalizing", COMPLETE: "Complete", ERROR: "Interrupted"
});
export const MEMORY_LIMIT = 32 * 1024 * 1024;

export class Session {
  constructor(update) {
    this.update = update;
    this.view = {phase: Phase.CONNECTING, bytes: 0, size: 0, name: "", transfer_id: "", error: ""};
    this.parts = [];
    this.closed = false;
    const url = new URL("/ws", location.href);
    url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer";
    this.socket.onmessage = ({data}) => this.receive(data).catch(error => this.fail(error.message));
    this.socket.onerror = () => this.fail("Could not reach the relay.");
    this.socket.onclose = () => {
      if (this.view.phase !== Phase.COMPLETE) this.fail("Connection closed. Start a new transfer.");
    };
  }
  set(phase, fields = {}) {
    if (this.closed) return;
    this.view = {...this.view, ...fields, phase};
    this.update(this.view);
  }
  send(type, fields = {}) {
    if (this.closed) return;
    if (this.socket.readyState !== WebSocket.OPEN) return this.fail("Connection closed. Start a new transfer.");
    this.socket.send(JSON.stringify({type, ...fields}));
  }
  create(file) {
    if (this.view.phase !== Phase.IDLE) return;
    if (file.size > this.view.max_bytes) return this.fail("File exceeds the 1 TB limit.");
    this.file = file;
    this.set(Phase.REGISTERING, {name: file.name, size: file.size});
    this.send("create", {name: file.name, size: file.size});
  }
  join(transfer_id) {
    if (this.view.phase !== Phase.IDLE) return;
    this.set(Phase.REGISTERING, {transfer_id});
    this.send("join", {transfer_id});
  }
  async accept() {
    if (this.view.phase !== Phase.OFFERED) return;
    this.set(Phase.OPENING);
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({suggestedName: this.view.name.replace(/[\\/]/g, "_")});
        if (this.closed) return;
        const writer = await handle.createWritable();
        if (this.closed) return writer.abort();
        this.writer = writer;
      } else if (this.view.size > MEMORY_LIMIT) {
        throw new Error("For files over 32 MiB, open this link in a browser with Save-to-disk support.");
      }
      this.set(Phase.STREAMING);
      this.send("accept");
    } catch (error) {
      if (error.name === "AbortError") this.set(Phase.OFFERED);
      else this.fail(error.message);
    }
  }
  async nextChunk() {
    const {bytes, size} = this.view;
    if (bytes === size) {
      this.set(Phase.SAVING);
      this.send("finish");
      return;
    }
    const buffer = await this.file.slice(bytes, bytes + this.chunkBytes).arrayBuffer();
    if (!this.closed) this.socket.send(buffer);
  }
  async receive(data) {
    if (this.closed) return;
    if (data instanceof ArrayBuffer) {
      const bytes = this.view.bytes + data.byteLength;
      if (this.view.phase !== Phase.STREAMING || bytes > this.view.size) throw Error("Unexpected file data.");
      if (this.writer) await this.writer.write(data);
      else this.parts.push(data);
      this.set(Phase.STREAMING, {bytes});
      this.send("written", {bytes});
      return;
    }
    const msg = JSON.parse(data);
    switch (msg.type) {
      case "hello":
        this.chunkBytes = msg.chunk_bytes;
        return this.set(Phase.IDLE, {endpoint_id: msg.endpoint_id, max_bytes: msg.max_bytes});
      case "created": return this.set(Phase.WAITING, {transfer_id: msg.transfer_id});
      case "paired": return this.set(Phase.PAIRED);
      case "offer": return this.set(Phase.OFFERED, {name: msg.name, size: msg.size});
      case "ready": this.set(Phase.STREAMING); return this.nextChunk();
      case "written": this.set(Phase.STREAMING, {bytes: msg.bytes}); return this.nextChunk();
      case "finish":
        if (this.view.bytes !== this.view.size) throw Error("Incomplete file.");
        this.set(Phase.SAVING);
        if (this.writer) {
          await this.writer.close();
          this.writer = null;
        } else {
          this.download = URL.createObjectURL(new Blob(this.parts));
          this.parts = [];
        }
        return this.send("saved");
      case "complete": return this.set(Phase.COMPLETE, {download: this.download});
      case "error": return this.fail(msg.message);
      default: throw Error("Unrecognized relay response.");
    }
  }
  fail(message) {
    this.set(Phase.ERROR, {error: message});
    this.close();
  }
  close() {
    this.closed = true;
    this.socket.onclose = this.socket.onerror = this.socket.onmessage = null;
    this.socket.close();
    this.writer?.abort().catch(() => {});
    this.writer = this.file = null;
    this.parts = [];
    if (this.download) URL.revokeObjectURL(this.download);
  }
}
