import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Header.css";
import NotificationPanel from "./NotificationPanel";

function Header({ user, onEditProfile, notifications, onMarkAsRead }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">🧠 BrainLink</div>
        <div className="subtitle">Faculty of Computing</div>
      </div>

      <nav className="global-nav" aria-label="Main navigation">
        <NavLink
          to="/project-group-hub"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Project Group
        </NavLink>
        <NavLink
          to="/kuppi/my-sessions"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Kuppi Session
        </NavLink>
      </nav>

      <div className="header-right">
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-name">{user.name}</div>
            <div className="profile-itnumber">{user.itNumber}</div>
          </div>
          <button
            className="edit-profile-btn"
            onClick={onEditProfile}
            title="Edit your academic profile"
          >
            ✏️ Edit Academic Profile
          </button>

          <div
            ref={notificationRef}
            className="notification-container"
          >
            <button
              className="notification-icon-btn"
              onClick={() => setNotificationOpen(!notificationOpen)}
              title="View notifications"
            >
              <span className="notification-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
              )}
            </button>

            <NotificationPanel
              notifications={notifications}
              isOpen={notificationOpen}
              onClose={() => setNotificationOpen(false)}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
