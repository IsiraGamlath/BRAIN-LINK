// Combined App.js
import React, { useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

// Isira_Kuppi_Session components
import Dashboard from './components/Dashboard';
import KuppiSessionsList from './components/KuppiSessionsList';

// Kaushini_Study_Group components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import KuppiSidebar from "./components/KuppiSidebar";
import StudyGroupDashboard from "./pages/StudyGroupDashboard";
import CreateProjectGroupPage from "./pages/CreateProjectGroupPage";
import MyProjectGroupPage from "./pages/MyProjectGroupPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import AcademicProfileModal from "./components/AcademicProfileModal";
import { useCurrentUser } from "./context/CurrentUserContext";

function App() {
  // --- Shared state ---
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

      <div className="app-body">
        <Routes>
          <Route path="/" element={<Navigate to="/project-group-hub" replace />} />

          <Route
            path="/project-group-hub"
            element={
              <div className="main-container">
                <Sidebar />
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
                <Sidebar />
                <div className="content">
                  <GroupDetailsPage currentUser={currentUser} />
                </div>
              </div>
            }
          />

          <Route
            path="/kuppi/my-sessions"
            element={
              <div className="main-container">
                <KuppiSidebar />
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
                <KuppiSidebar />
                <div className="content">
                  <KuppiSessionsList />
                </div>
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/project-group-hub" replace />} />
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