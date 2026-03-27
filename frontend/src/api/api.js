// frontend/src/api/api.js — Centralised API caller for BRAIN LINK (with refresh-token support)

const BASE_URL = 'http://localhost:5000/api';

const getAccessToken  = () => localStorage.getItem('bl-access-token');
const getRefreshToken = () => localStorage.getItem('bl-refresh-token');

const saveTokens = (access, refresh) => {
  localStorage.setItem('bl-access-token',  access);
  localStorage.setItem('bl-refresh-token', refresh);
};

const clearTokens = () => {
  localStorage.removeItem('bl-access-token');
  localStorage.removeItem('bl-refresh-token');
  localStorage.removeItem('bl-user');
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {})
});

// ── Auto-refreshing fetch ──────────────────────────────────────────────────────
let refreshing = null; // Deduplicate concurrent refresh calls

const refreshTokens = async () => {
  if (refreshing) return refreshing;
  refreshing = fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: getRefreshToken() })
  }).then(async r => {
    if (!r.ok) { clearTokens(); throw new Error('Session expired'); }
    const d = await r.json();
    saveTokens(d.accessToken, d.refreshToken);
    return d.accessToken;
  }).finally(() => { refreshing = null; });
  return refreshing;
};

const apiFetch = async (endpoint, options = {}, retry = true) => {
  const res  = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });

  // Attempt token refresh on 401
  if (res.status === 401 && retry && getRefreshToken()) {
    try {
      const newToken = await refreshTokens();
      return fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...authHeaders(), Authorization: `Bearer ${newToken}`, ...(options.headers || {}) }
      }).then(handleResponse);
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  return handleResponse(res);
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiLogin  = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    .then(handleResponse);

export const apiSignup = (payload) =>
  fetch(`${BASE_URL}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(handleResponse);

export const apiGetMe          = ()      => apiFetch('/auth/me');
export const apiLogout         = (token) => apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: token }) });
export const apiForgotPassword = (email) =>
  fetch(`${BASE_URL}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    .then(handleResponse);
export const apiResetPassword  = (payload) =>
  fetch(`${BASE_URL}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(handleResponse);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const apiGetAnalytics      = ()            => apiFetch('/admin/analytics');
export const apiGetAdminUsers     = (params = '') => apiFetch(`/admin/users${params}`);
export const apiSuspendUser       = (id)          => apiFetch(`/admin/users/${id}/suspend`, { method: 'PATCH' });
export const apiActivateUser      = (id)          => apiFetch(`/admin/users/${id}/activate`, { method: 'PATCH' });
export const apiAssignRole        = (id, role)    => apiFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
export const apiGetAdminResources = (params = '') => apiFetch(`/admin/resources${params}`);
export const apiAdminDeleteResource = (id)        => apiFetch(`/admin/resources/${id}`, { method: 'DELETE' });
export const apiGetAuditLogs      = (params = '') => apiFetch(`/admin/audit-logs${params}`);

// ─── Reports ──────────────────────────────────────────────────────────────────
export const apiGetReports          = (params = '')    => apiFetch(`/reports${params}`);
export const apiCreateReport        = (payload)        => apiFetch('/reports', { method: 'POST', body: JSON.stringify(payload) });
export const apiUpdateReportStatus  = (id, status, adminNotes) =>
  apiFetch(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) });
export const apiDeleteReport        = (id)             => apiFetch(`/reports/${id}`, { method: 'DELETE' });
export const apiBulkDeleteReports   = (ids)            => apiFetch('/reports/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) });

// ─── User ─────────────────────────────────────────────────────────────────────
export const apiGetProfile          = ()               => apiFetch('/users/profile');
export const apiGetUserById         = (id)             => apiFetch(`/users/${id}`);
export const apiUpdateUser          = (id, payload)    => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

// ─── Resources ────────────────────────────────────────────────────────────────
export const apiGetResources        = (params = '')    => apiFetch(`/resources${params}`);
export const apiCreateResource      = (payload)        => apiFetch('/resources', { method: 'POST', body: JSON.stringify(payload) });
export const apiUpdateResource      = (id, payload)    => apiFetch(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const apiDeleteResource      = (id)             => apiFetch(`/resources/${id}`, { method: 'DELETE' });
export const apiDownloadResource    = (id)             => apiFetch(`/resources/${id}/download`, { method: 'POST' });
export const apiRateResource        = (id, rating)     => apiFetch(`/resources/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating }) });
export const apiAddComment          = (id, text)       => apiFetch(`/resources/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) });
export const apiGetComments         = (id)             => apiFetch(`/resources/${id}/comments`);
