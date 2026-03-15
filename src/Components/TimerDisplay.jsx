import React, { useState, useRef, useEffect } from 'react';
// ✨ IMPORT THE CSS FILE DIRECTLY HERE
import './TimerDisplay.css';

// Calculate progress sweep (60 second rotation)
const TOTAL_CIRC = 2 * Math.PI * 180;

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  size: Math.random() < 0.15 ? 2 : 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  dur: (3 + Math.random() * 5).toFixed(2),
  delay: (-Math.random() * 8).toFixed(2),
  op: (0.28 + Math.random() * 0.5).toFixed(2),
}));

function CornerBracket({ pos }) {
  return (
    <svg className={`fct-corner ${pos}`} viewBox="0 0 56 56" fill="none">
      <path d="M2 38 L2 2 L38 2" stroke="rgba(52, 211, 153, 0.85)" strokeWidth="1.5" />
      <circle cx="2" cy="2" r="2" fill="rgba(52, 211, 153, 0.85)" />
      <line x1="2" y1="18" x2="8" y2="18" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.8" />
      <line x1="18" y1="2" x2="18" y2="8" stroke="rgba(52, 211, 153, 0.4)" strokeWidth="0.8" />
    </svg>
  );
}

function TickMarks() {
  const ticks = [];
  const cx = 140, cy = 140, outerR = 135;
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const is5 = i % 5 === 0;
    const r1 = is5 ? 123 : 129;
    ticks.push(
      <line
        key={i}
        x1={(cx + r1 * Math.cos(angle)).toFixed(2)}
        y1={(cy + r1 * Math.sin(angle)).toFixed(2)}
        x2={(cx + outerR * Math.cos(angle)).toFixed(2)}
        y2={(cy + outerR * Math.sin(angle)).toFixed(2)}
        stroke={is5 ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255,255,255,0.1)'}
        strokeWidth={is5 ? 1.5 : 0.5}
      />
    );
  }
  return <svg className="fct-ticks" viewBox="0 0 280 280">{ticks}</svg>;
}

function RingDots() {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const r = 180;
    return (
      <circle
        key={i}
        cx={(190 + r * Math.cos(angle)).toFixed(2)}
        cy={(190 + r * Math.sin(angle)).toFixed(2)}
        r={i === 0 ? 3 : 1.8}
        fill={i === 0 ? 'rgba(52, 211, 153, 0.9)' : 'rgba(52, 211, 153, 0.3)'}
      />
    );
  });
}

const TimerDisplay = ({ time, isRunning, formatTime }) => {
  const particleContainerRef = useRef(null);
  const particleIntervalRef = useRef(null);

  // Particles
  useEffect(() => {
    if (isRunning) {
      particleIntervalRef.current = setInterval(() => {
        if (!particleContainerRef.current) return;
        const p = document.createElement('div');
        p.className = 'fct-particle';
        const angle = Math.random() * Math.PI * 2;
        const r = 110 + Math.random() * 60;
        const dx = (Math.random() - 0.5) * 60;
        p.style.cssText = `
          left: ${190 + r * Math.cos(angle)}px;
          top:  ${190 + r * Math.sin(angle)}px;
          --dur: ${(3 + Math.random() * 4).toFixed(1)}s;
          --delay: 0s;
          --x1: ${(dx * 0.3).toFixed(1)}px; --y1: ${(-10 - Math.random() * 12).toFixed(1)}px;
          --x2: ${(dx * 0.7).toFixed(1)}px; --y2: ${(-28 - Math.random() * 20).toFixed(1)}px;
          --x3: ${dx.toFixed(1)}px;         --y3: ${(-50 - Math.random() * 30).toFixed(1)}px;
        `;
        particleContainerRef.current.appendChild(p);
        setTimeout(() => p.remove(), 7500);
      }, 550);
    } else {
      clearInterval(particleIntervalRef.current);
    }
    return () => clearInterval(particleIntervalRef.current);
  }, [isRunning]);

  const on = isRunning;
  
  // Create a 60-second sweeping progress ring based on the passed millisecond time
  const seconds = Math.floor(time / 1000);
  const sweepProgress = (seconds % 60) / 60;
  const arcFill = isRunning ? (sweepProgress === 0 && seconds > 0 ? TOTAL_CIRC : sweepProgress * TOTAL_CIRC) : TOTAL_CIRC;
  const arcDash = `${arcFill.toFixed(1)} ${(TOTAL_CIRC - arcFill).toFixed(1)}`;

  return (
    <div className={`fct-root ${on ? 'is-running' : ''}`}>
      <div className="fct-nebula" />

      {STARS.map(s => (
        <div
          key={s.id}
          className="fct-star"
          style={{
            width: s.size, height: s.size,
            top: `${s.top}%`, left: `${s.left}%`,
            '--dur': `${s.dur}s`, '--delay': `${s.delay}s`, '--op': s.op,
          }}
        />
      ))}

      <div className={`fct-scanline${on ? ' on' : ''}`} />

      <CornerBracket pos="tl" />
      <CornerBracket pos="tr" />
      <CornerBracket pos="bl" />
      <CornerBracket pos="br" />

      <div className="fct-scene">
        <div className={`fct-halo${on ? ' on' : ''}`} />

        <div
          ref={particleContainerRef}
          style={{ position: 'absolute', width: 380, height: 380, pointerEvents: 'none', zIndex: 5 }}
        />

        <svg className="fct-rings" viewBox="0 0 380 380">
          <defs>
            <linearGradient id="fct-prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#34d399" stopOpacity="1" />
              <stop offset="60%"  stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="fct-comet-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#34d399" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="fct-inner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="50%"  stopColor="#34d399" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          <circle cx="190" cy="190" r="180" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <RingDots />

          <circle
            cx="190" cy="190" r="180"
            fill="none"
            stroke="url(#fct-prog-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={arcDash}
            transform="rotate(-90 190 190)"
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />

          <g className={`fct-comet-group${on ? ' on' : ''}`}>
            <circle
              cx="190" cy="190" r="180"
              fill="none"
              stroke="url(#fct-comet-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="115 1117"
              style={{ opacity: on ? 0.92 : 0, transition: 'opacity 0.5s' }}
            />
          </g>

          <g className={`fct-mid-ring${on ? ' on' : ''}`}>
            <circle
              cx="190" cy="190" r="158"
              fill="none"
              stroke="rgba(56, 189, 248, 0.15)"
              strokeWidth="0.5"
              strokeDasharray="3 8"
            />
          </g>

          <circle
            cx="190" cy="190" r="140"
            fill="none"
            stroke="url(#fct-inner-grad)"
            strokeWidth="0.5"
            strokeDasharray="1 6"
          />

          <circle cx="190" cy="190" r="120" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        </svg>

        <TickMarks />

        <div className="fct-dial">
          <div className="fct-glass" />
          <div className="fct-dial-inner">
            <div className={`fct-mode-label${on ? ' on' : ''}`}>SYSTEM ACTIVE</div>
            <div className={`fct-time${on ? ' on' : ''}`}>{formatTime(time)}</div>
            <div className={`fct-badge${on ? ' on' : ''}`}>
              <div className="fct-pulse-dot" />
              <span className="fct-badge-text">Focusing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;