import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiDeleteResource, apiGetProfile, apiGetResources } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  const [profile, setProfile]     = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        const profileData = await apiGetProfile();
        const currentProfile = profileData?.user || profileData;
        setProfile(currentProfile || authUser || null);

        const resourceData = await apiGetResources('?sort=-createdAt&limit=100');
        const allResources = Array.isArray(resourceData?.resources) ? resourceData.resources : [];
        const currentUserId = String(currentProfile?._id || authUser?._id || '');

        const myResources = allResources.filter((r) => {
          const uploaderId = typeof r.uploader === 'object' ? r.uploader?._id : r.uploader;
          return String(uploaderId || '') === currentUserId;
        });

        setResources(myResources);
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    };
    load();
  }, [authUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await apiDeleteResource(id);
      setResources(prev => prev.filter(r => r._id !== id));
      showToast('Resource deleted');
    } catch (e) { showToast(`Error: ${e.message}`); }
  };

  const stats = [
    { label: 'Resources Uploaded', value: resources.length, icon: '📁', color: 'blue' },
    { label: 'Total Views',        value: resources.reduce((s,r)=>s+(r.views || 0),0), icon: '👁️', color: 'purple' },
    { label: 'Total Downloads',    value: resources.reduce((s,r)=>s+(r.downloads || 0),0), icon: '⬇️', color: 'teal' },
    { label: 'Groups Joined',      value: profile?.joinedGroups?.length || 0, icon: '👥', color: 'green' }
  ];

  if (loading) return (
    <div className="ud-loading-screen">
      <div className="ud-spinner"/>
      <span>Loading your dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="ud-error-screen">
      <div className="ud-error-icon">⚠️</div>
      <h2>Unauthorized Access</h2>
      <p>{error}</p>
      <Link to="/" className="ud-home-link">← Go Home</Link>
    </div>
  );

  return (
    <div className="ud-page">
      {toast && <div className="ud-toast">{toast}</div>}

      {/* Header */}
      <header className="ud-header">
        <div className="ud-header__inner">
          <Link to="/" className="ud-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Home
          </Link>
          <div className="ud-header__brand">
            <div className="ud-header__avatar">{profile?.fullName?.[0]}</div>
            <div>
              <h1 className="ud-header__name">{profile?.fullName}</h1>
              <p className="ud-header__meta">{profile?.slIIId} · {profile?.specialization} · Year {profile?.year}, Sem {profile?.semester}</p>
            </div>
          </div>
          <span className={`ud-role-badge ud-role--${profile?.role}`}>{profile?.role}</span>
          <button id="ud-logout-btn" className="admin-logout-btn" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="ud-container">
        {/* Stats */}
        <div className="ud-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className={`ud-stat-card ud-stat--${s.color}`}>
              <span className="ud-stat__icon">{s.icon}</span>
              <span className="ud-stat__value">{s.value}</span>
              <span className="ud-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="ud-tabs">
          {['overview', 'resources'].map(t => (
            <button
              key={t}
              id={`ud-tab-${t}`}
              className={`ud-tab ${activeTab === t ? 'ud-tab--active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'overview' ? '🎯 Overview' : '📁 My Resources'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="ud-section">
            <div className="ud-overview-grid">
              {/* Profile Card */}
              <div className="ud-card">
                <h3 className="ud-card__title">👤 Profile Info</h3>
                <div className="ud-profile-rows">
                  {[
                    ['Full Name',       profile?.fullName],
                    ['SLIIT ID',        profile?.slIIId],
                    ['Email',           profile?.email],
                    ['Specialization',  profile?.specialization],
                    ['Year',            `Year ${profile?.year}`],
                    ['Semester',        `Semester ${profile?.semester}`],
                    ['Role',            profile?.role],
                    ['Account Status',  profile?.isActive ? 'Active ✓' : 'Suspended ✗']
                  ].map(([k, v]) => (
                    <div key={k} className="ud-profile-row">
                      <span className="ud-profile-row__key">{k}</span>
                      <span className="ud-profile-row__val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Card */}
              <div className="ud-card">
                <h3 className="ud-card__title">📊 Activity Summary</h3>
                <div className="ud-activity-list">
                  <div className="ud-activity-item">
                    <span className="ud-activity-dot ud-dot--blue"/>
                    <span>Resources Uploaded: <strong>{resources.length}</strong></span>
                  </div>
                  <div className="ud-activity-item">
                    <span className="ud-activity-dot ud-dot--purple"/>
                    <span>Total Views Received: <strong>{resources.reduce((s,r)=>s+(r.views || 0),0)}</strong></span>
                  </div>
                  <div className="ud-activity-item">
                    <span className="ud-activity-dot ud-dot--teal"/>
                    <span>Total Downloads: <strong>{resources.reduce((s,r)=>s+(r.downloads || 0),0)}</strong></span>
                  </div>
                  <div className="ud-activity-item">
                    <span className="ud-activity-dot ud-dot--green"/>
                    <span>Study Groups Joined: <strong>{profile?.joinedGroups?.length || 0}</strong></span>
                  </div>
                  <div className="ud-activity-item">
                    <span className="ud-activity-dot ud-dot--orange"/>
                    <span>Member Since: <strong>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</strong></span>
                  </div>
                </div>

                <div className="ud-quick-links">
                  <Link to="/resources" className="ud-quick-link">📁 Browse Resources</Link>
                  <Link to="/resources" className="ud-quick-link">🛡️ Report an Issue</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="ud-section">
            <div className="ud-section-header">
              <h2 className="ud-section-title">My Uploaded Resources</h2>
              <Link to="/resources" id="ud-upload-link" className="ud-upload-btn">+ Upload New Resource</Link>
            </div>
            {resources.length === 0 ? (
              <div className="ud-empty">
                <div className="ud-empty__icon">📭</div>
                <p>You haven't uploaded any resources yet.</p>
                <Link to="/resources" className="ud-cta-link">Upload your first resource →</Link>
              </div>
            ) : (
              <div className="ud-resource-grid">
                {resources.map(r => (
                  <div key={r._id} className="ud-resource-card">
                    <div className="ud-res-type-badge">{r.fileType}</div>
                    <h4 className="ud-res-title">{r.title}</h4>
                    <p className="ud-res-subject">{r.subject}</p>
                    <p className="ud-res-desc">{r.description ? `${r.description.slice(0, 80)}...` : 'No description available.'}</p>
                    <div className="ud-res-meta">
                      <span>👁 {r.views || 0}</span>
                      <span>⬇ {r.downloads || 0}</span>
                      <span>⭐ {(r.totalRatings || 0) > 0 ? Number(r.averageRating || 0).toFixed(1) : '—'}</span>
                    </div>
                    <div className="ud-res-actions">
                      <Link to="/resources" id={`ud-edit-${r._id}`} className="ud-res-btn ud-res-btn--edit">Edit</Link>
                      <button id={`ud-del-${r._id}`} className="ud-res-btn ud-res-btn--delete" onClick={() => handleDelete(r._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
