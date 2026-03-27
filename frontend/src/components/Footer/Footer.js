import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">BRAIN LINK</div>
          <p className="footer-tagline">Empowering SLIIT students to learn, collaborate, and succeed together.</p>
          <div className="footer-social">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📧</a>
            <a href="#" className="social-link">💼</a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#status">System Status</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
              <li><a href="#gdpr">GDPR</a></li>
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