import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';

// ── Providers ─────────────────────────────────────────────────────────────────
import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './components/Toast/Toast';

// ── Route Guards ──────────────────────────────────────────────────────────────
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute
} from './components/ProtectedRoute/ProtectedRoute';

// ── Existing Home page components (DO NOT modify) ────────────────────────────
import Navbar          from './components/Navbar/Navbar';
import Hero            from './components/Hero/Hero';
import About           from './components/About/About';
import Features        from './components/Features/Features';
import HowItWorks      from './components/HowItWorks/HowItWorks';
import Benefits        from './components/Benefits/Benefits';
import DashboardPreview from './components/DashboardPreview/DashboardPreview';
import CTASection      from './components/CTASection/CTASection';
import Footer          from './components/Footer/Footer';

// ── Auth Pages ────────────────────────────────────────────────────────────────
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';

// ── Protected Pages ───────────────────────────────────────────────────────────
import AdminDashboard  from './pages/AdminDashboard';
import ReportsPage     from './pages/ReportsPage';
import UserDashboard   from './pages/UserDashboard';
import ResourcePage    from './pages/ResourcePage';

// ── Home page (unchanged) ─────────────────────────────────────────────────────
function Home({ darkMode, toggleDark }) {
  return (
    <div className="App">
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <Benefits />
        <DashboardPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// ── Root App with Router ──────────────────────────────────────────────────────
function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bl-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('bl-theme', next ? 'dark' : 'light');
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ── Public home page — existing, untouched ── */}
            <Route path="/" element={<Home darkMode={darkMode} toggleDark={toggleDark} />} />

            {/* ── Auth pages (redirect if already logged in) ── */}
            <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password"  element={<ResetPassword />} />

            {/* ── User-protected pages ── */}
            <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard"      element={<Navigate to="/user-dashboard" replace />} />
            <Route path="/resources"      element={<ProtectedRoute><ResourcePage /></ProtectedRoute>} />

            {/* ── Admin-only pages ── */}
            <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/reports"         element={<AdminRoute><ReportsPage /></AdminRoute>} />

            {/* ── 404 fallback ── */}
            <Route path="*" element={
              <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: '#070b16', color: '#94a3b8',
                fontFamily: 'Inter, sans-serif', gap: 16
              }}>
                <div style={{ fontSize: 80 }}>🧠</div>
                <h1 style={{ color: '#f1f5f9', fontSize: 48, margin: 0 }}>404</h1>
                <p style={{ fontSize: 18, margin: 0 }}>Page not found</p>
                <a href="/" style={{
                  marginTop: 16, padding: '12px 28px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', textDecoration: 'none', fontWeight: 700
                }}>
                  Go Home
                </a>
              </div>
            } />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
