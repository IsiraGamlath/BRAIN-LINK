import React, { useState } from 'react';
import './Features.css';

const features = [
  {
    id: 'kuppi',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="8" cy="15" r="1.5" fill="currentColor"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    ),
    color: '#4F6EF7', bg: '#EEF1FE', tag: 'Schedule & Learn',
    title: 'Kuppi Session & Calendar',
    desc: 'Create and join peer-led study sessions with a built-in calendar. Choose online or physical mode, set capacity, and track attendance in real time.',
    bullets: ['Online / Physical mode selection', 'Integrated calendar view', 'Session reminders & capacity limits', 'Session recordings & notes'],
    preview: (
      <div className="feat__preview feat__preview--blue">
        <div className="fp-row fp-row--header">
          <span>📅</span><span>Upcoming Kuppi Sessions</span>
        </div>
        {[
          { time:'Today 3:00 PM', title:'DSA — Sorting Algorithms', dot:'#4F6EF7', n:12 },
          { time:'Tomorrow 9:00 AM', title:'OS — Memory Management', dot:'#7C3AED', n:8 },
          { time:'Fri 2:00 PM', title:'DBMS — SQL Joins',dot:'#059669', n:15 },
        ].map((s, i) => (
          <div className="fp-item" key={i}>
            <div className="fp-dot" style={{background:s.dot}}/>
            <div className="fp-info">
              <div className="fp-title">{s.title}</div>
              <div className="fp-sub">{s.time} · {s.n} joined</div>
            </div>
            <div className="fp-badge">Join</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'help',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/>
      </svg>
    ),
    color: '#7C3AED', bg: '#F5F0FF', tag: 'Ask & Answer',
    title: 'Peer Help Request System',
    desc: 'Post academic questions and get answers from your peers. Track each request through a transparent Open → Accepted → Closed workflow with ratings.',
    bullets: ['Post questions by subject & topic', 'Accept & respond to help requests', 'Status tracking & notifications', 'Peer rating & recognition system'],
    preview: (
      <div className="feat__preview feat__preview--purple">
        <div className="fp-row fp-row--header">
          <span>💬</span><span>Help Request Status</span>
        </div>
        <div className="fp-status-track">
          {['Open','Accepted','In Progress','Closed'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`fp-step ${i <= 2 ? 'fp-step--done' : ''}`}>
                <div className="fp-step-dot">{i < 2 ? '✓' : i === 2 ? '●' : ''}</div>
                <div className="fp-step-lbl">{s}</div>
              </div>
              {i < 3 && <div className={`fp-step-line ${i < 2 ? 'fp-step-line--done' : ''}`}/>}
            </React.Fragment>
          ))}
        </div>
        <div className="fp-help-item">
          <div className="fp-help-q">Help with SQL JOIN queries in Lab 5</div>
          <div className="fp-help-meta"><span className="fp-tag fp-tag--yellow">In Progress</span><span>3 replies</span></div>
        </div>
      </div>
    ),
  },
  {
    id: 'groups',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#0891B2', bg: '#E0F7FA', tag: 'Collaborate',
    title: 'Study Group Formation',
    desc: 'Form project groups within your subgroup. The system validates member eligibility, enforces size limits, and ensures fair group distribution automatically.',
    bullets: ['Subgroup-based grouping system', 'Create/join 4-member project groups', 'Smart validation & restriction', 'Group activity tracking'],
    preview: (
      <div className="feat__preview feat__preview--cyan">
        <div className="fp-row fp-row--header"><span>👥</span><span>SE23 Alpha Group</span></div>
        <div className="fp-members">
          {['Nimasha P.','Kasun B.','Dinusha F.','Ravindu S.'].map((m, i) => (
            <div className="fp-member" key={i}>
              <div className="fp-avatar" style={{background:['#4F6EF7','#7C3AED','#0891B2','#059669'][i]}}>{m[0]}</div>
              <div className="fp-member-name">{m}</div>
              <div className="fp-member-role">{i === 0 ? 'Lead' : 'Member'}</div>
            </div>
          ))}
        </div>
        <div className="fp-group-status"><span className="fp-tag fp-tag--green">Group Active ✓</span><span className="fp-sub">4/4 members</span></div>
      </div>
    ),
  },
  {
    id: 'admin',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
        <polyline points="7 9 10 12 13 9"/>
      </svg>
    ),
    color: '#F59E0B', bg: '#FFFBEB', tag: 'Manage & Monitor',
    title: 'Smart Dashboard & Admin Control',
    desc: 'Students get a personalized activity dashboard. Admins get a full analytics panel with reports, moderation tools, and system health monitoring.',
    bullets: ['Personal student activity dashboard', 'Admin analytics & reporting panel', 'Content moderation & flagging', 'System usage insights'],
    preview: (
      <div className="feat__preview feat__preview--amber">
        <div className="fp-row fp-row--header"><span>📊</span><span>Admin Overview</span></div>
        <div className="fp-bar-chart">
          {[
            {lbl:'Sessions',val:85,color:'#4F6EF7'},
            {lbl:'Help Req.',val:62,color:'#7C3AED'},
            {lbl:'Groups',val:91,color:'#059669'},
            {lbl:'Active',val:78,color:'#F59E0B'},
          ].map((b,i) => (
            <div className="fp-bar-item" key={i}>
              <div className="fp-bar-wrap">
                <div className="fp-bar-fill" style={{height:`${b.val}%`, background:b.color}}/>
              </div>
              <div className="fp-bar-lbl">{b.lbl}</div>
            </div>
          ))}
        </div>
        <div className="fp-metric-row">
          {[{v:'2.4K',l:'Students'},{v:'143',l:'Sessions'},{v:'98%',l:'Resolved'}].map((m,i)=>(
            <div className="fp-metric" key={i}><div className="fp-metric-val">{m.v}</div><div className="fp-sub">{m.l}</div></div>
          ))}
        </div>
      </div>
    ),
  },
];

const Features = () => {
  const [active, setActive] = useState(null);

  return (
    <section className="features" id="features">
      <div className="features__inner">
        <div className="section-header">
          <div className="section-tag">Core Modules</div>
          <h2 className="section-title">Everything You Need to<br/><span className="grad-text">Collaborate & Learn</span></h2>
          <p className="section-sub">Four powerful modules designed specifically for SLIIT students — integrated, intelligent, and easy to use.</p>
        </div>

        <div className="features__grid">
          {features.map((f, i) => (
            <div
              className={`feat-card ${active === i ? 'feat-card--active' : ''}`}
              key={f.id}
              style={{'--fc':f.color,'--fb':f.bg}}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Card header */}
              <div className="feat-card__header">
                <div className="feat-card__icon">{f.icon}</div>
                <div className="feat-card__tag">{f.tag}</div>
              </div>
              <h3 className="feat-card__title">{f.title}</h3>
              <p className="feat-card__desc">{f.desc}</p>

              {/* Bullets */}
              <ul className="feat-card__bullets">
                {f.bullets.map((b, j) => (
                  <li key={j}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Live preview */}
              <div className="feat-card__preview">{f.preview}</div>

              {/* Glowing border on hover */}
              <div className="feat-card__glow" aria-hidden="true"/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
