import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "./TimerDisplay.css";

const MAX_PARTICLES = 6;

// 12 stars only — subtle background twinkle
const STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() < 0.2 ? 2 : 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  dur: (4 + Math.random() * 4).toFixed(2),
  delay: (-Math.random() * 6).toFixed(2),
  op: (0.2 + Math.random() * 0.4).toFixed(2),
}));

// Static tick marks (60 around the ring)
const TickMarks = React.memo(function TickMarks() {
  const ticks = useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const is5 = i % 5 === 0;
      const outerR = 49;
      const innerR = is5 ? 44 : 47;
      items.push(
        <line
          key={i}
          x1={(50 + innerR * Math.cos(rad)).toFixed(2)}
          y1={(50 + innerR * Math.sin(rad)).toFixed(2)}
          x2={(50 + outerR * Math.cos(rad)).toFixed(2)}
          y2={(50 + outerR * Math.sin(rad)).toFixed(2)}
          stroke={is5 ? "rgba(52, 211, 153, 0.35)" : "rgba(255,255,255,0.08)"}
          strokeWidth={is5 ? 1.2 : 0.4}
        />,
      );
    }
    return items;
  }, []);

  return (
    <svg className="fct-ticks" viewBox="0 0 100 100">
      {ticks}
    </svg>
  );
});

// Stars background
const StarsLayer = React.memo(function StarsLayer() {
  return STARS.map((s) => (
    <div
      key={s.id}
      className="fct-star"
      style={{
        width: s.size,
        height: s.size,
        top: `${s.top}%`,
        left: `${s.left}%`,
        "--dur": `${s.dur}s`,
        "--delay": `${s.delay}s`,
        "--op": s.op,
      }}
    />
  ));
});

// Single particle element
const Particle = React.memo(function Particle({ style }) {
  return <div className="fct-particle" style={style} />;
});

let particleIdCounter = 0;

const TimerDisplay = React.memo(function TimerDisplay({
  time,
  isRunning,
  formatTime,
}) {
  const [particles, setParticles] = useState([]);
  const intervalRef = useRef(null);

  // Spawn particles around the ring when running
  const spawnParticle = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const r = 42 + Math.random() * 15; // percent-based around ring
    const dx = (Math.random() - 0.5) * 40;
    const id = ++particleIdCounter;

    const style = {
      left: `${50 + r * Math.cos(angle)}%`,
      top: `${50 + r * Math.sin(angle)}%`,
      "--dur": `${(3 + Math.random() * 3).toFixed(1)}s`,
      "--delay": "0s",
      "--x1": `${(dx * 0.3).toFixed(1)}px`,
      "--y1": `${(-8 - Math.random() * 10).toFixed(1)}px`,
      "--x2": `${(dx * 0.6).toFixed(1)}px`,
      "--y2": `${(-20 - Math.random() * 15).toFixed(1)}px`,
      "--x3": `${dx.toFixed(1)}px`,
      "--y3": `${(-35 - Math.random() * 20).toFixed(1)}px`,
    };

    setParticles((prev) => {
      const next = [...prev, { id, style }];
      return next.length > MAX_PARTICLES ? next.slice(-MAX_PARTICLES) : next;
    });

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(spawnParticle, 900);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, spawnParticle]);

  const on = isRunning;

  return (
    <div className={`fct-root ${on ? "is-running" : ""}`}>
      {/* Subtle stars */}
      <StarsLayer />

      {/* Main scene */}
      <div className="fct-scene">
        {/* Background glow */}
        <div className="fct-glow" />

        {/* Particles container */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {particles.map((p) => (
            <Particle key={p.id} style={p.style} />
          ))}
        </div>

        {/* Ring SVG */}
        <svg className="fct-ring-svg" viewBox="0 0 100 100">
          {/* Track ring */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1.2"
          />

          {/* Progress ring (now static/minimalist) */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#timer-progress-grad)"
            strokeWidth="1.5"
            strokeOpacity={on ? 0.8 : 0.2}
            style={{
              transition: "stroke-opacity 0.8s ease",
            }}
          />

          {/* Hour marks (12 dots) */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={(50 + 46 * Math.cos(a)).toFixed(2)}
                cy={(50 + 46 * Math.sin(a)).toFixed(2)}
                r={i === 0 ? 1.2 : 0.7}
                fill={
                  i === 0
                    ? "rgba(52, 211, 153, 0.9)"
                    : "rgba(52, 211, 153, 0.25)"
                }
              />
            );
          })}

          <defs>
            <linearGradient
              id="timer-progress-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tick marks */}
        <TickMarks />

        {/* Center glass dial */}
        <div className="fct-dial">
          <div className="fct-dial-inner">
            <div className={`fct-mode-label${on ? " on" : ""}`}>
              {on ? "FOCUSING" : "READY"}
            </div>
            <div className={`fct-time${on ? " on" : ""}`}>
              {formatTime(time)}
            </div>
            <div className={`fct-badge${on ? " on" : ""}`}>
              <div className="fct-pulse-dot" />
              <span className="fct-badge-text">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TimerDisplay;