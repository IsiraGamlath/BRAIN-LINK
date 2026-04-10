import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../context/CurrentUserContext";

function Header() {
  const { user, logout } = useAuth();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const initials = (currentUser?.name || user?.fullName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

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
        <NavLink
          to="/help-request"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Help Request
        </NavLink>
      </nav>

      <div className="header-right">
        <div className="auth-nav-actions">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="profile-icon-link"
                aria-label="Open profile"
                title="Profile"
              >
                {initials || "U"}
              </NavLink>
              <button type="button" className="auth-nav-btn auth-nav-btn-secondary" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="auth-nav-btn auth-nav-btn-secondary">
                Sign In
              </NavLink>
              <NavLink to="/register" className="auth-nav-btn auth-nav-btn-primary">
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
