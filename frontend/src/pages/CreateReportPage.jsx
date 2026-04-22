import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateReportPage.css';


const CreateReportPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({ type: 'group', referenceId: '', reason: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', ok: true });

  const TYPES = ['group', 'request', 'user', 'resource'];

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.type) errs.type = 'Type is required';
    if (!form.referenceId.trim()) errs.referenceId = 'Reference ID is required';
    if (form.reason.trim().length < 10) errs.reason = 'Reason must be at least 10 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('referenceId', form.referenceId);
      formData.append('reason', form.reason);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }

      showToast('✓ Report submitted successfully!');
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="crp-page">
      {toast.msg && (
        <div className={`crp-toast ${toast.ok ? 'crp-toast--ok' : 'crp-toast--err'}`}>
          {toast.msg}
        </div>
      )}

      <header className="crp-header">
        <div className="crp-header__inner">
          <Link to="/user-dashboard" className="crp-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Dashboard
          </Link>
          <div className="crp-header__center">
            <span className="crp-header__icon">📝</span>
            <div>
              <h1 className="crp-header__title">Create Report</h1>
              <p className="crp-header__sub">Report inappropriate content or behavior</p>
            </div>
          </div>
        </div>
      </header>

      <div className="crp-container">
        <div className="crp-form-card">
          <form onSubmit={handleSubmit} className="crp-form" noValidate>
            <div className="crp-form-row">
              <div className="crp-form-group">
                <label htmlFor="crp-type">Report Type *</label>
                <select
                  id="crp-type"
                  className={`crp-select ${formErrors.type ? 'crp-input--error' : ''}`}
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.type && <span className="crp-field-error">{formErrors.type}</span>}
              </div>

              <div className="crp-form-group">
                <label htmlFor="crp-refId">Reference ID *</label>
                <input
                  id="crp-refId"
                  type="text"
                  placeholder="MongoDB ObjectId of reported item"
                  className={`crp-input ${formErrors.referenceId ? 'crp-input--error' : ''}`}
                  value={form.referenceId}
                  onChange={e => setForm({...form, referenceId: e.target.value})}
                />
                {formErrors.referenceId && <span className="crp-field-error">{formErrors.referenceId}</span>}
              </div>
            </div>

            <div className="crp-form-group">
              <label htmlFor="crp-reason">Reason * <span className="crp-char-count">({form.reason.length}/min 10)</span></label>
              <textarea
                id="crp-reason"
                rows={5}
                placeholder="Describe the issue in detail (minimum 10 characters)..."
                className={`crp-textarea ${formErrors.reason ? 'crp-input--error' : ''}`}
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
              />
              {formErrors.reason && <span className="crp-field-error">{formErrors.reason}</span>}
            </div>

            <div className="crp-form-group">
              <label htmlFor="crp-file">Attach Evidence Image (optional)</label>
              <input
                id="crp-file"
                type="file"
                accept="image/*"
                className="crp-input"
                onChange={e => setSelectedFile(e.target.files[0])}
              />
              {selectedFile && <p className="crp-file-info">📎 {selectedFile.name}</p>}
              <small>Max file size: 5MB. Supported: PNG, JPG, GIF, WebP</small>
            </div>

            <div className="crp-form-footer">
              <button type="button" className="crp-btn crp-btn--ghost" onClick={() => navigate('/user-dashboard')}>
                Cancel
              </button>
              <button type="submit" className="crp-btn crp-btn--primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>

        <div className="crp-info">
          <h3>📋 Report Guidelines</h3>
          <ul>
            <li>Be specific and provide relevant details</li>
            <li>Include screenshots or evidence if available</li>
            <li>Avoid false or misleading reports</li>
            <li>Our team will review within 24-48 hours</li>
            <li>All reports are confidential</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateReportPage;
