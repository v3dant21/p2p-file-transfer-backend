import {Phase} from "../lib/session";

const paths = {
  send: "M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5",
  receive: "M12 3v13m-5-5 5 5 5-5M4 15v5h16v-5",
  file: "M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h4",
  arrow: "M4 12h15m-5-5 5 5-5 5",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  moon: "M20 14a8.5 8.5 0 0 1-10-11 9 9 0 1 0 10 11z",
  logo: "M2 12 10 4h6l-8 8H2zm6 8 8-8h6l-8 8H8z"
};
export function Icon({name}) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill={name === "logo" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.65" strokeLinejoin="round" strokeLinecap="round"><path d={paths[name]}/></svg>;
}

function Endpoint({x, label, active}) {
  return <g transform={`translate(${x} 40)`} className={active ? "endpoint active" : "endpoint"}>
    {[14, 7, 0].map(offset => <path key={offset} transform={`translate(0 ${offset})`} d="M-32 0 0-17 32 0 0 17Z"/>)}
    <path className="chip" d="M-11 0 0-6 11 0 0 6Z"/>
    <text y="54" textAnchor="middle">{label}</text>
  </g>;
}

export function TransferRoute({phase, percent}) {
  const complete = phase === Phase.COMPLETE;
  const streaming = [Phase.STREAMING, Phase.SAVING, Phase.COMPLETE].includes(phase);
  return <svg className="route" viewBox="0 0 336 106" role="img" aria-label={streaming ? `Sender to receiver, ${percent}% transferred` : "Transfer route from sender to receiver"}>
    <path className="track" d="M60 48h216"/>
    <path className="trace" pathLength="100" strokeDasharray={`${streaming ? percent : 0} 101`} d="M60 48h216"/>
    {streaming && <circle className="packet" cx={60+216*percent/100} cy="48" r="4"/>}
    <Endpoint x={43} label="Sender" active={streaming}/>
    <Endpoint x={293} label="Receiver" active={complete}/>
  </svg>;
}
