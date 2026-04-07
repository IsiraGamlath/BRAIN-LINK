import React from 'react';
import { Link } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => (
  <section className="cta-section" id="cta">
    <div className="cta-section__inner">
      <div className="cta-content">
        <div className="cta-badge">🚀 Join 2,400+ SLIIT Students</div>
        <h2 className="cta-title">
          Start Learning<br/>
          <span className="cta-grad">Smarter Today</span>
        </h2>
        <p className="cta-subtitle">
          Join thousands of SLIIT students who are already forming study groups,
          attending Kuppi sessions, sharing resources, and getting peer help on BRAIN LINK.
        </p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-btn cta-btn--primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Sign Up Free
          </Link>
          <Link to="/login" className="cta-btn cta-btn--secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Log In
          </Link>
        </div>
        <div className="cta-trust">
          {['Free for SLIIT students','No credit card required','Works on mobile & desktop'].map((t,i) => (
            <div className="cta-trust-item" key={i}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="cta-visual">
        <div className="cta-cards">
          <div className="cta-card cta-card--1">
            <div className="cta-card-icon">🎓</div>
            <div className="cta-card-title">Study Groups</div>
            <div className="cta-card-sub">4-member subgroups</div>
          </div>
          <div className="cta-card cta-card--2">
            <div className="cta-card-icon">📅</div>
            <div className="cta-card-title">Kuppi Calendar</div>
            <div className="cta-card-sub">Live sessions daily</div>
          </div>
          <div className="cta-card cta-card--3">
            <div className="cta-card-icon">💬</div>
            <div className="cta-card-title">Peer Help</div>
            <div className="cta-card-sub">Instant answers</div>
          </div>
          <div className="cta-card cta-card--4">
            <div className="cta-card-icon">📂</div>
            <div className="cta-card-title">Resources</div>
            <div className="cta-card-sub">PDFs & videos</div>
          </div>
        </div>
        <div className="cta-stats-grid">
          {[
            { v:'10,000+', l:'Active Students' },
            { v:'50,000+', l:'Study Sessions' },
            { v:'4.9★',    l:'Average Rating' },
          ].map((s, i) => (
            <div className="cta-stat" key={i}>
              <div className="cta-stat-val">{s.v}</div>
              <div className="cta-stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Decorative blobs */}
    <div className="cta-blob cta-blob--1" aria-hidden="true"/>
    <div className="cta-blob cta-blob--2" aria-hidden="true"/>
  </section>
);

export default CTASection;