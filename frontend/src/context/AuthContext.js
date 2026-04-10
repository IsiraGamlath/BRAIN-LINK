// frontend/src/context/AuthContext.js
// Global authentication state with access + refresh token management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe, apiLogin, apiLogout, apiSignup } from '../api/api';

const AuthContext = createContext(null);

const AUTH_KEY = 'bl-auth';
const ACCESS_TOKEN_KEY = 'bl-access-token';
const REFRESH_TOKEN_KEY = 'bl-refresh-token';
const USER_KEY = 'bl-user';

const getStoredAuth = () => {
  try {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
    if (auth?.user && auth?.accessToken) {
      return auth;
    }
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    if (user && accessToken) {
      return { user, accessToken, refreshToken };
    }
    return null;
  } catch {
    return null;
  }
};

const normalizeUser = (user = {}) => {
  return {
    _id: user._id,
    slIIId: user.slIIId,
    fullName: user.fullName,
    email: user.email,
    specialization: user.specialization,
    year: user.year,
    semester: user.semester,
    role: user.role || 'student',
    lastLogin: user.lastLogin || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getStoredAuth());
  const [loading, setLoading] = useState(true);

  const saveAuth = (auth) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    if (auth.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    setAuthState(auth);
  };

  const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_KEY);
    setAuthState(null);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!authState?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiGetMe();
        if (response?.user) {
          saveAuth({
            ...authState,
            user: normalizeUser(response.user),
          });
        }
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password, role) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await apiLogin(email, password);
    const backendUser = normalizeUser(response.user);

    if (role === 'admin' && backendUser.role !== 'admin') {
      throw new Error('This account is not an admin account');
    }
    if (role === 'student' && backendUser.role === 'admin') {
      throw new Error('Please choose Admin role for this account');
    }

    const auth = {
      user: backendUser,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };

    saveAuth(auth);
    return backendUser;
  };

  const register = async (payload) => {
    const response = await apiSignup(payload);
    const auth = {
      user: normalizeUser(response.user),
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
    saveAuth(auth);
    return auth.user;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken && authState?.accessToken) {
        await apiLogout(refreshToken);
      }
    } catch {
      // Clear local auth state even if server-side logout fails
    }
    clearAuth();
  };

  const refreshAccessToken = async () => localStorage.getItem(ACCESS_TOKEN_KEY);
  const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

  const authFetch = async (input, init = {}) => {
    const accessToken = getAccessToken();
    const headers = {
      ...(init.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    return fetch(input, {
      ...init,
      headers,
    });
  };

  const user = authState?.user || null;
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
      refreshAccessToken,
      getAccessToken,
      authFetch,
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
