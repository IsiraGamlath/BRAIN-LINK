import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ReportManagementPage.css';

const API_BASE_URL = '/api/reports';

const ReportManagementPage = () => {
  const token = localStorage.getItem('token');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ msg: '', ok: true });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const STATUSES = ['', 'Pending', 'Reviewed', 'Resolved'];
  const TYPES = ['', 'group', 'request', 'user', 'resource'];

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Failed to load reports: ${response.statusText}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
      showToast('Failed to load reports', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadReports();
    }
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      showToast(`Status updated to "${status}"`);
      loadReports();
    } catch (err) {
      showToast(err.message, false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete report');
      }

      showToast('Report deleted successfully');
      loadReports();
    } catch (err) {
      showToast(err.message, false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchStatus = !filterStatus || filterStatus === '' || r.status === filterStatus;
    const matchType = !filterType || filterType === '' || r.type === filterType;
    return matchStatus && matchType;
  });

  return (
    <div className="rmp-page">
      {toast.msg && (
        <div className={`rmp-toast ${toast.ok ? 'rmp-toast--ok' : 'rmp-toast--err'}`}>
          {toast.msg}
        </div>
      )}

      <header className="rmp-header">
        <div className="rmp-header__inner">
          <Link to="/admin-dashboard" className="rmp-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Admin Dashboard
          </Link>
          <div className="rmp-header__center">
            <span className="rmp-header__icon">🛡️</span>
            <div>
              <h1 className="rmp-header__title">Report Management</h1>
              <p className="rmp-header__sub">Review and manage user reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="rmp-container">
        {/* Filters */}
        <div className="rmp-filters">
          <div className="rmp-filter-group">
            <label>Status</label>
            <div className="rmp-filter-pills">
              {STATUSES.map(s => (
                <button
                  key={s || 'all'}
                  className={`rmp-pill ${filterStatus === s ? 'rmp-pill--active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          <div className="rmp-filter-group">
            <label>Type</label>
            <div className="rmp-filter-pills">
              {TYPES.map(t => (
                <button
                  key={t || 'all'}
                  className={`rmp-pill ${filterType === t ? 'rmp-pill--active' : ''}`}
                  onClick={() => setFilterType(t)}
                >
                  {t || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="rmp-error">{error}</div>}

        {loading && (
          <div className="rmp-loading">
            <div className="rmp-spinner"/>
            <span>Loading reports...</span>
          </div>
        )}

        {!loading && reports.length === 0 && (
          <div className="rmp-empty">
            <div className="rmp-empty__icon">📋</div>
            <p>No reports found.</p>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="rmp-table-wrap">
            <table className="rmp-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reported By</th>
                  <th>Reason</th>
                  <th>Evidence</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(r => (
                  <tr key={r._id}>
                    <td>
                      <span className={`rmp-badge rmp-badge--${r.type}`}>
                        {r.type === 'group' ? '👥' : r.type === 'request' ? '❓' : r.type === 'user' ? '👤' : '📄'}
                        {' '}{r.type.charAt(0).toUpperCase() + r.type.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="rmp-reporter">
                        <span className="rmp-reporter-id">{r.reportedBy?.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="rmp-reason">{r.reason}</td>
                    <td>
                      {r.image ? (
                        <button
                          className="rmp-view-image"
                          onClick={() => window.open(`/${r.image}`, '_blank')}
                          title="Click to view image"
                        >
                          📸 View
                        </button>
                      ) : (
                        <span className="rmp-no-file">—</span>
                      )}
                    </td>
                    <td>
                      <select
                        className={`rmp-status-select rmp-status--${r.status?.toLowerCase()}`}
                        value={r.status}
                        onChange={e => handleStatusChange(r._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="rmp-date">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="rmp-delete-btn"
                        onClick={() => handleDelete(r._id)}
                        title="Delete report"
                      >
                        🗑 Delete
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

export default ReportManagementPage;
