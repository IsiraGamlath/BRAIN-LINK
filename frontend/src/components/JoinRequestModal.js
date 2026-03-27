import React, { useState } from "react";
import "./JoinRequestModal.css";

const JoinRequestModal = ({ isOpen, groupName, currentUser, onSubmit, onCancel, group, loading }) => {
  const [formData, setFormData] = useState({
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ message: "" });
  };

  if (!isOpen) return null;

  const displayName = groupName || group?.groupName || "Project Group";

  return (
    <div className="join-request-modal-backdrop">
      <div className="join-request-modal">
        <div className="join-request-modal-header">
          <h2 className="join-request-modal-title">Request to Join Project Group</h2>
          <button
            className="join-request-modal-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="join-request-modal-form">
          <p className="join-request-modal-subtitle">
            Requesting to join: <strong>{displayName}</strong>
          </p>

          <div className="join-request-form-group">
            <label className="join-request-form-label">IT Number</label>
            <input
              type="text"
              value={currentUser?.itNumber || ""}
              disabled
              className="join-request-form-input join-request-form-input-readonly"
            />
          </div>

          <div className="join-request-form-group">
            <label className="join-request-form-label">Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell the group leader why you want to join..."
              className="join-request-form-textarea"
              rows="4"
              maxLength="500"
            />
            <div className="join-request-char-count">{formData.message.length}/500 characters</div>
          </div>

          <div className="join-request-modal-footer">
            <button type="button" onClick={onCancel} className="join-request-btn-cancel">
              Cancel
            </button>
            <button type="submit" className="join-request-btn-submit" disabled={loading}>
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRequestModal;
