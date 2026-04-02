import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function KuppiSidebar() {
  const navItems = [
    { label: "My Sessions", icon: "📘", path: "/kuppi/my-sessions" },
    { label: "Browse Sessions", icon: "🧭", path: "/kuppi/browse-sessions" },
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

export default KuppiSidebar;
