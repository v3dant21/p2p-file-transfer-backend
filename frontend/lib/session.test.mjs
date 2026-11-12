import {test} from "node:test";
import assert from "node:assert/strict";
import {Session, Phase} from "./session.js";

globalThis.location = new URL("https://relay.example");
globalThis.window = globalThis;
globalThis.WebSocket = class {
  static OPEN = 1;
  readyState = 1;
  frames = [];
  send(data) { this.frames.push(data); }
  close() { this.readyState = 3; }
};
const message = (client, type, fields = {}) => client.receive(JSON.stringify({type, ...fields}));
const hello = client => message(client, "hello", {chunk_bytes: 2, max_bytes: 1e12, endpoint_id: "test"});

test("disk receiver acknowledges bytes after write and completion after close", async () => {
  const receiver = new Session(() => {});
  let writeDone, closeDone;
  window.showSaveFilePicker = async () => ({createWritable: async () => ({
    write: () => new Promise(resolve => {writeDone = resolve;}),
    close: () => new Promise(resolve => {closeDone = resolve;})
  })});
  await hello(receiver);
  receiver.join("test");
  await message(receiver, "offer", {size: 2, name: "example"});
  await receiver.accept();
  const writing = receiver.receive(new Uint8Array([9, 8]).buffer);
  assert.equal(receiver.view.bytes, 0);
  writeDone();
  await writing;
  assert.deepEqual(JSON.parse(receiver.socket.frames.at(-1)), {type: "written", bytes: 2});
  const saving = message(receiver, "finish");
  assert.equal(receiver.view.phase, Phase.SAVING);
  assert.equal(JSON.parse(receiver.socket.frames.at(-1)).type, "written");
  closeDone();
  await saving;
  assert.equal(JSON.parse(receiver.socket.frames.at(-1)).type, "saved");
});

test("sender waits for write credits and remote completion", async () => {
  const sender = new Session(() => {});
  await hello(sender);
  sender.create(new File(["abc"], "example"));
  await message(sender, "ready");
  assert.equal(sender.socket.frames.at(-1).byteLength, 2);
  await message(sender, "written", {bytes: 2});
  assert.equal(sender.socket.frames.at(-1).byteLength, 1);
  await message(sender, "written", {bytes: 3});
  assert.equal(sender.view.phase, Phase.SAVING);
  await message(sender, "complete");
  assert.equal(sender.view.phase, Phase.COMPLETE);
});
