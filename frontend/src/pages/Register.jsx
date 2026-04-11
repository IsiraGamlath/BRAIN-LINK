// frontend/src/pages/Register.jsx — Advanced SLIIT registration page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/Toast';
import './Login.css'; // Reuse shared auth styles

/* ── Password strength calculator ─────────────────────────────────────────── */
const calcStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6)          score++;
  if (pwd.length >= 10)         score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { level: 'weak',   label: 'Weak',   fill: 1 };
  if (score <= 3) return { level: 'medium', label: 'Medium', fill: 3 };
  return             { level: 'strong',  label: 'Strong', fill: 5 };
};

const SPECIALIZATIONS = [
  'Software Engineering', 'Information Technology', 'Computer Science',
  'Cyber Security', 'Data Science', 'Artificial Intelligence',
  'Business Information Systems', 'Other'
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast         = useToast();

  const [step, setStep] = useState(1); // 2-step form
  const [form, setForm] = useState({
    slIIId: '', fullName: '', email: '',
    specialization: '', year: '', semester: '',
    password: '', confirmPassword: ''
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alert, setAlert]     = useState(null);

  const strength = calcStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setAlert(null);
  };

  /* ── Step 1 validation ─────────────────────────────────────────────────── */
  const validateStep1 = () => {
    const e = {};
    if (!form.slIIId.trim())   e.slIIId   = 'SLIIT ID is required';
    else if (!/^[A-Za-z]{2}\d+$/.test(form.slIIId.trim())) e.slIIId = 'Invalid SLIIT ID format (e.g. IT12345678)';
    if (!form.fullName.trim()) e.fullName  = 'Full name is required';
    else if (form.fullName.trim().length < 3) e.fullName = 'Name must be at least 3 characters';
    if (!form.email.trim())    e.email     = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.specialization)  e.specialization = 'Specialization is required';
    if (!form.year)            e.year      = 'Year is required';
    if (!form.semester)        e.semester  = 'Semester is required';
    return e;
  };

  /* ── Step 2 validation ─────────────────────────────────────────────────── */
  const validateStep2 = () => {
    const e = {};
    if (!form.password)                 e.password = 'Password is required';
    else if (form.password.length < 6)  e.password = 'Min 6 characters';
    else if (!/[a-zA-Z]/.test(form.password)) e.password = 'Must include a letter';
    else if (!/[0-9]/.test(form.password))    e.password = 'Must include a number';
    if (!form.confirmPassword)                 e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleNext = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setAlert(null);

    try {
      const user = await register({
        slIIId:         form.slIIId.trim().toUpperCase(),
        fullName:       form.fullName.trim(),
        email:          form.email.trim().toLowerCase(),
        specialization: form.specialization,
        year:           Number(form.year),
        semester:       Number(form.semester),
        password:       form.password,
        confirmPassword: form.confirmPassword
      });
      toast.success(`Account created! Welcome, ${user.fullName}!`);
      navigate('/project-group-hub', { replace: true });
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-page__bg">
        <div className="auth-page__bg-orb auth-page__bg-orb--1" />
        <div className="auth-page__bg-orb auth-page__bg-orb--2" />
        <div className="auth-page__bg-orb auth-page__bg-orb--3" />
      </div>

      {/* Left branding */}
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <div className="auth-page__brand-icon">🧠</div>
          <span className="auth-page__brand-name">BRAIN LINK</span>
        </div>
        <h1 className="auth-page__tagline">
          Start Your<br /><span>Academic Journey</span>
        </h1>
        <p className="auth-page__subtitle">
          Join thousands of SLIIT students already collaborating on BRAIN LINK. Study smarter, not harder.
        </p>
        <ul className="auth-page__features">
          {[
            'Free account — always',
            'Secure & private by design',
            'Verified SLIIT community only',
            'Access all resources immediately'
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
            <h2 className="auth-card__title">
              {step === 1 ? 'Create Account 🚀' : 'Set Password 🔐'}
            </h2>
            <p className="auth-card__desc">
              {step === 1
                ? 'Step 1 of 2 — Your SLIIT information'
                : 'Step 2 of 2 — Secure your account'}
            </p>
            {/* Step indicator */}
            <div className="auth-step-meter">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className={`auth-step-segment ${s <= step ? 'auth-step-segment--active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="auth-form">
              {alert && (
                <div className={`auth-alert auth-alert--${alert.type}`}>
                  <span className="auth-alert__icon">❌</span>
                  <span>{alert.text}</span>
                </div>
              )}

              {/* SLIIT ID + Full Name */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-sliit-id">SLIIT ID</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">🎓</span>
                    <input
                      id="reg-sliit-id"
                      type="text" name="slIIId" className={`form-input${errors.slIIId ? ' form-input--error' : ''}`}
                      placeholder="IT12345678" value={form.slIIId} onChange={handleChange}
                      autoComplete="off" style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.slIIId && <p className="form-error">⚠ {errors.slIIId}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-fullname">Full Name</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">👤</span>
                    <input
                      id="reg-fullname"
                      type="text" name="fullName" className={`form-input${errors.fullName ? ' form-input--error' : ''}`}
                      placeholder="John Doe" value={form.fullName} onChange={handleChange}
                    />
                  </div>
                  {errors.fullName && <p className="form-error">⚠ {errors.fullName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">✉️</span>
                  <input
                    id="reg-email"
                    type="email" name="email" className={`form-input${errors.email ? ' form-input--error' : ''}`}
                    placeholder="student@sliit.lk" value={form.email} onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="form-error">⚠ {errors.email}</p>}
              </div>

              {/* Specialization */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-spec">Specialization</label>
                <div className="form-input-wrap">
                  <select
                    id="reg-spec"
                    name="specialization" className={`form-input form-select form-input--no-icon${errors.specialization ? ' form-input--error' : ''}`}
                    value={form.specialization} onChange={handleChange}
                  >
                    <option value="">Select specialization…</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.specialization && <p className="form-error">⚠ {errors.specialization}</p>}
              </div>

              {/* Year + Semester */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-year">Year</label>
                  <select
                    id="reg-year"
                    name="year" className={`form-input form-select form-input--no-icon${errors.year ? ' form-input--error' : ''}`}
                    value={form.year} onChange={handleChange}
                  >
                    <option value="">Year…</option>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                  {errors.year && <p className="form-error">⚠ {errors.year}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-semester">Semester</label>
                  <select
                    id="reg-semester"
                    name="semester" className={`form-input form-select form-input--no-icon${errors.semester ? ' form-input--error' : ''}`}
                    value={form.semester} onChange={handleChange}
                  >
                    <option value="">Sem…</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                  {errors.semester && <p className="form-error">⚠ {errors.semester}</p>}
                </div>
              </div>

              <button id="btn-register-next" type="button" className="btn-auth" onClick={handleNext}>
                Continue →
              </button>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
          {step === 2 && (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {alert && (
                <div className={`auth-alert auth-alert--${alert.type}`}>
                  <span className="auth-alert__icon">❌</span>
                  <span>{alert.text}</span>
                </div>
              )}

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">🔒</span>
                  <input
                    id="reg-password"
                    type={showPwd ? 'text' : 'password'} name="password"
                    className={`form-input form-input--pwd${errors.password ? ' form-input--error' : ''}`}
                    placeholder="Min 6 chars, letter + number" value={form.password} onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                    {showPwd ? '👁️' : '🙈'}
                  </button>
                </div>
                {form.password && (
                  <>
                    <div className="pwd-strength">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`pwd-strength__bar${i <= strength.fill ? ` pwd-strength__bar--${strength.level}` : ''}`} />
                      ))}
                    </div>
                    <p className="pwd-strength__label">Strength: <strong>{strength.label}</strong></p>
                  </>
                )}
                {errors.password && <p className="form-error">⚠ {errors.password}</p>}
                <p className="form-hint">At least 6 characters, one letter and one number</p>
              </div>

              {/* Confirm password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">🔒</span>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    className={`form-input form-input--pwd${errors.confirmPassword ? ' form-input--error' : ''}`}
                    placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm ? '👁️' : '🙈'}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword}</p>}
              </div>

              <div className="auth-form-actions">
                <button
                  type="button"
                  className="btn-auth btn-auth-secondary"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>

                <button
                  id="btn-register-submit"
                  type="submit"
                  className={`btn-auth btn-auth-grow${loading ? ' btn-auth--loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? <><div className="btn-spinner" /> Creating account…</> : '🚀 Create Account'}
                </button>
              </div>

              <p className="auth-footer">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
