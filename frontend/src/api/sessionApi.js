import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const AUTH_STATE_KEY = 'bl-auth';
const USER_KEY = 'bl-user';
const PROFILE_KEY = 'brainlink.currentUserProfile';

const api = axios.create({
  baseURL: API_BASE_URL
});

export const getAuthToken = () => localStorage.getItem('bl-access-token') || localStorage.getItem('token');

const readJsonFromStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};

export const getCurrentUserId = () => {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  return payload.userId || payload.id || payload._id || payload.sub || null;
};

export const getCurrentUserIdentifiers = () => collectCurrentUserIdentifiers();

export const getCurrentStudentId = () => getPreferredStudentId() || getCurrentUserId();

const collectCurrentUserIdentifiers = () => {
  const candidates = new Set();

  const addCandidate = (value) => {
    const normalized = normalizeIdentifier(value);
    if (normalized) {
      candidates.add(normalized);
    }
  };

  const tokenPayload = decodeJwtPayload(getAuthToken() || '');
  addCandidate(tokenPayload?.userId);
  addCandidate(tokenPayload?.id);
  addCandidate(tokenPayload?._id);
  addCandidate(tokenPayload?.sub);
  addCandidate(tokenPayload?.slIIId);
  addCandidate(tokenPayload?.itNumber);

  const authState = readJsonFromStorage(AUTH_STATE_KEY);
  addCandidate(authState?.user?._id);
  addCandidate(authState?.user?.slIIId);

  const authUser = readJsonFromStorage(USER_KEY);
  addCandidate(authUser?._id);
  addCandidate(authUser?.slIIId);

  const profileUser = readJsonFromStorage(PROFILE_KEY);
  addCandidate(profileUser?.itNumber);
  addCandidate(profileUser?.slIIId);

  return Array.from(candidates);
};

const getPreferredStudentId = () => {
  const profileUser = readJsonFromStorage(PROFILE_KEY);
  if (profileUser?.itNumber && String(profileUser.itNumber).trim()) {
    return String(profileUser.itNumber).trim();
  }

  const authState = readJsonFromStorage(AUTH_STATE_KEY);
  if (authState?.user?.slIIId && String(authState.user.slIIId).trim()) {
    return String(authState.user.slIIId).trim();
  }

  const authUser = readJsonFromStorage(USER_KEY);
  if (authUser?.slIIId && String(authUser.slIIId).trim()) {
    return String(authUser.slIIId).trim();
  }

  const payload = decodeJwtPayload(getAuthToken() || '');
  const tokenIdentity = payload?.slIIId || payload?.itNumber || payload?.userId || payload?.id || payload?._id || payload?.sub;
  return tokenIdentity ? String(tokenIdentity).trim() : null;
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeSession = (session) => ({
  ...session
});

const filterSessionsByUser = (sessions, identifiers) => {
  if (!Array.isArray(identifiers) || identifiers.length === 0) {
    return sessions;
  }

  const identifierSet = new Set(identifiers.map(normalizeIdentifier).filter(Boolean));

  return sessions.filter((session) => {
    const ownerId = normalizeIdentifier(session?.studentId);
    return !ownerId || identifierSet.has(ownerId);
  });
};

export const fetchUpcomingSessions = async () => {
  const identifiers = collectCurrentUserIdentifiers();
  const response = await api.get('/sessions/upcoming');
  const sessions = Array.isArray(response.data) ? response.data : [];
  return filterSessionsByUser(sessions, identifiers).map(normalizeSession);
};

export const fetchPastSessions = async () => {
  const identifiers = collectCurrentUserIdentifiers();
  const response = await api.get('/sessions/past');
  const sessions = Array.isArray(response.data) ? response.data : [];
  return filterSessionsByUser(sessions, identifiers).map(normalizeSession);
};

export const fetchAllSessions = async () => {
  const response = await api.get('/sessions');
  const sessions = Array.isArray(response.data) ? response.data : [];
  return sessions.map(normalizeSession);
};

export const createSession = async (formData) => {
  const preferredStudentId = getPreferredStudentId();
  const submittedStudentId = typeof formData.studentId === 'string' ? formData.studentId.trim() : '';
  const resolvedStudentId = submittedStudentId || preferredStudentId || 'anonymous-user';

  const payload = {
    subject: formData.subject,
    date: formData.date,
    startTime: formData.startTime,
    duration: Number(formData.duration),
    mode: formData.mode,
    studentId: resolvedStudentId
  };

  if (formData.mode === 'Online') {
    payload.meetingLink = formData.meetingLink;
  }

  if (formData.mode === 'Physical') {
    payload.location = formData.location;
  }

  const response = await api.post('/sessions', payload);
  return normalizeSession(response.data.session || response.data);
};

export const updateSession = async (id, formData, existingSession = {}) => {
  const mode = formData.mode || existingSession.mode || 'Online';
  const preferredStudentId = getPreferredStudentId();
  const submittedStudentId = typeof formData.studentId === 'string' ? formData.studentId.trim() : '';
  const existingStudentId = typeof existingSession.studentId === 'string' ? existingSession.studentId.trim() : '';
  const resolvedStudentId = submittedStudentId || existingStudentId || preferredStudentId || 'anonymous-user';

  const payload = {
    subject: formData.subject,
    date: formData.date,
    startTime: formData.startTime,
    duration: Number(formData.duration),
    mode,
    studentId: resolvedStudentId
  };

  if (mode === 'Online') {
    payload.meetingLink = formData.meetingLink || existingSession.meetingLink;
  }

  if (mode === 'Physical') {
    payload.location = formData.location || existingSession.location;
  }

  if (formData.status) {
    payload.status = formData.status;
  }

  const response = await api.put(`/sessions/${id}`, payload);
  return normalizeSession(response.data.session || response.data);
};

export const deleteSession = async (id) => {
  const response = await api.delete(`/sessions/${id}`);
  return response.data;
};
