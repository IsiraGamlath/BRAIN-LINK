import React, { useState, useCallback } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import StudyGroupDashboard from "./pages/StudyGroupDashboard";
import CreateProjectGroupPage from "./pages/CreateProjectGroupPage";
import MyProjectGroupPage from "./pages/MyProjectGroupPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import AcademicProfileModal from "./components/AcademicProfileModal";
import { useCurrentUser } from "./context/CurrentUserContext";

function App() {
  const { currentUser } = useCurrentUser();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleEditProfile = useCallback(() => {
    setShowProfileModal(true);
  }, []);

  const handleProfileSaved = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  const handleMarkAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const handleAddNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const handleSetNotifications = useCallback((notificationsList) => {
    setNotifications(notificationsList);
  }, []);

  return (
    <div className="app">
      <Header
        user={currentUser}
        onEditProfile={handleEditProfile}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />

      <div className="main-container">
        <Sidebar />

        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/project-group-hub" replace />} />
            <Route
              path="/project-group-hub"
              element={
                <StudyGroupDashboard
                  currentUser={currentUser}
                  onAddNotification={handleAddNotification}
                  onSetNotifications={handleSetNotifications}
                />
              }
            />
            <Route
              path="/create-project-group"
              element={<CreateProjectGroupPage currentUser={currentUser} />}
            />
            <Route
              path="/my-project-group"
              element={<MyProjectGroupPage currentUser={currentUser} />}
            />
            <Route
              path="/group-details/:id"
              element={<GroupDetailsPage currentUser={currentUser} />}
            />
            <Route path="*" element={<Navigate to="/project-group-hub" replace />} />
          </Routes>
        </div>
      </div>

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
