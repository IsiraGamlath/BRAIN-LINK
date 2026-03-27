import React from "react";
import "./StatusBadge.css";

const STATUS_CLASS_MAP = {
  Open: "status-badge-open",
  Full: "status-badge-full",
  Pending: "status-badge-pending",
  Accepted: "status-badge-accepted",
  Rejected: "status-badge-rejected",
};

function StatusBadge({ status, small = false }) {
  const normalizedStatus = status || "Open";
  const statusClass = STATUS_CLASS_MAP[normalizedStatus] || "status-badge-default";

  return (
    <span className={`status-badge ${statusClass} ${small ? "status-badge-small" : ""}`}>
      {normalizedStatus}
    </span>
  );
}

export default StatusBadge;
