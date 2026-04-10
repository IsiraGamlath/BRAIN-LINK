import React from 'react';
import './CTASection.css';

const CTASection = () => (
  <section className="cta-section">
    <div className="cta-section__inner">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Transform<br/><span className="grad-text">Your Academic Journey?</span></h2>
        <p className="cta-subtitle">Join thousands of SLIIT students who are already making the most of their university experience with BRAIN LINK.</p>
        <div className="cta-buttons">
          <button className="btn btn-primary">Get Started Free</button>
          <button className="btn btn-secondary">Watch Demo</button>
        </div>
        <div className="cta-stats">
          <div className="stat">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat">
            <div className="stat-number">50,000+</div>
            <div className="stat-label">Study Sessions</div>
          </div>
          <div className="stat">
            <div className="stat-number">4.9★</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>
      <div className="cta-visual">
        <div className="floating-cards">
          <div className="card card-1">
            <div className="card-icon">🎓</div>
            <div className="card-title">Study Groups</div>
          </div>
          <div className="card card-2">
            <div className="card-icon">📅</div>
            <div className="card-title">Smart Calendar</div>
          </div>
          <div className="card card-3">
            <div className="card-icon">💬</div>
            <div className="card-title">Chat & Collaborate</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;