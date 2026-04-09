// frontend/src/pages/Login.jsx — Advanced login page
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import './Login.css';

const EyeIcon = ({ open }) => open ? '👁️' : '🙈';
const LockIcon = () => '🔒';
const EmailIcon = () => '✉️';
const LoginIcon = () => '⚡';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();

  const from = location.state?.from?.pathname || null;

  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [alert, setAlert] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    if (!form.role) e.role = 'Please select a role';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);

    try {
      const user = await login(form.email.trim(), form.password, form.role);
      toast.success(`Welcome back, ${user.fullName}! 🎉`);

      const dest = from || (user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid credentials';
      setAlert({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--login">
      {/* Animated background */}
      <div className="auth-page__bg">
        <div className="auth-page__bg-orb auth-page__bg-orb--1" />
        <div className="auth-page__bg-orb auth-page__bg-orb--2" />
        <div className="auth-page__bg-orb auth-page__bg-orb--3" />
      </div>

      {/* Left branding panel */}
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <div className="auth-page__brand-icon">🧠</div>
          <span className="auth-page__brand-name">BRAIN LINK</span>
        </div>

        <h1 className="auth-page__tagline">
          Your Smart<br /><span>Study Network</span>
        </h1>
        <p className="auth-page__subtitle">
          Connect with peers, share resources, and accelerate your academic journey at SLIIT.
        </p>

        <ul className="auth-page__features">
          {[
            'Join or create study groups instantly',
            'Access peer-shared lecture notes & past papers',
            'Request & offer academic help',
            'Track your learning progress with analytics'
          ].map((f, i) => (
            <li className="auth-page__feature" key={i}>
              <span className="auth-page__feature-dot" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right form panel */}
      <div className="auth-page__right">
        <div className="auth-card">
          <div className="auth-card__header">
            <h2 className="auth-card__title">Welcome back 👋</h2>
            <p className="auth-card__desc">Sign in to your BRAIN LINK account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Alert banner */}
            {alert && (
              <div className={`auth-alert auth-alert--${alert.type}`}>
                <span className="auth-alert__icon">
                  {alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span>{alert.text}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><EmailIcon /></span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className={`form-input${errors.email ? ' form-input--error' : ''}`}
                  placeholder="your@sliit.lk"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="form-error">⚠ {errors.email}</p>}
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-role">Role</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">👤</span>
                <select
                  id="login-role"
                  name="role"
                  className={`form-input${errors.role ? ' form-input--error' : ''}`}
                  value={form.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {errors.role && <p className="form-error">⚠ {errors.role}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="form-input-wrap">
                <span className="form-input-icon"><LockIcon /></span>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  className={`form-input form-input--pwd${errors.password ? ' form-input--error' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd(p => !p)}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {errors.password && <p className="form-error">⚠ {errors.password}</p>}
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              className={`btn-auth${loading ? ' btn-auth--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <><div className="btn-spinner" /> Signing in…</>
              ) : (
                <><LoginIcon /> Sign In</>
              )}
            </button>

            <div className="auth-divider">or</div>

            {/* Register link */}
            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
