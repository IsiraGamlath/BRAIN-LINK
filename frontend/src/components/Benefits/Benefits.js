import React from 'react';
import './Benefits.css';

const benefits = [
  {
    icon: '📋',
    title: 'Organized Academic Communication',
    desc: 'Replace chaotic WhatsApp threads with structured, searchable, and trackable academic communication channels.',
    color: '#4F6EF7', bg: '#EEF1FE',
  },
  {
    icon: '⚡',
    title: 'Easy Group Formation',
    desc: 'Smart subgroup matching and automatic validation make forming the perfect study group effortless and fair.',
    color: '#7C3AED', bg: '#F5F0FF',
  },
  {
    icon: '⏱️',
    title: 'Efficient Time Management',
    desc: 'Integrated Kuppi calendar with reminders means you never miss a study session or project deadline again.',
    color: '#0891B2', bg: '#E0F7FA',
  },
  {
    icon: '📂',
    title: 'Centralized Resource Sharing',
    desc: 'Stop hunting for notes in WhatsApp groups. All subject resources — PDFs, videos, past papers — in one searchable library.',
    color: '#F59E0B', bg: '#FFFBEB',
  },
  {
    icon: '🤝',
    title: 'Strong Peer Learning Culture',
    desc: 'Build a habit of helping and being helped. Peer ratings and recognition reward those who contribute most.',
    color: '#059669', bg: '#ECFDF5',
  },
  {
    icon: '🛡️',
    title: 'Safe & Moderated Environment',
    desc: 'Admins maintain platform quality through moderation tools, reporting systems, and content guidelines.',
    color: '#EC4899', bg: '#FDF2F8',
  },
];

const Benefits = () => (
  <section className="benefits" id="benefits">
    <div className="benefits__inner">
      <div className="section-header">
        <div className="section-tag" style={{color:'#059669', background:'#ECFDF5'}}>Why BRAIN LINK</div>
        <h2 className="section-title">Built to Make Student<br/><span className="grad-text">Life Easier</span></h2>
        <p className="section-sub">Real benefits designed around how SLIIT students actually study, collaborate, and learn.</p>
      </div>

      <div className="benefits__grid">
        {benefits.map((b, i) => (
          <div className="benefit-card" key={i} style={{'--bc': b.color, '--bb': b.bg}}>
            <div className="benefit-card__emoji">{b.icon}</div>
            <h3 className="benefit-card__title">{b.title}</h3>
            <p className="benefit-card__desc">{b.desc}</p>
            <div className="benefit-card__arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Benefits;
