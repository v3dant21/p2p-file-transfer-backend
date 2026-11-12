"use client";
import {useEffect, useRef, useState} from "react";
import {Session, Phase, MEMORY_LIMIT} from "../lib/session";

import {Icon, SignalField, TransferRoute} from "./visuals";

const Page = Object.freeze({HOME: "home", SEND: "send", RECEIVE: "receive"});
const blank = {phase: Phase.CONNECTING, bytes: 0, size: 0};
const units = ["B", "kB", "MB", "GB", "TB"];
function sizeLabel(bytes) {
  const index = bytes ? Math.min(4, Math.floor(Math.log10(bytes) / 3)) : 0;
  return new Intl.NumberFormat("en", {maximumFractionDigits: 2}).format(bytes / 1000 ** index) + " " + units[index];
}

export default function TransferPage() {
  const session = useRef(null);
  const [view, setView] = useState(blank);
  const [page, setPage] = useState(Page.HOME);
  const [attempt, setAttempt] = useState(0);
  const [id, setId] = useState("");
  const [theme, setTheme] = useState("light");
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const syncRoute = () => {
      const url = new URL(location.href);
      setPage(url.searchParams.has("id") ? Page.RECEIVE : Object.values(Page).includes(url.hash.slice(1)) ? url.hash.slice(1) : Page.HOME);
      setId(url.searchParams.get("id") || "");
      setFile(null); setDrag(false); setCopied(""); setAttempt(n => n + 1);
    };
    syncRoute();
    setTheme(localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
    window.addEventListener("popstate", syncRoute);
    const restore = event => { if (event.persisted) syncRoute(); };
    window.addEventListener("pageshow", restore);
    return () => {
      window.removeEventListener("popstate", syncRoute);
      window.removeEventListener("pageshow", restore);
    };
  }, []);

  useEffect(() => {
    if (!attempt) return;
    setView(blank);
    const linkId = new URL(location.href).searchParams.get("id");
    const client = new Session(state => {
      setView(state);
      if (state.phase === Phase.IDLE && linkId) client.join(linkId);
    });
    session.current = client;
    const exit = () => client.close();
    window.addEventListener("pagehide", exit);
    return () => { window.removeEventListener("pagehide", exit); client.close(); };
  }, [attempt]);
  useEffect(() => {document.documentElement.dataset.theme = theme;}, [theme]);

  function navigate(next) {
    history.pushState(null, "", next === Page.HOME ? "/" : "/#" + next);
    // Keep the open, unbound endpoint when navigating between the initial screens.
    if (view.phase !== Phase.IDLE && view.phase !== Phase.CONNECTING) setAttempt(n => n + 1);
    setPage(next); setFile(null); setId(""); setCopied(""); setDrag(false);
  }
  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("theme", next);
  }
  const idle = [Phase.IDLE, Phase.CONNECTING].includes(view.phase);
  const link = view.transfer_id && typeof window !== "undefined" ? location.origin + "/?id=" + view.transfer_id : "";
  const percent = view.size ? Math.floor(100 * view.bytes / view.size) : Number(view.phase === Phase.COMPLETE) * 100;
  function start(role) {
    history.pushState(null, "", "/#" + role);
    setPage(role);
    if (role === Page.SEND) return session.current.create(file);
    let value = id.trim();
    try { value = new URL(value).searchParams.get("id") || value; } catch {}
    session.current.join(value);
  }
  const setup = idle || (page === Page.HOME && view.phase === Phase.ERROR);
  const ready = view.phase === Phase.IDLE;
  const progressing = [Phase.STREAMING, Phase.SAVING, Phase.COMPLETE].includes(view.phase);
  const sendForm = <form className="task" onSubmit={e => {e.preventDefault(); start(Page.SEND);}}>
    <h2><Icon name="send"/>Send a file</h2>
    <p>Choose a file to create a receiver link.</p>
    <label className={"picker" + (drag ? " over" : "")} onDragOver={e => {e.preventDefault(); setDrag(true);}}
      onDragLeave={() => setDrag(false)} onDrop={e => {e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0] || null);}}>
      <input aria-label="Choose a file" type="file" onChange={e => setFile(e.target.files[0] || null)}/>
      <span className="file-icon" key={file?.name || "empty"}><Icon name="file"/></span>
      <span><strong>{file?.name || "Choose a file"}</strong><small>{file ? sizeLabel(file.size) : "or drag and drop it here"}</small></span>
    </label>
    <button className="action" disabled={!ready || !file}>Create link <Icon name="arrow"/></button>
  </form>;
  const receiveForm = <form className="task" onSubmit={e => {e.preventDefault(); start(Page.RECEIVE);}}>
    <h2><Icon name="receive"/>Receive a file</h2>
    <p>Join with the link or ID from the sender.</p>
    <label className="field">Transfer link or ID<input required value={id} placeholder="Paste link or ID" onChange={e => setId(e.target.value)}/></label>
    <button className="action" disabled={!ready || !id.trim()}>Join transfer <Icon name="arrow"/></button>
  </form>;
  return <main>
    <header><button className="brand" onClick={() => navigate(Page.HOME)}><Icon name="logo"/>Relay</button>
      <div className="tools"><span className="connection" data-state={view.phase === Phase.ERROR ? "error" : view.phase === Phase.CONNECTING ? "pending" : "online"}>
        <i/>{view.phase === Phase.ERROR ? "Interrupted" : view.phase === Phase.CONNECTING ? "Connecting" : "Connected"}</span>
      <button className="theme" onClick={changeTheme} aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"}><Icon name={theme === "dark" ? "sun" : "moon"}/></button></div>
    </header>
    <article><div className="intro"><div><h1>File transfer</h1><p>Share one file, up to 1 TB.</p></div><TransferRoute phase={view.phase} percent={percent}/></div>
      {setup && <div className={"workspace" + (page === Page.HOME ? "" : " single")}>
        {page !== Page.RECEIVE && sendForm}{page !== Page.SEND && receiveForm}
      </div>}
      {!setup && <section className="workspace live"><h2>{page === Page.SEND ? "Outgoing file" : "Incoming file"}</h2>
        {view.name && <div className="file-row"><Icon name="file"/><strong>{view.name}</strong><small>{sizeLabel(view.size)}</small></div>}
        <div role="status" className="phase">{view.error || view.phase}</div>
        {page === Page.SEND && link && view.phase === Phase.WAITING && <><label className="field">Receiver link<input readOnly value={link} onFocus={e => e.target.select()}/></label>
          <button className="action" onClick={async () => {try {await navigator.clipboard.writeText(link); setCopied("Copied");} catch {setCopied("Select and copy the link");}}}>{copied || "Copy link"}</button></>}
        {view.phase === Phase.OFFERED && <><p>{window.showSaveFilePicker ? "Choose where to save your file." : "This browser supports downloads up to 32 MiB. Larger files need direct disk saving."}</p>
          <button className="action" disabled={!window.showSaveFilePicker && view.size > MEMORY_LIMIT} onClick={() => session.current.accept()}>Accept file</button></>}
        {progressing && <><progress aria-label="Acknowledged transfer progress" max="100" value={percent}/><small>{percent}% · {sizeLabel(view.bytes)} of {sizeLabel(view.size)}</small></>}
        {view.download && <a className="action" href={view.download} download={view.name}>Download file</a>}
      </section>}
      {page !== Page.HOME && <button className="back" onClick={() => navigate(Page.HOME)}>{progressing && view.phase !== Phase.COMPLETE ? "Cancel transfer" : "Back to transfers"}</button>}
      {page === Page.HOME && view.phase === Phase.ERROR && <div role="alert"><p>{view.error}</p><button className="action" onClick={() => setAttempt(n => n + 1)}>Reconnect</button></div>}
      <aside><h2>During a transfer</h2><p>Keep both tabs open until the receiver confirms completion. For files larger than 32 MiB, use a receiving browser that can save directly to disk.</p></aside>
      {page === Page.HOME && view.phase === Phase.IDLE && <SignalField/>}
    </article></main>;
}
