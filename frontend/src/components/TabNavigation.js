import React from "react";
import "./TabNavigation.css";

function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "create", label: "Create Project Group", icon: "🧩" },
    { id: "my-group", label: "My Project Group", icon: "🏆" },
    { id: "pending-requests", label: "Pending Requests", icon: "📋" },
  ];

  return (
    <div className="tab-navigation">
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="tab-badge">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
