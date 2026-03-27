import React from 'react';
import './DashboardPreview.css';

const DashboardPreview = () => (
  <section className="dashboard-preview" id="dashboard">
    <div className="dashboard-preview__inner">
      <div className="section-header">
        <div className="section-tag" style={{color:'#F59E0B', background:'#FFFBEB'}}>Dashboard Preview</div>
        <h2 className="section-title">Your Academic Hub<br/><span className="grad-text">at a Glance</span></h2>
        <p className="section-sub">Everything you need to manage your academic life in one beautiful, intuitive interface.</p>
      </div>

      <div className="dashboard-mockup">
        <div className="mockup-header">
          <div className="mockup-logo">BRAIN LINK</div>
          <div className="mockup-nav">
            <span className="nav-item active">Dashboard</span>
            <span className="nav-item">Groups</span>
            <span className="nav-item">Calendar</span>
            <span className="nav-item">Profile</span>
          </div>
          <div className="mockup-avatar">👤</div>
        </div>

        <div className="mockup-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-value">12</div>
              <div className="stat-label">Active Groups</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-value">8</div>
              <div className="stat-label">Sessions This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">95%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>

          <div className="dashboard-main">
            <div className="upcoming-sessions">
              <h3>Upcoming Sessions</h3>
              <div className="session-item">
                <div className="session-time">Today 2:00 PM</div>
                <div className="session-title">Data Structures Study Group</div>
                <div className="session-members">5 members</div>
              </div>
              <div className="session-item">
                <div className="session-time">Tomorrow 10:00 AM</div>
                <div className="session-title">Algorithm Review</div>
                <div className="session-members">8 members</div>
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-text">New message in "Web Development" group</div>
                <div className="activity-time">2 min ago</div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📅</div>
                <div className="activity-text">Study session scheduled for Friday</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardPreview;