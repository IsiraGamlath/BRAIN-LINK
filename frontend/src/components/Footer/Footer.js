import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <div className="footer-content">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="url(#footerGrad)" />
              <path d="M9 17 Q13 9 16 13 Q19 17 23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="21" r="3.5" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="footerGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#4F6EF7"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </svg>
            <span>BRAIN <span className="footer-logo-grad">LINK</span></span>
          </div>
          <p className="footer-tagline">
            Empowering SLIIT students to study smarter, collaborate better,
            and share knowledge — all in one platform.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Email">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#benefits">Benefits</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/forgot-password">Forgot Password</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          © 2026 BRAIN LINK. All rights reserved. Made with ❤️ for SLIIT students.
        </div>
        <div className="footer-language">
          <select className="language-select">
            <option value="en">English</option>
            <option value="si">සිංහල</option>
          </select>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;