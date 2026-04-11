// Combined App.js
import React, { useCallback, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";

// Isira_Kuppi_Session components
import Dashboard from './components/Dashboard';
import KuppiSessionsList from './components/KuppiSessionsList';

// Kaushini_Study_Group components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StudyGroupDashboard from "./pages/StudyGroupDashboard";
import CreateProjectGroupPage from "./pages/CreateProjectGroupPage";
import MyProjectGroupPage from "./pages/MyProjectGroupPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import AcademicProfileModal from "./components/AcademicProfileModal";
import { useCurrentUser } from "./context/CurrentUserContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfilePage from "./pages/UserProfilePage";
import HelpFeedPage from "./pages/HelpFeedPage";
import PostRequestPage from "./pages/PostRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import EditRequestPage from "./pages/EditRequestPage";
import ChatPage from "./pages/ChatPage";
import ResourcePage from "./pages/ResourcePage";
import AdminDashboard from "./pages/AdminDashboard";
import ReportsPage from "./pages/ReportsPage";
import { AdminRoute, GuestRoute, ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

// Landing page components
import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import Features from "./components/Features/Features";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import Benefits from "./components/Benefits/Benefits";
import DashboardPreview from "./components/DashboardPreview/DashboardPreview";
import CTASection from "./components/CTASection/CTASection";
import Footer from "./components/Footer/Footer";

function HomePage() {
  return (
    <div className="content">
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Benefits />
      <DashboardPreview />
      <div id="cta">
        <CTASection />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  // --- Shared state ---
  const { currentUser, setCurrentUserProfile } = useCurrentUser();
  const { user } = useAuth();
  const location = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [, setNotifications] = useState([]);

  const isAdminUser = user?.role === 'admin';
  const isAdminArea = location.pathname === '/admin-dashboard' || location.pathname.startsWith('/reports');
  const showGlobalHeader = !(isAdminUser && isAdminArea);

  const handleEditProfile = useCallback(() => setShowProfileModal(true), []);
  const handleProfileSaved = useCallback((updatedProfile) => {
    setCurrentUserProfile(updatedProfile);
    setShowProfileModal(false);
  }, [setCurrentUserProfile]);
  const handleAddNotification = useCallback((notif) => setNotifications(prev => [notif, ...prev]), []);
  const handleSetNotifications = useCallback((list) => setNotifications(list), []);

  return (
    <div className="app">
      {/* Kaushini: Header and Sidebar */}
      {showGlobalHeader && <Header />}

      <div className="app-body">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/project-group-hub"
            element={
              <div className="main-container">
                <div className="content">
                  <StudyGroupDashboard
                    currentUser={currentUser}
                    onAddNotification={handleAddNotification}
                    onSetNotifications={handleSetNotifications}
                  />
                </div>
              </div>
            }
          />

          <Route
            path="/create-project-group"
            element={
              <div className="main-container">
                <Sidebar />
                <div className="content">
                  <CreateProjectGroupPage currentUser={currentUser} />
                </div>
              </div>
            }
          />

          <Route
            path="/my-project-group"
            element={
              <div className="main-container">
                <Sidebar />
                <div className="content">
                  <MyProjectGroupPage currentUser={currentUser} />
                </div>
              </div>
            }
          />

          <Route
            path="/group-details/:id"
            element={
              <div className="main-container">
                <div className="content">
                  <GroupDetailsPage currentUser={currentUser} />
                </div>
              </div>
            }
          />

          <Route
            path="/help-request"
            element={
              <div className="main-container">
                <div className="content">
                  <HelpFeedPage />
                </div>
              </div>
            }
          />

          <Route
            path="/help-feed"
            element={
              <div className="main-container">
                <div className="content">
                  <HelpFeedPage />
                </div>
              </div>
            }
          />

          <Route
            path="/post"
            element={
              <div className="main-container">
                <div className="content">
                  <PostRequestPage />
                </div>
              </div>
            }
          />

          <Route
            path="/my-requests"
            element={
              <div className="main-container">
                <div className="content">
                  <MyRequestsPage />
                </div>
              </div>
            }
          />

          <Route
            path="/edit/:id"
            element={
              <div className="main-container">
                <div className="content">
                  <EditRequestPage />
                </div>
              </div>
            }
          />

          <Route
            path="/chat/:requestId"
            element={
              <div className="main-container">
                <div className="content">
                  <ChatPage />
                </div>
              </div>
            }
          />

          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div className="main-container">
                  <div className="content">
                    <UserProfilePage currentUser={currentUser} onEditProfile={handleEditProfile} />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kuppi/my-sessions"
            element={
              <div className="main-container">
                <div className="content">
                  <Dashboard />
                </div>
              </div>
            }
          />

          <Route
            path="/kuppi/browse-sessions"
            element={
              <div className="main-container">
                <div className="content">
                  <KuppiSessionsList />
                </div>
              </div>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <div className="main-container">
                  <div className="content">
                    <ResourcePage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard"
            element={
              <Navigate to="/profile" replace />
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <div className="main-container">
                  <div className="content">
                    <AdminDashboard />
                  </div>
                </div>
              </AdminRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <AdminRoute>
                <div className="main-container">
                  <div className="content">
                    <ReportsPage />
                  </div>
                </div>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Kaushini: Academic Profile Modal */}
      <AcademicProfileModal
        isOpen={showProfileModal}
        currentUser={currentUser}
        onClose={() => setShowProfileModal(false)}
        onProfileSaved={handleProfileSaved}
      />
    </div>
  );
}

export default App;
