import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  apiCreateReport,
  apiDeleteReport,
  apiGetReports,
  apiUpdateReportStatus
} from '../api/api';
import './ReportsPage.css';

const STATUSES = ['', 'Pending', 'Reviewed', 'Resolved', 'Rejected'];
const TYPES    = ['', 'group', 'request', 'user', 'resource'];

const ReportsPage = () => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState({ msg: '', ok: true });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm] = useState({ type: 'group', referenceId: '', reason: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const loadReports = async (statusValue = filterStatus, typeValue = filterType) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusValue) params.set('status', statusValue);
      if (typeValue) params.set('type', typeValue);
      params.set('limit', '200');

      const query = params.toString();
      const data = await apiGetReports(query ? `?${query}` : '');
      setReports(Array.isArray(data?.reports) ? data.reports : []);
    } catch (e) {
      setError(e.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType]);

  const validateForm = () => {
    const errs = {};
    if (!form.type)                           errs.type        = 'Type is required';
    if (!form.referenceId.trim())             errs.referenceId = 'Reference ID is required';
    if (form.reason.trim().length < 10)       errs.reason      = 'Reason must be at least 10 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');
      const result = await apiCreateReport({
        type: form.type,
        referenceId: form.referenceId.trim(),
        reason: form.reason.trim()
      });

      showToast(result?.message || 'Report submitted successfully ✓');
      setShowForm(false);
      setForm({ type: 'group', referenceId: '', reason: '' });
      setFormErrors({});
      await loadReports();
    } catch (e) {
      setError(e.message || 'Failed to submit report');
      showToast(e.message || 'Failed to submit report', false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setError('');
      const result = await apiUpdateReportStatus(id, status);
      showToast(result?.message || `Status updated to "${status}"`);
      await loadReports();
    } catch (e) {
      setError(e.message || 'Failed to update report status');
      showToast(e.message || 'Failed to update report status', false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      const result = await apiDeleteReport(id);
      showToast(result?.message || 'Report deleted successfully');
      await loadReports();
    } catch (e) {
      setError(e.message || 'Failed to delete report');
      showToast(e.message || 'Failed to delete report', false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchStatus = !filterStatus || filterStatus === '' || r.status === filterStatus;
    const matchType   = !filterType   || filterType   === '' || r.type === filterType;
    return matchStatus && matchType;
  });

  return (
    <div className="reports-page">
      {toast.msg && (
        <div className={`rp-toast ${toast.ok ? 'rp-toast--ok' : 'rp-toast--err'}`}>{toast.msg}</div>
      )}

      {/* Header */}
      <header className="rp-header">
        <div className="rp-header__inner">
          <div className="rp-header__center">
            <span className="rp-header__icon">🛡️</span>
            <div>
              <h1 className="rp-header__title">Report Management</h1>
              <p className="rp-header__sub">View and manage platform reports</p>
            </div>
          </div>
          <div className="rp-header__actions">
            <Link to="/admin-dashboard" className="rp-admin-link">Admin Panel</Link>
            <button id="rp-new-report-btn" className="rp-btn rp-btn--primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Report'}
            </button>
          </div>
        </div>
      </header>

      <div className="rp-container">
        {/* New Report Form */}
        {showForm && (
          <div className="rp-form-card">
            <h3 className="rp-form-title">Submit a Report</h3>
            <form onSubmit={handleSubmit} className="rp-form" noValidate>
              <div className="rp-form-row">
                <div className="rp-form-group">
                  <label htmlFor="rp-type">Report Type *</label>
                  <select
                    id="rp-type"
                    className={`rp-select ${formErrors.type ? 'rp-input--error' : ''}`}
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="group">Study Group</option>
                    <option value="request">Help Request</option>
                    <option value="user">User</option>
                    <option value="resource">Resource</option>
                  </select>
                  {formErrors.type && <span className="rp-field-error">{formErrors.type}</span>}
                </div>
                <div className="rp-form-group">
                  <label htmlFor="rp-refId">Reference ID *</label>
                  <input
                    id="rp-refId"
                    placeholder="MongoDB ObjectId of reported item"
                    className={`rp-input ${formErrors.referenceId ? 'rp-input--error' : ''}`}
                    value={form.referenceId}
                    onChange={e => setForm({...form, referenceId: e.target.value})}
                  />
                  {formErrors.referenceId && <span className="rp-field-error">{formErrors.referenceId}</span>}
                </div>
              </div>
              <div className="rp-form-group">
                <label htmlFor="rp-reason">Reason * <span className="rp-char-count">({form.reason.length}/min 10)</span></label>
                <textarea
                  id="rp-reason"
                  rows={4}
                  placeholder="Describe the issue in detail (minimum 10 characters)..."
                  className={`rp-textarea ${formErrors.reason ? 'rp-input--error' : ''}`}
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
                />
                {formErrors.reason && <span className="rp-field-error">{formErrors.reason}</span>}
              </div>
              <div className="rp-form-footer">
                <button type="button" className="rp-btn rp-btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button id="rp-submit-btn" type="submit" className="rp-btn rp-btn--primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="rp-filters">
          <div className="rp-filter-group">
            <label>Status</label>
            <div className="rp-filter-pills">
              {STATUSES.map(s => (
                <button
                  key={s || 'all'}
                  id={`rp-filter-status-${s || 'all'}`}
                  className={`rp-pill ${filterStatus === s ? 'rp-pill--active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="rp-filter-group">
            <label>Type</label>
            <div className="rp-filter-pills">
              {TYPES.map(t => (
                <button
                  key={t || 'all'}
                  id={`rp-filter-type-${t || 'all'}`}
                  className={`rp-pill ${filterType === t ? 'rp-pill--active' : ''}`}
                  onClick={() => setFilterType(t)}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="rp-error">{error}</div>}
        {loading && (
          <div className="rp-loading">
            <div className="rp-spinner"/>
            <span>Loading reports...</span>
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="rp-empty">
            <div className="rp-empty__icon">📋</div>
            <p>No reports found for the selected filters.</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="rp-table-wrap">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reported By</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(r => (
                  <tr key={r._id}>
                    <td>
                      <span className={`rp-badge rp-badge--type-${r.type}`}>
                        {r.type === 'group' ? '👥' : r.type === 'request' ? '❓' : r.type === 'resource' ? '📁' : '👤'} {r.type}
                      </span>
                    </td>
                    <td>
                      <div className="rp-reporter">
                        <span className="rp-avatar">{r.reportedBy?.fullName?.[0] || '?'}</span>
                        <span>{r.reportedBy?.fullName || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="rp-reason">{r.reason}</td>
                    <td>
                      <select
                        id={`rp-status-${r._id}`}
                        className={`rp-status-select rp-status--${r.status?.toLowerCase()}`}
                        value={r.status}
                        onChange={e => handleStatusChange(r._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="rp-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        id={`rp-delete-${r._id}`}
                        className="rp-delete-btn"
                        onClick={() => handleDelete(r._id)}
                        title="Delete report"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
