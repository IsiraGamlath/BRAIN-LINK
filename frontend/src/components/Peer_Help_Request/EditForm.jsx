import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditForm.css";

// EditForm: Form component for editing an existing help request
const EditForm = ({ requestId, onSuccess, onCancel }) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [helpType, setHelpType] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Field-level error states
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [helpTypeError, setHelpTypeError] = useState("");

  // Fetch the request details on component mount
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/help/${requestId}`);
        setSubject(res.data.subject);
        setDescription(res.data.description);
        setHelpType(res.data.helpType || "chat");
        setFetching(false);
      } catch (err) {
        setError("Failed to load request details.");
        setFetching(false);
      }
    };

    if (requestId) {
      fetchRequest();
    }
  }, [requestId]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validation functions
  const validateSubject = (value) => {
    if (!value.trim()) {
      setSubjectError("Subject is required");
      return false;
    } else if (value.trim().length < 3) {
      setSubjectError("Subject must be at least 3 characters");
      return false;
    } else {
      setSubjectError("");
      return true;
    }
  };

  const validateDescription = (value) => {
    if (!value.trim()) {
      setDescriptionError("Description is required");
      return false;
    } else if (value.trim().length < 10) {
      setDescriptionError("Description must be at least 10 characters");
      return false;
    } else {
      setDescriptionError("");
      return true;
    }
  };

  const validateHelpType = (value) => {
    if (!value) {
      setHelpTypeError("Please select a help type");
      return false;
    } else {
      setHelpTypeError("");
      return true;
    }
  };

  const validateForm = () => {
    const isSubjectValid = validateSubject(subject);
    const isDescriptionValid = validateDescription(description);
    const isHelpTypeValid = validateHelpType(helpType);
    return isSubjectValid && isDescriptionValid && isHelpTypeValid;
  };

  // Change handlers with real-time validation
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);
    if (subjectError) {
      validateSubject(value);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (descriptionError) {
      validateDescription(value);
    }
  };

  const handleHelpTypeChange = (e) => {
    const value = e.target.value;
    setHelpType(value);
    if (helpTypeError) {
      validateHelpType(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/help/${requestId}`, {
        subject,
        description,
        helpType,
      });
      setSuccess("Help request updated successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update help request.");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="edit-form-loading-wrap">
        <div className="edit-form-spinner" aria-hidden="true" />
        <p className="edit-form-loading-text">Loading request details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form-card">
      <div className="edit-form-head">
        <h2>Edit Help Request</h2>
        <p>Update your request (only Open requests can be edited).</p>
      </div>

      {success && (
        <div className="edit-form-alert edit-form-alert-success">
          <span className="edit-form-alert-icon" aria-hidden="true">OK</span>
          <div>
            <p>{success}</p>
            <small>Your request has been updated.</small>
          </div>
        </div>
      )}

      {error && (
        <div className="edit-form-alert edit-form-alert-error">
          <span className="edit-form-alert-icon" aria-hidden="true">!</span>
          <div>
            <p>{error}</p>
            <small>Please check your inputs and try again.</small>
          </div>
        </div>
      )}

      <div className="edit-form-field">
        <label className="edit-form-label">Subject</label>
        <input
          type="text"
          placeholder="e.g., Help with calculus derivatives"
          className={`edit-form-input ${subjectError ? "is-error" : ""}`}
          value={subject}
          onChange={handleSubjectChange}
          required
        />
        {subjectError ? (
          <p className="edit-form-feedback edit-form-feedback-error">
            {subjectError}
          </p>
        ) : subject.trim().length > 0 ? (
          <p className="edit-form-feedback edit-form-feedback-success">
            {subject.trim().length} characters (min: 3)
          </p>
        ) : null}
      </div>

      <div className="edit-form-field">
        <label className="edit-form-label">Description</label>
        <textarea
          placeholder="Describe what you need help with. Be specific so peers can better assist you."
          className={`edit-form-input edit-form-textarea ${descriptionError ? "is-error" : ""}`}
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          required
        />
        {descriptionError ? (
          <p className="edit-form-feedback edit-form-feedback-error">
            {descriptionError}
          </p>
        ) : description.trim().length > 0 ? (
          <p className="edit-form-feedback edit-form-feedback-success">
            {description.trim().length} characters (min: 10)
          </p>
        ) : null}
      </div>

      <div className="edit-form-field">
        <label className="edit-form-label">Help Type</label>
        <select
          className={`edit-form-input edit-form-select ${helpTypeError ? "is-error" : ""}`}
          value={helpType}
          onChange={handleHelpTypeChange}
        >
          <option value="">-- Select Help Type --</option>
          <option value="chat">Chat Support</option>
          <option value="session">Study Session</option>
        </select>
        {helpTypeError ? (
          <p className="edit-form-feedback edit-form-feedback-error">
            {helpTypeError}
          </p>
        ) : helpType ? (
          <p className="edit-form-feedback edit-form-feedback-success">
            {helpType === "chat" ? "Chat Support" : "Study Session"} selected
          </p>
        ) : null}
      </div>

      <div className="edit-form-actions">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="edit-form-btn edit-form-btn-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !!subjectError || !!descriptionError || !!helpTypeError}
          className="edit-form-btn edit-form-btn-submit"
        >
          {loading ? (
            <>
              <span className="edit-form-spinner edit-form-spinner-inline" aria-hidden="true" />
              Saving...
            </>
          ) : (
            <>Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditForm;
