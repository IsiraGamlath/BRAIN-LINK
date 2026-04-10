// frontend/src/components/ProtectedRoute/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Spinner while auth state loads ────────────────────────────────────────────
const LoadingSpinner = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0a0e1a'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, border: '4px solid rgba(99,102,241,0.2)',
        borderTop: '4px solid #6366f1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
      }} />
      <p style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
        Verifying session…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

// ── ProtectedRoute: requires login ────────────────────────────────────────────
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location           = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// ── AdminRoute: requires admin role ──────────────────────────────────────────
const Unauthorized = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d18', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
    <div style={{ textAlign: 'center', maxWidth: 520, padding: 24, border: '1px solid #334155', borderRadius: 12, background: '#0f172a' }}>
      <h1 style={{ margin: 0, fontSize: 48 }}>🚫 Access Denied</h1>
      <p style={{ margin: '16px 0 24px', color: '#94a3b8' }}>You do not have permission to see this page. Please login with an admin account.</p>
      <a href="/" style={{ color: '#93c5fd', textDecoration: 'none', fontWeight: 600 }}>← Return to Home</a>
    </div>
  </div>
);

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location                    = useLocation();

  if (loading)  return <LoadingSpinner />;
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Unauthorized />;
  return children;
};

// ── GuestRoute: redirect logged-in users to dashboard ────────────────────────
export const GuestRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user)    return <Navigate to={isAdmin ? '/admin-dashboard' : '/user-dashboard'} replace />;
  return children;
};

export default ProtectedRoute;
