import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ResourcePage.css';

const FILE_TYPES     = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image', 'link', 'other'];
const RESOURCE_TYPES = ['lecture_notes','past_papers','assignments','tutorials','project_guides','video_tutorials','reference_materials','other'];
const VISIBILITIES   = ['public', 'batch', 'private'];

const EMPTY_FORM = { title:'', description:'', fileUrl:'', fileType:'pdf', subject:'', topic:'', tags:'', resourceType:'lecture_notes', visibility:'batch' };

// Mock data for resources
const MOCK_RESOURCES = [
  {
    _id: 'r1',
    title: 'Data Structures Notes',
    description: 'Comprehensive notes on data structures including arrays, linked lists, stacks, and queues.',
    fileUrl: 'https://example.com/ds-notes.pdf',
    fileType: 'pdf',
    subject: 'Computer Science',
    topic: 'Data Structures',
    tags: ['data structures', 'algorithms', 'notes'],
    resourceType: 'lecture_notes',
    visibility: 'public',
    uploader: { _id: 'u1', fullName: 'Alice Silva' },
    views: 128,
    downloads: 74,
    rating: 4.5,
    comments: [
      { _id: 'c1', user: { fullName: 'Bob Perera' }, text: 'Great notes!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'r2',
    title: 'Algorithms Past Paper',
    description: 'Past examination paper for Algorithms course with solutions.',
    fileUrl: 'https://example.com/algorithms-paper.docx',
    fileType: 'docx',
    subject: 'Computer Science',
    topic: 'Algorithms',
    tags: ['algorithms', 'past paper', 'exam'],
    resourceType: 'past_papers',
    visibility: 'public',
    uploader: { _id: 'u2', fullName: 'Bob Perera' },
    views: 220,
    downloads: 110,
    rating: 4.2,
    comments: [],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'r3',
    title: 'Database Design Tutorial',
    description: 'Step-by-step tutorial on database design principles and normalization.',
    fileUrl: 'https://example.com/db-tutorial.pdf',
    fileType: 'pdf',
    subject: 'Computer Science',
    topic: 'Database Systems',
    tags: ['database', 'design', 'normalization'],
    resourceType: 'tutorials',
    visibility: 'batch',
    uploader: { _id: 'u1', fullName: 'Alice Silva' },
    views: 95,
    downloads: 45,
    rating: 4.8,
    comments: [
      { _id: 'c2', user: { fullName: 'Charlie Admin' }, text: 'Very helpful tutorial!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const ResourcePage = () => {
  const [resources, setResources]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [toast, setToast]             = useState({ msg:'', ok:true });
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [search, setSearch]           = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterType, setFilterType]   = useState('');
  const [ratingTarget, setRatingTarget] = useState(null);
  const [commentTarget, setCommentTarget] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [hoverStar, setHoverStar] = useState(0);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3000);
  };

  const loadResources = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filtered = [...MOCK_RESOURCES];
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(searchLower) ||
          r.subject.toLowerCase().includes(searchLower) ||
          r.topic.toLowerCase().includes(searchLower) ||
          (r.tags && r.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      
      // Apply subject filter
      if (filterSubject) {
        filtered = filtered.filter(r => r.subject === filterSubject);
      }
      
      // Apply resource type filter
      if (filterType) {
        filtered = filtered.filter(r => r.resourceType === filterType);
      }
      
      setResources(filtered);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, filterSubject, filterType]);

  useEffect(() => { loadResources(); }, [loadResources]);

  const validateForm = () => {
    const e = {};
    if (!form.title || form.title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.subject)                               e.subject = 'Subject is required';
    if (!form.description || form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.fileUrl)                               e.fileUrl = 'File URL is required';
    if (!/^https?:\/\/.+/.test(form.fileUrl))        e.fileUrl = 'Must be a valid URL starting with http/https';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true); };
  const openEdit   = (r) => {
    setEditTarget(r._id);
    setForm({ title:r.title, description:r.description, fileUrl:r.fileUrl, fileType:r.fileType, subject:r.subject, topic:r.topic||'', tags:(r.tags||[]).join(', '), resourceType:r.resourceType, visibility:r.visibility });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      
      if (editTarget) {
        // Update existing resource
        setResources(prev => prev.map(r => 
          r._id === editTarget 
            ? { ...r, ...payload, updatedAt: new Date().toISOString() }
            : r
        ));
        showToast('Resource updated ✓');
      } else {
        // Create new resource
        const newResource = {
          ...payload,
          _id: `r${Date.now()}`,
          uploader: { _id: 'u1', fullName: 'Current User' }, // Mock current user
          views: 0,
          downloads: 0,
          rating: 0,
          comments: [],
          createdAt: new Date().toISOString()
        };
        setResources(prev => [newResource, ...prev]);
        showToast('Resource uploaded ✓');
      }
      
      setShowModal(false);
      loadResources();
    } catch (err) { showToast(err.message, false); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      setResources(prev => prev.filter(r => r._id !== id));
      showToast('Resource deleted');
      loadResources();
    } catch (e) { showToast(e.message, false); }
  };

  const handleDownload = async (r) => {
    try {
      // Mock download - just open the file URL
      window.open(r.fileUrl, '_blank');
      showToast('Download started ⬇');
      // Update download count in mock data
      setResources(prev => prev.map(res => 
        res._id === r._id 
          ? { ...res, downloads: res.downloads + 1 }
          : res
      ));
      loadResources();
    } catch (e) { showToast(e.message, false); }
  };

  const handleRate = async (id, rating) => {
    try {
      // Mock rating update
      setResources(prev => prev.map(r => 
        r._id === id 
          ? { ...r, rating: rating }
          : r
      ));
      showToast(`Rated ${rating} ★`);
      setRatingTarget(null);
      loadResources();
    } catch (e) { showToast(e.message, false); }
  };

  const handleComment = async (id) => {
    if (!commentText.trim() || commentText.trim().length < 3) { showToast('Comment must be at least 3 characters', false); return; }
    try {
      // Mock comment addition
      const newComment = {
        _id: `c${Date.now()}`,
        user: { fullName: 'Current User' }, // Mock current user
        text: commentText.trim(),
        createdAt: new Date().toISOString()
      };
      
      setResources(prev => prev.map(r => 
        r._id === id 
          ? { ...r, comments: [...(r.comments || []), newComment] }
          : r
      ));
      
      showToast('Comment added ✓');
      setCommentTarget(null);
      setCommentText('');
    } catch (e) { showToast(e.message, false); }
  };

  const subjects = [...new Set(resources.map(r=>r.subject).filter(Boolean))];

  const F = (k) => (e) => setForm(f=>({...f, [k]: e.target.value}));

  return (
    <div className="rp-page">
      {toast.msg && <div className={`rp-page-toast ${toast.ok?'rp-page-toast--ok':'rp-page-toast--err'}`}>{toast.msg}</div>}

      {/* Header */}
      <header className="rp-page-header">
        <div className="rp-page-header__inner">
          <Link to="/" className="rp-page-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Home
          </Link>
          <div className="rp-page-brand">
            <span className="rp-page-brand__icon">📚</span>
            <div>
              <h1 className="rp-page-brand__title">Resource Library</h1>
              <p className="rp-page-brand__sub">Study materials, notes & more</p>
            </div>
          </div>
          <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
            <Link to="/user-dashboard" className="rp-page-nav-link">My Dashboard</Link>
            <button id="rp-upload-btn" className="rp-page-upload-btn" onClick={openCreate}>+ Upload Resource</button>
          </div>
        </div>
      </header>

      <div className="rp-page-container">
        {/* Search + Filters */}
        <div className="rp-controls">
          <div className="rp-search-wrap">
            <svg className="rp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              id="rp-search-input"
              className="rp-search"
              placeholder="Search by title, subject, or tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="rp-filter-subject" className="rp-filter-sel" value={filterSubject} onChange={e=>setFilterSubject(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select id="rp-filter-rtype" className="rp-filter-sel" value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
          </select>
          {(search||filterSubject||filterType) && (
            <button className="rp-clear-btn" onClick={()=>{setSearch('');setFilterSubject('');setFilterType('');}}>Clear</button>
          )}
        </div>

        {/* Stats bar */}
        <div className="rp-stats-bar">
          <span className="rp-stats-count">{resources.length} resource{resources.length!==1?'s':''} found</span>
          <span className="rp-stats-divider"/>
          <span className="rp-stats-item">👁 {resources.reduce((s,r)=>s+r.views,0)} total views</span>
          <span className="rp-stats-item">⬇ {resources.reduce((s,r)=>s+r.downloads,0)} downloads</span>
        </div>

        {error  && <div className="rp-page-error">{error}</div>}
        {loading && <div className="rp-page-loading"><div className="rp-page-spin"/><span>Loading resources...</span></div>}

        {!loading && resources.length === 0 && (
          <div className="rp-page-empty">
            <div className="rp-page-empty__icon">📭</div>
            <p>No resources found. Try different filters or upload one!</p>
          </div>
        )}

        {/* Resource Grid */}
        {!loading && resources.length > 0 && (
          <div className="rp-grid">
            {resources.map(r => (
              <div key={r._id} className="res-card">
                <div className="res-card__top">
                  <div className="res-card__badges">
                    <span className="res-badge res-badge--type">{r.fileType}</span>
                    <span className="res-badge res-badge--vis">{r.visibility}</span>
                  </div>
                  <h3 className="res-card__title">{r.title}</h3>
                  <p className="res-card__subject">{r.subject}</p>
                  <p className="res-card__desc">{r.description?.slice(0,100)}{r.description?.length>100?'...':''}</p>
                  {r.tags?.length > 0 && (
                    <div className="res-card__tags">
                      {r.tags.slice(0,3).map(t=><span key={t} className="res-tag">#{t}</span>)}
                    </div>
                  )}
                </div>
                <div className="res-card__meta">
                  <span>👁 {r.views}</span>
                  <span>⬇ {r.downloads}</span>
                  <span>⭐ {r.averageRating?.toFixed(1)||'—'} ({r.totalRatings})</span>
                </div>
                <div className="res-card__uploader">
                  <span className="res-av">{r.uploader?.fullName?.[0]||'?'}</span>
                  <span>{r.uploader?.fullName||'Unknown'}</span>
                </div>

                {/* Action buttons */}
                <div className="res-card__actions">
                  <button id={`res-dl-${r._id}`} className="res-action-btn res-action--download" onClick={()=>handleDownload(r)} title="Download">⬇</button>
                  <button id={`res-rate-${r._id}`} className="res-action-btn res-action--rate" onClick={()=>setRatingTarget(ratingTarget===r._id?null:r._id)} title="Rate">⭐</button>
                  <button id={`res-comment-${r._id}`} className="res-action-btn res-action--comment" onClick={()=>setCommentTarget(commentTarget===r._id?null:r._id)} title="Comment">💬</button>
                  <button id={`res-edit-${r._id}`} className="res-action-btn res-action--edit" onClick={()=>openEdit(r)} title="Edit">✏️</button>
                  <button id={`res-del-${r._id}`} className="res-action-btn res-action--delete" onClick={()=>handleDelete(r._id)} title="Delete">🗑</button>
                </div>

                {/* Star Rating Inline */}
                {ratingTarget === r._id && (
                  <div className="res-rating-panel">
                    <p>Rate this resource:</p>
                    <div className="res-stars">
                      {[1,2,3,4,5].map(n=>(
                        <button
                          key={n}
                          id={`res-star-${r._id}-${n}`}
                          className={`res-star ${n<=hoverStar?'res-star--lit':''}`}
                          onMouseEnter={()=>setHoverStar(n)}
                          onMouseLeave={()=>setHoverStar(0)}
                          onClick={()=>handleRate(r._id, n)}
                        >★</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comment Inline */}
                {commentTarget === r._id && (
                  <div className="res-comment-panel">
                    <textarea
                      id={`res-comment-text-${r._id}`}
                      className="res-comment-input"
                      placeholder="Write a comment (min 3 chars)..."
                      rows={2}
                      value={commentText}
                      onChange={e=>setCommentText(e.target.value)}
                    />
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <button className="res-comment-send" onClick={()=>handleComment(r._id)}>Send</button>
                      <button className="res-comment-cancel" onClick={()=>setCommentTarget(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="rp-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div className="rp-modal">
            <div className="rp-modal__header">
              <h2>{editTarget ? 'Edit Resource' : 'Upload New Resource'}</h2>
              <button className="rp-modal__close" onClick={()=>setShowModal(false)}>✕</button>
            </div>
            <form className="rp-modal__form" onSubmit={handleSubmit} noValidate>
              <div className="rp-modal__row">
                <div className="rp-modal__group">
                  <label htmlFor="rm-title">Title *</label>
                  <input id="rm-title" className={`rp-modal__input ${formErrors.title?'rp-modal__input--err':''}`} placeholder="Resource title (min 3 chars)" value={form.title} onChange={F('title')}/>
                  {formErrors.title && <span className="rp-modal__err">{formErrors.title}</span>}
                </div>
                <div className="rp-modal__group">
                  <label htmlFor="rm-subject">Subject *</label>
                  <input id="rm-subject" className={`rp-modal__input ${formErrors.subject?'rp-modal__input--err':''}`} placeholder="e.g. Data Structures" value={form.subject} onChange={F('subject')}/>
                  {formErrors.subject && <span className="rp-modal__err">{formErrors.subject}</span>}
                </div>
              </div>
              <div className="rp-modal__group">
                <label htmlFor="rm-desc">Description *</label>
                <textarea id="rm-desc" className={`rp-modal__textarea ${formErrors.description?'rp-modal__input--err':''}`} placeholder="Describe this resource (min 10 chars)" rows={3} value={form.description} onChange={F('description')}/>
                {formErrors.description && <span className="rp-modal__err">{formErrors.description}</span>}
              </div>
              <div className="rp-modal__group">
                <label htmlFor="rm-url">File URL *</label>
                <input id="rm-url" className={`rp-modal__input ${formErrors.fileUrl?'rp-modal__input--err':''}`} placeholder="https://..." value={form.fileUrl} onChange={F('fileUrl')}/>
                {formErrors.fileUrl && <span className="rp-modal__err">{formErrors.fileUrl}</span>}
              </div>
              <div className="rp-modal__row">
                <div className="rp-modal__group">
                  <label htmlFor="rm-ftype">File Type</label>
                  <select id="rm-ftype" className="rp-modal__select" value={form.fileType} onChange={F('fileType')}>
                    {FILE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="rp-modal__group">
                  <label htmlFor="rm-rtype">Resource Type</label>
                  <select id="rm-rtype" className="rp-modal__select" value={form.resourceType} onChange={F('resourceType')}>
                    {RESOURCE_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div className="rp-modal__group">
                  <label htmlFor="rm-vis">Visibility</label>
                  <select id="rm-vis" className="rp-modal__select" value={form.visibility} onChange={F('visibility')}>
                    {VISIBILITIES.map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="rp-modal__row">
                <div className="rp-modal__group">
                  <label htmlFor="rm-topic">Topic (optional)</label>
                  <input id="rm-topic" className="rp-modal__input" placeholder="e.g. Sorting Algorithms" value={form.topic} onChange={F('topic')}/>
                </div>
                <div className="rp-modal__group">
                  <label htmlFor="rm-tags">Tags (comma-separated)</label>
                  <input id="rm-tags" className="rp-modal__input" placeholder="e.g. sorting, arrays, java" value={form.tags} onChange={F('tags')}/>
                </div>
              </div>
              <div className="rp-modal__footer">
                <button type="button" className="rp-modal__cancel" onClick={()=>setShowModal(false)}>Cancel</button>
                <button id="rm-submit-btn" type="submit" className="rp-modal__submit" disabled={submitting}>
                  {submitting ? 'Saving...' : (editTarget ? 'Update Resource' : 'Upload Resource')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;
