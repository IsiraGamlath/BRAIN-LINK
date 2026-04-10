import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement('div');
      dot.className = 'hero__particle';
      dot.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${Math.random() * 6 + 3}px;
        height: ${Math.random() * 6 + 3}px;
        animation-delay: ${Math.random() * 6}s;
        animation-duration: ${Math.random() * 8 + 5}s;
        opacity: ${Math.random() * 0.5 + 0.1};
      `;
      container.appendChild(dot);
    }
    return () => { while (container.firstChild) container.removeChild(container.firstChild); };
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero__particles" ref={particlesRef} aria-hidden="true" />
      <div className="hero__blob hero__blob--1" aria-hidden="true" />
      <div className="hero__blob hero__blob--2" aria-hidden="true" />
      <div className="hero__blob hero__blob--3" aria-hidden="true" />

      <div className="hero__inner">
        {/* Text side */}
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            <span>Exclusively for SLIIT Students</span>
          </div>

          <h1 className="hero__headline">
            Connect. Learn.<br/>
            <span className="hero__headline-grad">Succeed Together.</span>
          </h1>

          <p className="hero__sub">
            A smarter way for SLIIT students to collaborate, form study groups,
            and get academic help — all in one unified platform.
          </p>

          <div className="hero__actions">
            <a href="#cta" className="btn btn--primary btn--lg hero__cta-main"
              onClick={e => { e.preventDefault(); document.querySelector('#cta')?.scrollIntoView({ behavior:'smooth' }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Get Started
            </a>
            <a href="#features" className="btn btn--ghost btn--lg"
              onClick={e => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior:'smooth' }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            {[
              { val: '2,400+', lbl: 'Active Students' },
              { val: '850+',   lbl: 'Kuppi Sessions' },
              { val: '98%',    lbl: 'Satisfaction' },
            ].map((s, i) => (
              <div className="hero__stat" key={i}>
                <span className="hero__stat-val">{s.val}</span>
                <span className="hero__stat-lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual side */}
        <div className="hero__visual">
          <div className="hero__visual-card hero__visual-card--main">
            <CollabIllustration />
          </div>

          {/* Floating cards */}
          <div className="hero__chip hero__chip--1">
            <div className="hero__chip-icon" style={{background:'#EEF1FE'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className="hero__chip-title">DSA Kuppi Live</div>
              <div className="hero__chip-sub">14 students joined</div>
            </div>
            <div className="hero__chip-live">LIVE</div>
          </div>

          <div className="hero__chip hero__chip--2">
            <div className="hero__chip-icon" style={{background:'#F5F0FF'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div className="hero__chip-title">Group Formed ✓</div>
              <div className="hero__chip-sub">SE23 Alpha · 4 members</div>
            </div>
          </div>

          <div className="hero__chip hero__chip--3">
            <div className="hero__chip-icon" style={{background:'#ECFDF5'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <div className="hero__chip-title">Help Resolved</div>
              <div className="hero__chip-sub">SQL query · 8 min ago</div>
            </div>
          </div>

          {/* Decorative shapes */}
          <div className="hero__shape hero__shape--ring" aria-hidden="true"/>
          <div className="hero__shape hero__shape--dot1" aria-hidden="true"/>
          <div className="hero__shape hero__shape--dot2" aria-hidden="true"/>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll" aria-hidden="true">
        <div className="hero__scroll-mouse"><div className="hero__scroll-wheel"/></div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

const CollabIllustration = () => (
  <svg viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="hero__svg">
    {/* Background */}
    <rect width="480" height="360" rx="24" fill="url(#heroGrad)"/>
    {/* Grid lines */}
    <line x1="0" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    <line x1="0" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    <line x1="0" y1="270" x2="480" y2="270" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    <line x1="120" y1="0" x2="120" y2="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    <line x1="240" y1="0" x2="240" y2="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    <line x1="360" y1="0" x2="360" y2="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
    {/* Central glow */}
    <circle cx="240" cy="180" r="120" fill="rgba(255,255,255,0.04)"/>
    <circle cx="240" cy="180" r="80" fill="rgba(255,255,255,0.05)"/>
    {/* Connection lines */}
    <line x1="240" y1="180" x2="100" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>
    <line x1="240" y1="180" x2="380" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>
    <line x1="240" y1="180" x2="100" y2="270" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>
    <line x1="240" y1="180" x2="380" y2="270" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>
    <line x1="240" y1="180" x2="240" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 4"/>

    {/* Center brainlink icon */}
    <circle cx="240" cy="180" r="44" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
    <path d="M220 183 Q228 168 236 175 Q244 182 252 168" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <circle cx="236" cy="192" r="6" fill="white" opacity="0.9"/>

    {/* Student avatars at nodes */}
    {[
      { cx:100, cy:100, c1:'#818CF8', c2:'#6366F1', label:'A' },
      { cx:380, cy:100, c1:'#A78BFA', c2:'#7C3AED', label:'B' },
      { cx:100, cy:270, c1:'#60A5FA', c2:'#3B82F6', label:'C' },
      { cx:380, cy:270, c1:'#34D399', c2:'#059669', label:'D' },
      { cx:240, cy: 52, c1:'#F472B6', c2:'#EC4899', label:'E' },
    ].map((n, i) => (
      <g key={i}>
        <circle cx={n.cx} cy={n.cy} r="28" fill={`url(#av${i})`}/>
        <circle cx={n.cx} cy={n.cy} r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <text x={n.cx} y={n.cy+6} textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif">{n.label}</text>
        <defs>
          <radialGradient id={`av${i}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor={n.c1}/>
            <stop offset="100%" stopColor={n.c2}/>
          </radialGradient>
        </defs>
      </g>
    ))}

    {/* Activity dots on connections */}
    <circle cx="170" cy="140" r="4" fill="white" opacity="0.7">
      <animateMotion dur="3s" repeatCount="indefinite" path="M0,0 L140,80"/>
    </circle>
    <circle cx="310" cy="140" r="4" fill="white" opacity="0.7">
      <animateMotion dur="4s" repeatCount="indefinite" path="M0,0 L-140,80"/>
    </circle>

    {/* Bottom label card */}
    <rect x="130" y="310" width="220" height="36" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <text x="240" y="333" textAnchor="middle" fill="white" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">5 students collaborating now</text>

    <defs>
      <linearGradient id="heroGrad" x1="0" y1="0" x2="480" y2="360">
        <stop offset="0%" stopColor="#4F6EF7"/>
        <stop offset="50%" stopColor="#6D55F5"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

export default Hero;
