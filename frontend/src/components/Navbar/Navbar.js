import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ darkMode, toggleDark }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home',     href: '#hero' },
    { label: 'About',    href: '#about' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Benefits', href: '#benefits' },
  ];

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Brand */}
        <a href="#hero" className="navbar__brand" onClick={e => { e.preventDefault(); handleNavClick('#hero'); }}>
          <div className="navbar__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="url(#navGrad)" />
              <path d="M9 17 Q13 9 16 13 Q19 17 23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <circle cx="16" cy="21" r="3.5" fill="white" opacity="0.9"/>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#4F6EF7"/>
                  <stop offset="100%" stopColor="#7C3AED"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar__brand-text">BRAIN<span>LINK</span></span>
        </a>

        {/* Desktop links */}
        <ul className="navbar__links">
          {navLinks.map(l => (
            <li key={l.href}>
              <a href={l.href} className="navbar__link"
                onClick={e => { e.preventDefault(); handleNavClick(l.href); }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="navbar__actions">
          <button className="navbar__theme-btn" onClick={toggleDark} aria-label="Toggle theme" title="Toggle dark mode">
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <a href="#cta" className="btn btn--ghost" onClick={e => { e.preventDefault(); handleNavClick('#cta'); }}>Log In</a>
          <a href="#cta" className="btn btn--primary" onClick={e => { e.preventDefault(); handleNavClick('#cta'); }}>Get Started</a>
          <button className={`navbar__hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        {navLinks.map(l => (
          <a key={l.href} href={l.href} className="navbar__mobile-link"
            onClick={e => { e.preventDefault(); handleNavClick(l.href); }}>
            {l.label}
          </a>
        ))}
        <div className="navbar__mobile-actions">
          <a href="#cta" className="btn btn--ghost" onClick={e => { e.preventDefault(); handleNavClick('#cta'); }}>Log In</a>
          <a href="#cta" className="btn btn--primary" onClick={e => { e.preventDefault(); handleNavClick('#cta'); }}>Get Started</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
