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
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location                    = useLocation();

  if (loading)  return <LoadingSpinner />;
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── GuestRoute: redirect logged-in users to dashboard ────────────────────────
export const GuestRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user)    return <Navigate to={isAdmin ? '/admin-dashboard' : '/dashboard'} replace />;
  return children;
};

export default ProtectedRoute;
