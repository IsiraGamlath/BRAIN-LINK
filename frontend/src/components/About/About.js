import React from 'react';
import './About.css';

const highlights = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Centralized Academic Collaboration',
    desc: 'One platform for all your academic collaboration needs — study sessions, group projects, and peer support.',
    color: '#4F6EF7',
    bg: '#EEF1FE',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    title: 'Structured Alternative to WhatsApp',
    desc: 'Ditch the chaos of group chats. BRAIN LINK gives your academic communication proper structure, roles, and tracking.',
    color: '#7C3AED',
    bg: '#F5F0FF',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Peer-to-Peer Learning Ecosystem',
    desc: 'Learn from each other. Post help requests, respond to peers, host Kuppi sessions — build a real academic community.',
    color: '#059669',
    bg: '#ECFDF5',
  },
];

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        {/* Left side */}
        <div className="about__text" data-aos="fade-right">
          <div className="section-tag">About the Platform</div>
          <h2 className="section-title">
            The Smart Academic<br />
            <span className="grad-text">Collaboration Hub</span>
          </h2>
          <p className="about__desc">
            BRAIN LINK is a centralized digital platform designed specifically for SLIIT students.
            It brings together study group formation, peer-led learning sessions (Kuppi), and
            academic help requests — all under one roof with smart moderation and analytics.
          </p>
          <p className="about__desc">
            Built by students, for students — to make collaborative learning organized,
            trackable, and genuinely effective.
          </p>
          <div className="about__actions">
            <a href="#features"
              className="btn btn--primary"
              onClick={e => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({behavior:'smooth'}); }}>
              Explore Features
            </a>
            <a href="#how-it-works"
              className="btn btn--ghost"
              onClick={e => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({behavior:'smooth'}); }}>
              How It Works
            </a>
          </div>
        </div>

        {/* Right side — highlight cards */}
        <div className="about__cards" data-aos="fade-left">
          {highlights.map((h, i) => (
            <div className="about__card" key={i} style={{'--card-color': h.color, '--card-bg': h.bg}}>
              <div className="about__card-icon">
                {h.icon}
              </div>
              <div>
                <h3 className="about__card-title">{h.title}</h3>
                <p className="about__card-desc">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
