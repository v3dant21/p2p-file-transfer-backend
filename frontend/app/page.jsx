"use client";
import {useEffect, useRef, useState} from "react";
import {Session, Phase, MEMORY_LIMIT} from "../lib/session";

const Page = Object.freeze({HOME: "home", SEND: "send", RECEIVE: "receive"});
const blank = {phase: Phase.CONNECTING, bytes: 0, size: 0};
const sizeLabel = n => new Intl.NumberFormat("en", {style:"unit", unit: n < 1e6 ? "byte" : "megabyte", maximumFractionDigits:2}).format(n < 1e6 ? n : n / 1e6);

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
  return <main>
    <header><button className="brand" onClick={() => navigate(Page.HOME)}>↗ Relay</button>
      <button className="quiet" onClick={changeTheme}>{theme === "dark" ? "Light" : "Dark"} theme</button></header>
    <article><div className="eyebrow">FILE TRANSFER</div>
      <h1>{page === Page.HOME ? <>Send a file.<br/>Share a link.</> : page === Page.SEND ? "Send a file." : "Receive a file."}</h1>
      {page === Page.HOME ? <><p>Transfer one file up to 1 TB. Keep both tabs open until the receiver confirms completion.</p>
        <div className="actions"><button onClick={() => navigate(Page.SEND)}>Send a file ↗</button><button className="secondary" onClick={() => navigate(Page.RECEIVE)}>Receive a file ↓</button></div></> :
      <section>
        {idle && page === Page.SEND && <><label className={"drop " + (drag ? "over" : "")} onDragOver={e => {e.preventDefault(); setDrag(true);}} onDragLeave={() => setDrag(false)} onDrop={e => {e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0] || null);}}>
          <input type="file" onChange={e => setFile(e.target.files[0] || null)}/><strong>{file?.name || "Choose a file or drop it here"}</strong><small>{file ? sizeLabel(file.size) : "Single file · Up to 1 TB"}</small></label>
          <button disabled={!file || view.phase !== Phase.IDLE} onClick={() => session.current.create(file)}>Create transfer link ↗</button></>}
        {idle && page === Page.RECEIVE && <form onSubmit={e => {e.preventDefault(); let value = id.trim(); try {value = new URL(value).searchParams.get("id") || value;} catch {} session.current.join(value);}}>
          <label>Transfer ID or link<input required value={id} onChange={e => setId(e.target.value)} placeholder="Paste the sender’s link"/></label><button disabled={!id.trim() || view.phase !== Phase.IDLE}>Join transfer →</button></form>}
        {page === Page.SEND && link && view.phase === Phase.WAITING && <><label>Receiver link<input readOnly value={link} onFocus={e => e.target.select()}/></label>
          <button onClick={async () => {try {await navigator.clipboard.writeText(link); setCopied("Copied");} catch {setCopied("Select and copy the link above");}}}>{copied || "Copy link"}</button></>}
        {view.name && !idle && <p className="filename">{view.name} · {sizeLabel(view.size)}</p>}
        {view.phase === Phase.OFFERED && <><p>{typeof window.showSaveFilePicker === "function" ? "Choose where to save the incoming file." : "This browser supports downloads up to 32 MiB. Larger files require a browser with direct disk saving."}</p>
          <button disabled={!window.showSaveFilePicker && view.size > MEMORY_LIMIT} onClick={() => session.current.accept()}>Accept file ↓</button></>}
        {[Phase.STREAMING,Phase.SAVING,Phase.COMPLETE].includes(view.phase) && <><progress max="100" value={percent}/><small>{percent}% · {sizeLabel(view.bytes)} of {sizeLabel(view.size)}</small></>}
        {view.download && <a className="download" href={view.download} download={view.name}>Download file ↓</a>}
      </section>}
      <div role="status" className="status"><i/>{view.error || view.phase}</div>
      {page !== Page.HOME && <button className="quiet back" onClick={() => navigate(Page.HOME)}>← Back to home</button>}
      {page === Page.HOME && view.phase === Phase.ERROR && <button onClick={() => setAttempt(n => n + 1)}>Reconnect</button>}
    </article><footer>Relay <span>Browser-to-browser file transfer via WebSocket</span></footer>
  </main>;
}
