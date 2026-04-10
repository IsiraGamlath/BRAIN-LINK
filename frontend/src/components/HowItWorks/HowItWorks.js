import React, { useEffect, useRef } from 'react';
import './HowItWorks.css';

const steps = [
  {
    num: '01',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Create Your Account',
    desc: 'Sign up with your SLIIT credentials in under a minute. Your profile is automatically linked to your faculty and subgroup for the right community fit.',
    color: '#4F6EF7',
    bg: '#EEF1FE',
  },
  {
    num: '02',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Join or Create Groups & Sessions',
    desc: 'Explore available Kuppi sessions and study groups. Join instantly or start your own — set the topic, time, mode, and invite your batchmates.',
    color: '#7C3AED',
    bg: '#F5F0FF',
  },
  {
    num: '03',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'Collaborate and Learn',
    desc: 'Attend sessions, post help requests, respond to peers, and track all your academic activity through your personal dashboard. Grow together.',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.hiw-step').forEach((el, i) => {
              setTimeout(() => el.classList.add('hiw-step--visible'), i * 180);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hiw" id="how-it-works" ref={sectionRef}>
      <div className="hiw__bg-blob" aria-hidden="true"/>
      <div className="hiw__inner">
        <div className="section-header">
          <div className="section-tag" style={{color:'#7C3AED',background:'#F5F0FF'}}>Simple Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Getting started on BRAIN LINK takes just 2 minutes. Here's your roadmap to smarter learning.</p>
        </div>

        <div className="hiw__steps">
          {steps.map((s, i) => (
            <div className="hiw-step" key={i} style={{'--sc': s.color, '--sb': s.bg}}>
              {/* Connector line */}
              {i < steps.length - 1 && <div className="hiw-step__connector" aria-hidden="true"/>}

              <div className="hiw-step__bubble">
                <div className="hiw-step__num">{s.num}</div>
                <div className="hiw-step__icon">{s.icon}</div>
              </div>

              <div className="hiw-step__content">
                <h3 className="hiw-step__title">{s.title}</h3>
                <p className="hiw-step__desc">{s.desc}</p>
                <div className="hiw-step__meta">
                  <span className="hiw-step__tag">Step {s.num}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA row */}
        <div className="hiw__bottom">
          <div className="hiw__trust-items">
            {['Free for all SLIIT students', 'No setup required', 'Works on mobile & desktop'].map((t, i) => (
              <div className="hiw__trust-item" key={i}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{t}</span>
              </div>
            ))}
          </div>
          <a href="#cta" className="btn btn--primary"
            onClick={e => { e.preventDefault(); document.querySelector('#cta')?.scrollIntoView({behavior:'smooth'}); }}>
            Start for Free →
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
