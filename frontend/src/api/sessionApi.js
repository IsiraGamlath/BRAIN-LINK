import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL
});

export const getAuthToken = () => localStorage.getItem('token');

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

const filterSessionsByUser = (sessions, userId) => {
  if (!userId) return sessions;
  return sessions.filter((session) => !session.studentId || session.studentId === userId);
};

export const fetchUpcomingSessions = async () => {
  const userId = getCurrentUserId();
  const response = await api.get('/sessions/upcoming');
  const sessions = Array.isArray(response.data) ? response.data : [];
  return filterSessionsByUser(sessions, userId).map(normalizeSession);
};

export const fetchPastSessions = async () => {
  const userId = getCurrentUserId();
  const response = await api.get('/sessions/past');
  const sessions = Array.isArray(response.data) ? response.data : [];
  return filterSessionsByUser(sessions, userId).map(normalizeSession);
};

export const createSession = async (formData) => {
  const userId = getCurrentUserId();

  const payload = {
    subject: formData.subject,
    date: formData.date,
    startTime: formData.startTime,
    duration: Number(formData.duration),
    mode: formData.mode,
    studentId: formData.studentId || userId || 'anonymous-user'
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
  const userId = getCurrentUserId();
  const mode = formData.mode || existingSession.mode || 'Online';

  const payload = {
    subject: formData.subject,
    date: formData.date,
    startTime: formData.startTime,
    duration: Number(formData.duration),
    mode,
    studentId: formData.studentId || existingSession.studentId || userId || 'anonymous-user'
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
