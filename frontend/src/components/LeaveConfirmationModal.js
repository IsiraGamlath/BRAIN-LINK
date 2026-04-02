import React from "react";
import "./LeaveConfirmationModal.css";

const LeaveConfirmationModal = ({ isOpen, groupName, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="leave-confirmation-modal-backdrop">
      <div className="leave-confirmation-modal">
        <div className="leave-confirmation-modal-icon">
          <span className="leave-confirmation-warning-icon">⚠</span>
        </div>

        <h2 className="leave-confirmation-modal-title">Leave Study Group?</h2>

        <p className="leave-confirmation-modal-message">
          Are you sure you want to leave this group?
        </p>

        <p className="leave-confirmation-modal-group-name">
          Group: <strong>{groupName}</strong>
        </p>

        <p className="leave-confirmation-modal-warning">
          This action cannot be undone and you will need to request to join again if you change your mind.
        </p>

        <div className="leave-confirmation-modal-footer">
          <button
            onClick={onCancel}
            className="leave-confirmation-btn-cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="leave-confirmation-btn-confirm"
          >
            Yes, Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmationModal;
