// Combined App.js
import React, { useState, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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

// Local storage key for session page
const CURRENT_PAGE_KEY = 'brainlink-current-page';

function App() {
  // --- Isira_Kuppi_Session state ---
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem(CURRENT_PAGE_KEY) || 'dashboard';
  });

  const handleNavigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem(CURRENT_PAGE_KEY, page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem(CURRENT_PAGE_KEY, 'dashboard');
    setCurrentPage('dashboard');
  };

  // --- Kaushini_Study_Group state ---
  const { currentUser } = useCurrentUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleEditProfile = useCallback(() => setShowProfileModal(true), []);
  const handleProfileSaved = useCallback(() => setShowProfileModal(false), []);
  const handleMarkAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  }, []);
  const handleAddNotification = useCallback((notif) => setNotifications(prev => [notif, ...prev]), []);
  const handleSetNotifications = useCallback((list) => setNotifications(list), []);

  return (
    <div className="app">
      {/* Kaushini: Header and Sidebar */}
      <Header
        user={currentUser}
        onEditProfile={handleEditProfile}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />

      <div className="main-container">
        <Sidebar />

        <div className="content">
          {/* Isira_Kuppi_Session pages */}
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
          {currentPage === 'sessions' && <KuppiSessionsList onNavigate={handleNavigate} onLogout={handleLogout} />}

          {/* Kaushini_Study_Group pages via routes */}
          <Routes>
            <Route path="/" element={<Navigate to="/project-group-hub" replace />} />
            <Route
              path="/project-group-hub"
              element={<StudyGroupDashboard currentUser={currentUser} onAddNotification={handleAddNotification} onSetNotifications={handleSetNotifications} />}
            />
            <Route path="/create-project-group" element={<CreateProjectGroupPage currentUser={currentUser} />} />
            <Route path="/my-project-group" element={<MyProjectGroupPage currentUser={currentUser} />} />
            <Route path="/group-details/:id" element={<GroupDetailsPage currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/project-group-hub" replace />} />
          </Routes>
        </div>
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