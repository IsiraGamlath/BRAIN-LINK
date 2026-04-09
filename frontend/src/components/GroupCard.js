import React, { useState } from "react";
import "./GroupCard.css";
import StatusBadge from "./StatusBadge";

const GroupCard = ({ group, currentUser, buttonAction, onButtonClick, onViewDetails }) => {
  const [isHovering, setIsHovering] = useState(false);

  const isUserMember = group.members.some((member) => member.itNumber === currentUser.itNumber);
  const isUserLeader = group.leader === currentUser.itNumber;
  const isFull = group.status === "Full";
  const availableSlots = Math.max(group.maxMembers - group.members.length, 0);
  const memberPercentage = (group.members.length / group.maxMembers) * 100;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(buttonAction);
    }
  };

  return (
    <div
      className={`group-card ${isHovering ? "group-card-hover" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="group-card-header">
        <div className="group-card-name">{group.groupName}</div>
        <div className="group-card-subject">{group.moduleName}</div>
        <div className="group-card-status-row">
          <StatusBadge status={group.status} />
          <span className="group-card-role-tag">{isUserLeader ? "Leader" : isUserMember ? "Member" : "Non-member"}</span>
        </div>
      </div>

      <div className="group-card-description">{group.description}</div>

      <div className="group-card-info-grid">
        <div className="group-card-info-item">
          <div className="group-card-info-label">Module</div>
          <div className="group-card-info-value">{group.moduleName}</div>
        </div>
        <div className="group-card-info-item">
          <div className="group-card-info-label">Semester</div>
          <div className="group-card-info-value">{group.semester}</div>
        </div>
        <div className="group-card-info-item">
          <div className="group-card-info-label">Leader</div>
          <div className="group-card-info-value">{group.leader}</div>
        </div>
        <div className="group-card-info-item">
          <div className="group-card-info-label">Study Type</div>
          <div className="group-card-info-value">{group.studyType}</div>
        </div>
        <div className="group-card-info-item">
          <div className="group-card-info-label">Available Slots</div>
          <div className="group-card-info-value">{availableSlots}</div>
        </div>
        <div className="group-card-info-item">
          <div className="group-card-info-label">Created</div>
          <div className="group-card-info-value">
            {new Date(group.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="group-card-progress-section">
        <div className="group-card-progress-label">
          <span>Members</span>
          <span className="group-card-progress-count">
            {group.members.length} / {group.maxMembers}
          </span>
        </div>
        <div className="group-card-slots">Available Slots: {availableSlots}</div>
        <div className="group-card-progress-bar">
          <div
            className={`group-card-progress-fill ${isFull ? "group-card-progress-full" : ""}`}
            style={{ width: `${Math.min(memberPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="group-card-button-group">
        <button onClick={onViewDetails} className="group-card-button group-card-details-button">
          View Details
        </button>

        {!isUserMember && !isUserLeader && (
          <button
            onClick={handleButtonClick}
            disabled={isFull}
            className={`group-card-button group-card-join-button ${
              isFull ? "group-card-button-disabled" : ""
            }`}
          >
            {buttonAction || "Request to Join"}
          </button>
        )}

        {isUserMember && !isUserLeader && (
          <button onClick={handleButtonClick} className="group-card-button group-card-leave-button">
            Leave
          </button>
        )}

        {isUserLeader && (
          <button onClick={handleButtonClick} className="group-card-button group-card-manage-button">
            {buttonAction || "Manage Requests"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
