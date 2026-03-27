// frontend/src/context/AuthContext.js
// Global authentication state with access + refresh token management
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true on mount while we verify token

  // ── Helpers ──────────────────────────────────────────────────────────────────
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

  // ── Refresh access token using stored refresh token ───────────────────────────
  const refreshAccessToken = useCallback(async () => {
    const token = getRefreshToken();
    if (!token) return null;
    try {
      const res  = await fetch(`${BASE_URL}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: token })
      });
      if (!res.ok) { clearTokens(); setUser(null); return null; }
      const data = await res.json();
      saveTokens(data.accessToken, data.refreshToken);
      return data.accessToken;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  // ── Auto-fetch current user on mount ─────────────────────────────────────────
  const fetchMe = useCallback(async (token) => {
    try {
      let res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Token expired → try refresh
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) { setLoading(false); return; }
        res = await fetch(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('bl-user', JSON.stringify(data.user));
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res  = await fetch(`${BASE_URL}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    localStorage.setItem('bl-user', JSON.stringify(data.user));
    return data.user;
  };

  // ── Register ──────────────────────────────────────────────────────────────────
  const register = async (payload) => {
    const res  = await fetch(`${BASE_URL}/auth/signup`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    saveTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    localStorage.setItem('bl-user', JSON.stringify(data.user));
    return data.user;
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${token}`
          },
          body: JSON.stringify({ refreshToken: getRefreshToken() })
        });
      }
    } catch (_) { /* ignore */ }
    clearTokens();
    setUser(null);
  };

  // ── Utility ───────────────────────────────────────────────────────────────────
  const isAdmin   = user?.role === 'admin';
  const isStudent = !!user;

  // ── Authenticated fetch (auto-refreshes if expired) ───────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    let token = getAccessToken();
    let res   = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      token = await refreshAccessToken();
      if (!token) throw new Error('Session expired. Please log in again.');
      res = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${token}` }
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{
      user, loading, isAdmin, isStudent,
      login, register, logout, authFetch,
      refreshAccessToken, getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
