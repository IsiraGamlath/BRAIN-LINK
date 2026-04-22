import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './CreateReportPage.css';

const API_BASE = 'http://localhost:5000';

const CreateReportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = localStorage.getItem('token');
  
  // Extract query params
  const queryType = searchParams.get('type');
  const queryId = searchParams.get('id');
  const queryTitle = searchParams.get('title');

  const [form, setForm] = useState({ 
    type: queryType || 'group', 
    referenceId: queryId || '', 
    reason: '' 
  });
  
  const [resources, setResources] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', ok: true });

  const TYPES = ['group', 'request', 'user', 'resource'];

  useEffect(() => {
    // Only fetch if we don't have query params
    if (!queryId) {
      const fetchData = async () => {
        try {
          const headers = { 'Authorization': `Bearer ${token}` };
          
          const resResources = await fetch(`${API_BASE}/api/resources/names/all`, { headers });
          if (resResources.ok) setResources(await resResources.json());
          
          const resGroups = await fetch(`${API_BASE}/api/groups/names/all`, { headers });
          if (resGroups.ok) setGroups(await resGroups.json());
        } catch (err) {
          console.error('Error fetching dropdown data:', err);
        }
      };
      if (token) fetchData();
    }
  }, [token, queryId]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.type) errs.type = 'Type is required';
    if (!form.referenceId) errs.referenceId = 'Selection is required';
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
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit report');
      }

      alert('Report submitted successfully');
      setForm({ type: queryType || 'group', referenceId: queryId || '', reason: '' });
      setSelectedImage(null);
      
      navigate('/user-dashboard');
    } catch (err) {
      showToast(err.message, false);
    } finally {
      setSubmitting(false);
    }
  };

  const renderReferenceSelector = () => {
    // If we have query params, just show the title
    if (queryId) {
      return (
        <div className="crp-info-box">
          <label>Reporting {form.type.charAt(0).toUpperCase() + form.type.slice(1)}:</label>
          <p className="crp-target-title">{queryTitle || queryId}</p>
        </div>
      );
    }

    if (form.type === 'resource') {
      return (
        <div className="crp-form-group">
          <label htmlFor="crp-refId">Select Resource *</label>
          <select
            id="crp-refId"
            className={`crp-select ${formErrors.referenceId ? 'crp-input--error' : ''}`}
            value={form.referenceId}
            onChange={e => setForm({...form, referenceId: e.target.value})}
          >
            <option value="">-- Select Resource --</option>
            {resources.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
          {formErrors.referenceId && <span className="crp-field-error">{formErrors.referenceId}</span>}
        </div>
      );
    }

    if (form.type === 'group') {
      return (
        <div className="crp-form-group">
          <label htmlFor="crp-refId">Select Group *</label>
          <select
            id="crp-refId"
            className={`crp-select ${formErrors.referenceId ? 'crp-input--error' : ''}`}
            value={form.referenceId}
            onChange={e => setForm({...form, referenceId: e.target.value})}
          >
            <option value="">-- Select Group --</option>
            {groups.map(g => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
          {formErrors.referenceId && <span className="crp-field-error">{formErrors.referenceId}</span>}
        </div>
      );
    }

    return (
      <div className="crp-form-group">
        <label htmlFor="crp-refId">Reference ID *</label>
        <input
          id="crp-refId"
          type="text"
          placeholder="ID of reported item"
          className={`crp-input ${formErrors.referenceId ? 'crp-input--error' : ''}`}
          value={form.referenceId}
          onChange={e => setForm({...form, referenceId: e.target.value})}
        />
        {formErrors.referenceId && <span className="crp-field-error">{formErrors.referenceId}</span>}
      </div>
    );
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
              {!queryId && (
                <div className="crp-form-group">
                  <label htmlFor="crp-type">Report Type *</label>
                  <select
                    id="crp-type"
                    className={`crp-select ${formErrors.type ? 'crp-input--error' : ''}`}
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value, referenceId: ''})}
                  >
                    {TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  {formErrors.type && <span className="crp-field-error">{formErrors.type}</span>}
                </div>
              )}

              {renderReferenceSelector()}
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
                onChange={e => setSelectedImage(e.target.files[0])}
              />
              {selectedImage && <p className="crp-file-info">📎 {selectedImage.name}</p>}
              <small>Max file size: 5MB. Supported: PNG, JPG, GIF, WebP</small>
            </div>

            <div className="crp-form-footer">
              <button type="button" className="crp-btn crp-btn--ghost" onClick={() => navigate(-1)}>
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
