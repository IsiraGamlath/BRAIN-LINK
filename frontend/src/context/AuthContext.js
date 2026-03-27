// frontend/src/context/AuthContext.js
// Global authentication state with access + refresh token management
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'bl-auth';

const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
};

const buildAuthPayload = ({ email, password, role }) => {
  let userRole = 'student';
  if (email === 'admin@gmail.com' && password === '123456') {
    userRole = 'admin';
  } else if (role === 'admin') {
    userRole = 'admin';
  }

  return {
    token: 'fake-jwt-token',
    role: userRole,
    fullName: userRole === 'admin' ? 'Admin User' : 'Student User',
    email
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 20);
    return () => clearTimeout(timer);
  }, []);

  const saveAuth = (auth) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    setUser(auth);
  };

  const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const login = async (email, password, role) => {
    if (!email || !password || !role) {
      throw new Error('Email, password, and role are required');
    }

    const auth = buildAuthPayload({ email, password, role });
    saveAuth(auth);
    return auth;
  };

  const register = async (payload) => {
    const auth = buildAuthPayload(payload);
    saveAuth(auth);
    return auth;
  };

  const logout = async () => {
    clearAuth();
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      isStudent,
      login,
      register,
      logout,
      refreshAccessToken: async () => user?.token,
      getAccessToken: () => user?.token,
      authFetch: async () => { throw new Error('No backend in local auth demo'); }
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
