import React from "react";
import "./ProjectGroupRulesPanel.css";

const RULES = [
  "You can create only one group per module",
  "Only subgroup members can join",
  "Leader must approve join requests",
  "Maximum members must be respected",
];

function ProjectGroupRulesPanel() {
  return (
    <aside className="rules-panel">
      <h3 className="rules-panel-title">Project Group Rules</h3>
      <ul className="rules-panel-list">
        {RULES.map((rule) => (
          <li key={rule} className="rules-panel-item">
            <span className="rules-panel-icon" aria-hidden="true">
              i
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default ProjectGroupRulesPanel;
