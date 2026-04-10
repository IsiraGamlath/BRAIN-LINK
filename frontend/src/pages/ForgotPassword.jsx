// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [alert, setAlert]         = useState(null);
  const [emailError, setEmailErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim())                    { setEmailErr('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email))   { setEmailErr('Invalid email format'); return; }
    setEmailErr('');
    setLoading(true);
    setAlert(null);

    try {
      const res  = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAlert({ type: 'success', text: data.message });
      // Show reset link only in dev
      if (data.resetUrl) {
        setAlert({
          type: 'success',
          text: `Reset link generated! In production this would be emailed. For dev: `,
          link: data.resetUrl
        });
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__bg-orb auth-page__bg-orb--1" />
        <div className="auth-page__bg-orb auth-page__bg-orb--2" />
        <div className="auth-page__bg-orb auth-page__bg-orb--3" />
      </div>

      <div className="auth-page__left">
        <div className="auth-page__brand">
          <div className="auth-page__brand-icon">🧠</div>
          <span className="auth-page__brand-name">BRAIN LINK</span>
        </div>
        <h1 className="auth-page__tagline">Forgot your<br /><span>Password?</span></h1>
        <p className="auth-page__subtitle">
          No worries! Enter your registered email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="auth-page__right">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Reset Password 🔑</h2>
            <p className="auth-card__desc">Enter your email to receive a reset link</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {alert && (
              <div className={`auth-alert auth-alert--${alert.type}`}>
                <span className="auth-alert__icon">{alert.type === 'success' ? '✅' : '❌'}</span>
                <span>
                  {alert.text}
                  {alert.link && (
                    <a href={alert.link} style={{ color: '#6ee7b7', display: 'block', marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>
                      {alert.link}
                    </a>
                  )}
                </span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">Email Address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉️</span>
                <input
                  id="fp-email"
                  type="email" className={`form-input${emailError ? ' form-input--error' : ''}`}
                  placeholder="your@sliit.lk" value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); setAlert(null); }}
                  disabled={loading}
                />
              </div>
              {emailError && <p className="form-error">⚠ {emailError}</p>}
            </div>

            <button id="btn-forgot-submit" type="submit" className={`btn-auth${loading ? ' btn-auth--loading' : ''}`} disabled={loading}>
              {loading ? <><div className="btn-spinner" /> Sending…</> : '📧 Send Reset Link'}
            </button>

            <p className="auth-footer">
              Remember it? <Link to="/login">Back to Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
