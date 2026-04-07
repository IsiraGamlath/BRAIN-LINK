import React, { useState } from 'react';
import './DashboardPreview.css';

const DashboardPreview = () => {
  const [view, setView] = useState('student');

  return (
    <section className="dashboard-preview" id="dashboard">
      <div className="dashboard-preview__inner">
        <div className="section-header">
          <div className="section-tag" style={{color:'#F59E0B', background:'#FFFBEB'}}>Dashboard Preview</div>
          <h2 className="section-title">Your Academic Hub<br/><span className="grad-text">at a Glance</span></h2>
          <p className="section-sub">Everything you need to manage your academic life in one beautiful, intuitive interface.</p>
        </div>

        {/* Toggle tabs */}
        <div className="dp-tabs">
          <button
            className={`dp-tab ${view === 'student' ? 'dp-tab--active' : ''}`}
            onClick={() => setView('student')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Student View
          </button>
          <button
            className={`dp-tab ${view === 'admin' ? 'dp-tab--active' : ''}`}
            onClick={() => setView('admin')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Admin View
          </button>
        </div>

        <div className="dashboard-mockup">
          <div className="mockup-header">
            <div className="mockup-logo">
              <span className="mockup-logo-icon">🧠</span> BRAIN LINK
            </div>
            <div className="mockup-nav">
              {view === 'student'
                ? ['Dashboard','Groups','Calendar','Resources','Profile'].map((t, i) => (
                    <span key={t} className={`nav-item ${i === 0 ? 'active' : ''}`}>{t}</span>
                  ))
                : ['Overview','Users','Reports','Sessions','Resources'].map((t, i) => (
                    <span key={t} className={`nav-item ${i === 0 ? 'active' : ''}`}>{t}</span>
                  ))
              }
            </div>
            <div className="mockup-avatar">{view === 'student' ? '👤' : '🛡️'}</div>
          </div>

          <div className="mockup-content">
            {view === 'student' ? <StudentDashboard /> : <AdminDashboard />}
          </div>
        </div>
      </div>
    </section>
  );
};

const StudentDashboard = () => (
  <>
    <div className="stats-grid">
      {[
        { icon:'📚', value:'3', label:'Active Groups' },
        { icon:'⏰', value:'8', label:'Sessions This Week' },
        { icon:'💬', value:'5', label:'Open Help Requests' },
        { icon:'📂', value:'24', label:'Resources Saved' },
      ].map((s, i) => (
        <div className="stat-card" key={i}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="dashboard-main">
      <div className="upcoming-sessions">
        <h3>Upcoming Sessions</h3>
        {[
          { time:'Today 2:00 PM', title:'Data Structures Study Group', members:'5 members', dot:'#4F6EF7' },
          { time:'Tomorrow 10:00 AM', title:'Algorithm Review — Kuppi', members:'8 members', dot:'#7C3AED' },
          { time:'Fri 3:00 PM', title:'Database Lab Prep', members:'4 members', dot:'#059669' },
        ].map((s, i) => (
          <div className="session-item" key={i}>
            <div className="session-dot" style={{background: s.dot}}/>
            <div className="session-info">
              <div className="session-title">{s.title}</div>
              <div className="session-time">{s.time} · {s.members}</div>
            </div>
            <div className="session-badge">Join</div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {[
          { icon:'💬', text:'Your SQL help request was answered', time:'2 min ago' },
          { icon:'📅', text:'New Kuppi session: DSA Sorting', time:'1 hour ago' },
          { icon:'📂', text:'Resource uploaded: OS Notes PDF', time:'3 hours ago' },
          { icon:'👥', text:'Joined group "SE23 Alpha"', time:'Yesterday' },
        ].map((a, i) => (
          <div className="activity-item" key={i}>
            <div className="activity-icon">{a.icon}</div>
            <div className="activity-text">{a.text}</div>
            <div className="activity-time">{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  </>
);

const AdminDashboard = () => (
  <>
    <div className="stats-grid">
      {[
        { icon:'👥', value:'2,418', label:'Total Users', color:'#4F6EF7' },
        { icon:'📋', value:'47', label:'Pending Reports', color:'#EF4444' },
        { icon:'📅', value:'143', label:'Sessions This Month', color:'#059669' },
        { icon:'📂', value:'892', label:'Resources Uploaded', color:'#F59E0B' },
      ].map((s, i) => (
        <div className="stat-card stat-card--admin" key={i} style={{'--ac': s.color}}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-value stat-value--admin">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="dashboard-main">
      <div className="upcoming-sessions">
        <h3>Recent Reports</h3>
        {[
          { badge:'SPAM', text:'Inappropriate resource upload flagged', time:'10 min ago', color:'#EF4444' },
          { badge:'REVIEW', text:'Help request content under review', time:'1 hour ago', color:'#F59E0B' },
          { badge:'RESOLVED', text:'Group conduct issue resolved', time:'3 hours ago', color:'#059669' },
        ].map((r, i) => (
          <div className="session-item" key={i}>
            <span className="report-badge" style={{background: r.color}}>{r.badge}</span>
            <div className="session-info">
              <div className="session-title">{r.text}</div>
              <div className="session-time">{r.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h3>Platform Analytics</h3>
        <div className="admin-chart">
          {[
            { label:'Mon', val:65, color:'#4F6EF7' },
            { label:'Tue', val:82, color:'#7C3AED' },
            { label:'Wed', val:74, color:'#059669' },
            { label:'Thu', val:91, color:'#F59E0B' },
            { label:'Fri', val:88, color:'#4F6EF7' },
            { label:'Sat', val:45, color:'#EC4899' },
            { label:'Sun', val:34, color:'#0891B2' },
          ].map((b, i) => (
            <div className="admin-bar-item" key={i}>
              <div className="admin-bar-wrap">
                <div className="admin-bar-fill" style={{height:`${b.val}%`, background: b.color}}/>
              </div>
              <div className="admin-bar-lbl">{b.label}</div>
            </div>
          ))}
        </div>
        <div className="admin-stats-row">
          {[{v:'98%',l:'Uptime'},{v:'4.8★',l:'Avg Rating'},{v:'12ms',l:'Response'}].map((m,i)=>(
            <div className="admin-mini-stat" key={i}>
              <div className="admin-mini-val">{m.v}</div>
              <div className="admin-mini-lbl">{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default DashboardPreview;