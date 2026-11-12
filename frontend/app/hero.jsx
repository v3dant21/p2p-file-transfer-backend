"use client";
import {useEffect, useRef} from "react";
import {Icon} from "./visuals";

const flight = "M80 171 C194 171 217 44 345 44 S497 171 620 171";

export function TransferHero({onSend, onReceive}) {
  const section = useRef(null);
  const stage = useRef(null);
  const track = useRef(null);
  const sheet = useRef(null);
  const trail = useRef(null);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const length = track.current.getTotalLength();
    let frame = 0;
    function render() {
      frame = 0;
      const bounds = section.current.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - stage.current.offsetHeight);
      const progress = motion.matches ? 0.5 : Math.max(0, Math.min(1, -bounds.top / travel));
      const point = track.current.getPointAtLength(progress * length);
      sheet.current.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${-10 + progress * 20})`);
      trail.current.setAttribute("stroke-dashoffset", String(100 - 100 * progress));
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }
    render();
    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return <section className="flight-hero" aria-labelledby="hero-title" ref={section}>
    <div className="flight-stage" ref={stage}>
      <div className="flight-copy">
        <h1 id="hero-title">Send a file.<br/><em>Share a link.</em></h1>
        <p>Transfer up to 1 TB between two browsers.</p>
        <div className="hero-actions">
          <button className="action" onClick={onSend}><Icon name="send"/>Send a file</button>
          <button className="action" onClick={onReceive}><Icon name="receive"/>Receive a file</button>
        </div>
      </div>
      <svg className="flight-scene" viewBox="0 0 700 222" aria-hidden="true" focusable="false">
        <g className="flight-contours">{[-3,-2,-1,0,1,2,3].map(band =>
          <path key={band} d={`M0 ${175 + band*3} C192 ${175 + band*3} 217 ${44 + band*8} 345 ${44 + band*8} S501 ${171 - band*3} 700 ${171 - band*3}`}/>
        )}</g>
        <path className="flight-guide" ref={track} d={flight}/>
        <path className="flight-trail" ref={trail} d={flight} pathLength="100" strokeDasharray="100" strokeDashoffset="100"/>
        {[80,620].map((x,i) => <g key={x} transform={`translate(${x} 171)`} className="flight-port">
          <ellipse rx="23" ry="6"/><circle r="3"/><text y="29" textAnchor="middle">{i ? "Receiver" : "Sender"}</text>
        </g>)}
        <g ref={sheet} transform="translate(80 171) rotate(-10)" className="flight-file">
          <path d="M-20-45H5l14 14V0h-39z"/><path d="M5-44v14h13M-12-20H9m-21 7H3"/>
        </g>
      </svg>
    </div>
  </section>;
}
