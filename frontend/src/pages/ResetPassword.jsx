// frontend/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../components/Toast/Toast';
import './Login.css';

const calcStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (s <= 1) return { level: 'weak',   label: 'Weak',   fill: 1 };
  if (s <= 3) return { level: 'medium', label: 'Medium', fill: 3 };
  return           { level: 'strong',  label: 'Strong', fill: 5 };
};

export default function ResetPassword() {
  const navigate          = useNavigate();
  const toast             = useToast();
  const [params]          = useSearchParams();
  const token             = params.get('token') || '';
  const email             = params.get('email') || '';

  const [form, setForm]   = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [alert, setAlert] = useState(null);

  const strength = calcStrength(form.newPassword);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setAlert(null);
  };

  const validate = () => {
    const e = {};
    if (!form.newPassword)               e.newPassword = 'Password is required';
    else if (form.newPassword.length < 6) e.newPassword = 'Min 6 characters';
    else if (!/[a-zA-Z]/.test(form.newPassword)) e.newPassword = 'Must include a letter';
    else if (!/[0-9]/.test(form.newPassword))    e.newPassword = 'Must include a number';
    if (!form.confirmPassword)                   e.confirmPassword = 'Please confirm password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (!token || !email) {
      setAlert({ type: 'error', text: 'Invalid reset link. Please request a new one.' });
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword: form.newPassword, confirmPassword: form.confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Password reset successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Reset failed' });
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
        <h1 className="auth-page__tagline">Create a New<br /><span>Secure Password</span></h1>
        <p className="auth-page__subtitle">
          Choose a strong password to protect your BRAIN LINK account.
        </p>
      </div>

      <div className="auth-page__right">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">New Password 🔐</h2>
            <p className="auth-card__desc">
              {email ? `Resetting for: ${email}` : 'Enter your new password below'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {(!token || !email) && (
              <div className="auth-alert auth-alert--warning">
                <span className="auth-alert__icon">⚠️</span>
                <span>Invalid or missing reset token. <Link to="/forgot-password" style={{ color: '#fcd34d' }}>Request a new link</Link>.</span>
              </div>
            )}

            {alert && (
              <div className={`auth-alert auth-alert--${alert.type}`}>
                <span className="auth-alert__icon">{alert.type === 'error' ? '❌' : '✅'}</span>
                <span>{alert.text}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="rp-new">New Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="rp-new"
                  type={showNew ? 'text' : 'password'} name="newPassword"
                  className={`form-input form-input--pwd${errors.newPassword ? ' form-input--error' : ''}`}
                  placeholder="New strong password" value={form.newPassword}
                  onChange={handleChange} autoComplete="new-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                  {showNew ? '👁️' : '🙈'}
                </button>
              </div>
              {form.newPassword && (
                <>
                  <div className="pwd-strength">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`pwd-strength__bar${i <= strength.fill ? ` pwd-strength__bar--${strength.level}` : ''}`} />
                    ))}
                  </div>
                  <p className="pwd-strength__label">Strength: <strong>{strength.label}</strong></p>
                </>
              )}
              {errors.newPassword && <p className="form-error">⚠ {errors.newPassword}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rp-confirm">Confirm Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">🔒</span>
                <input
                  id="rp-confirm"
                  type={showConf ? 'text' : 'password'} name="confirmPassword"
                  className={`form-input form-input--pwd${errors.confirmPassword ? ' form-input--error' : ''}`}
                  placeholder="Confirm new password" value={form.confirmPassword}
                  onChange={handleChange} autoComplete="new-password"
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowConf(p => !p)} tabIndex={-1}>
                  {showConf ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword}</p>}
            </div>

            <button
              id="btn-reset-submit" type="submit"
              className={`btn-auth${loading ? ' btn-auth--loading' : ''}`}
              disabled={loading || !token || !email}
            >
              {loading ? <><div className="btn-spinner" /> Resetting…</> : '🔐 Reset Password'}
            </button>

            <p className="auth-footer">
              <Link to="/login">← Back to Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
