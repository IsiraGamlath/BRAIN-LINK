import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  const [analytics, setAnalytics]   = useState(null);
  const [users, setUsers]           = useState([]);
  const [resources, setResources]   = useState([]);
  const [activeTab, setActiveTab]   = useState('analytics');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [toast, setToast]           = useState('');
  const [search, setSearch]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadAnalytics = async () => {
    setLoading(true);
    setAnalytics({
      totalUsers: 120,
      totalResources: 450,
      totalStudyGroups: 27,
      totalKuppiSessions: 338,
      reports: { Pending: 6, Reviewed: 14, Resolved: 7, total: 27 }
    });
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    setUsers([
      { _id: '1', fullName: 'Alice Silva', slIIId: 'IT21012345', email: 'alice@sliit.lk', role: 'student', isActive: true },
      { _id: '2', fullName: 'Bob Perera', slIIId: 'IT21012346', email: 'bob@sliit.lk', role: 'student', isActive: true },
      { _id: '3', fullName: 'Charles Admin', slIIId: 'IT00000001', email: 'admin@gmail.com', role: 'admin', isActive: true }
    ]);
    setLoading(false);
  };

  const loadResources = async () => {
    setLoading(true);
    setResources([
      { _id: 'r1', title: 'Data Structures Notes', uploader: { fullName: 'Alice Silva' }, views: 128, downloads: 74, fileType: 'pdf', visibility: 'public' },
      { _id: 'r2', title: 'Algorithms Past Paper', uploader: { fullName: 'Bob Perera' }, views: 220, downloads: 110, fileType: 'docx', visibility: 'public' }
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'analytics') loadAnalytics();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'resources') loadResources();
    // eslint-disable-next-line
  }, [activeTab]);

  const handleSuspend = (id, isActive) => {
    const nextUsers = users.map(u => u._id === id ? { ...u, isActive: !isActive } : u);
    setUsers(nextUsers);
    showToast(isActive ? 'User suspended successfully' : 'User activated successfully');
  };

  const handleDeleteResource = (id) => {
    if (!window.confirm('Remove this resource permanently?')) return;
    setResources(prev => prev.filter(r => r._id !== id));
    showToast('Resource removed');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'resources') loadResources();
  };

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__inner">
          <Link to="/" className="admin-back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Home
          </Link>
          <div className="admin-header__brand">
            <div className="admin-logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" fill="url(#aGrad)"/>
                <path d="M9 17 Q13 9 16 13 Q19 17 23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <circle cx="16" cy="21" r="3.5" fill="white" opacity="0.9"/>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#4F6EF7"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className="admin-header__title">Admin Panel</h1>
              <p className="admin-header__sub">BRAIN LINK — Moderation & Analytics</p>
            </div>
          </div>
          <Link to="/admin/reports" className="admin-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Reports
          </Link>
          <button id="admin-logout-btn" className="admin-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-container">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          {['analytics', 'users', 'resources'].map(tab => (
            <button
              key={tab}
              id={`admin-tab-${tab}`}
              className={`admin-tab ${activeTab === tab ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'analytics' && '📊 '}
              {tab === 'users'     && '👥 '}
              {tab === 'resources' && '📁 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="admin-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {loading && <div className="admin-loading"><div className="admin-spinner"/><span>Loading...</span></div>}

        {/* ── Analytics Tab ── */}
        {!loading && activeTab === 'analytics' && analytics && (
          <div className="admin-section">
            <h2 className="admin-section-title">Platform Analytics</h2>
            <div className="admin-stats-grid">
              <div className="stat-card stat-card--blue">
                <div className="stat-card__icon">👥</div>
                <div className="stat-card__value">{analytics.totalUsers}</div>
                <div className="stat-card__label">Total Users</div>
              </div>
              <div className="stat-card stat-card--purple">
                <div className="stat-card__icon">📁</div>
                <div className="stat-card__value">{analytics.totalResources}</div>
                <div className="stat-card__label">Resources</div>
              </div>
              <div className="stat-card stat-card--orange">
                <div className="stat-card__icon">⚠️</div>
                <div className="stat-card__value">{analytics.reports?.Pending || 0}</div>
                <div className="stat-card__label">Pending Reports</div>
              </div>
              <div className="stat-card stat-card--green">
                <div className="stat-card__icon">✅</div>
                <div className="stat-card__value">{analytics.reports?.Resolved || 0}</div>
                <div className="stat-card__label">Resolved Reports</div>
              </div>
              <div className="stat-card stat-card--teal">
                <div className="stat-card__icon">📚</div>
                <div className="stat-card__value">{analytics.totalStudyGroups}</div>
                <div className="stat-card__label">Study Groups</div>
              </div>
              <div className="stat-card stat-card--pink">
                <div className="stat-card__icon">🎓</div>
                <div className="stat-card__value">{analytics.totalKuppiSessions}</div>
                <div className="stat-card__label">Kuppi Sessions</div>
              </div>
            </div>

            <div className="admin-reports-summary">
              <h3>Report Status Breakdown</h3>
              <div className="report-bars">
                {['Pending', 'Reviewed', 'Resolved'].map(s => {
                  const count = analytics.reports?.[s] || 0;
                  const total = analytics.reports?.total || 1;
                  return (
                    <div key={s} className="report-bar-row">
                      <span className={`report-bar-label badge badge--${s.toLowerCase()}`}>{s}</span>
                      <div className="report-bar-track">
                        <div className={`report-bar-fill report-bar--${s.toLowerCase()}`}
                          style={{ width: `${(count / total) * 100}%` }}/>
                      </div>
                      <span className="report-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab ── */}
        {!loading && activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">User Management</h2>
              <form onSubmit={handleSearch} className="admin-search-form">
                <input
                  id="admin-user-search"
                  className="admin-search-input"
                  placeholder="Search by name, email, ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="admin-search-btn">Search</button>
              </form>
            </div>
            {users.length === 0 ? (
              <div className="admin-empty">No users found.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>SLIIT ID</th><th>Email</th>
                      <th>Role</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td><span className="admin-avatar">{u.fullName?.[0]}</span>{u.fullName}</td>
                        <td><code>{u.slIIId}</code></td>
                        <td>{u.email}</td>
                        <td><span className={`badge badge--${u.role}`}>{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge--active' : 'badge--suspended'}`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <button
                            id={`admin-user-action-${u._id}`}
                            className={`admin-action-btn ${u.isActive ? 'admin-action-btn--danger' : 'admin-action-btn--success'}`}
                            onClick={() => handleSuspend(u._id, u.isActive)}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Resources Tab ── */}
        {!loading && activeTab === 'resources' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Content Moderation</h2>
              <form onSubmit={handleSearch} className="admin-search-form">
                <input
                  id="admin-resource-search"
                  className="admin-search-input"
                  placeholder="Search resources..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button type="submit" className="admin-search-btn">Search</button>
              </form>
            </div>
            {resources.length === 0 ? (
              <div className="admin-empty">No resources found.</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th><th>Subject</th><th>Type</th>
                      <th>Uploader</th><th>Views</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r._id}>
                        <td className="admin-table__title">{r.title}</td>
                        <td>{r.subject}</td>
                        <td><span className="badge badge--type">{r.fileType}</span></td>
                        <td>{r.uploader?.fullName || 'Unknown'}</td>
                        <td>{r.views}</td>
                        <td>
                          <button
                            id={`admin-delete-resource-${r._id}`}
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => handleDeleteResource(r._id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
