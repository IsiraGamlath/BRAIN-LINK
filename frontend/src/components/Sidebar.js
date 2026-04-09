import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navItems = [
    { label: "Project Group Hub", icon: "👥", path: "/project-group-hub" },
    { label: "Create Project Group", icon: "🧩", path: "/create-project-group" },
    { label: "My Project Group", icon: "🏆", path: "/my-project-group" },
  ];

  return (
    <div className="sidebar">
      <nav className="nav-items">
        {navItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
