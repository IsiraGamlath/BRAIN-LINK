import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useCurrentUser } from "../../context/CurrentUserContext";
import "./HelpForm.css";

// HelpForm: Form to create a new help request with validation
const HelpForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [helpType, setHelpType] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Field-level error states
  const [subjectError, setSubjectError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [helpTypeError, setHelpTypeError] = useState("");

  const requesterId = useMemo(() => {
    const candidates = [
      user?.slIIId,
      currentUser?.itNumber,
      user?._id,
      user?.email,
      localStorage.getItem("userId"),
    ];

    const match = candidates.find((candidate) => {
      return candidate !== undefined && candidate !== null && String(candidate).trim() !== "";
    });

    return match ? String(match).trim() : "";
  }, [user?.slIIId, user?._id, user?.email, currentUser?.itNumber]);

  useEffect(() => {
    if (requesterId) {
      localStorage.setItem("userId", requesterId);
    }
  }, [requesterId]);

  // Auto-hide success message after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validate subject field
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

  // Validate description field
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

  // Validate helpType field
  const validateHelpType = (value) => {
    if (!value) {
      setHelpTypeError("Please select a help type");
      return false;
    } else {
      setHelpTypeError("");
      return true;
    }
  };

  // Validate all fields
  const validateForm = () => {
    const isSubjectValid = validateSubject(subject);
    const isDescriptionValid = validateDescription(description);
    const isHelpTypeValid = validateHelpType(helpType);

    return isSubjectValid && isDescriptionValid && isHelpTypeValid;
  };

  // Handle subject change - clear error when user types
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);
    if (subjectError) {
      validateSubject(value);
    }
  };

  // Handle description change - clear error when user types
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    if (descriptionError) {
      validateDescription(value);
    }
  };

  // Handle helpType change - clear error when user selects
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

    if (!requesterId) {
      setError("Please sign in before submitting a help request.");
      return;
    }

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/help", {
        userId: requesterId,
        subject,
        description,
        helpType,
      });
      setSuccess("Help request submitted!");
      setSubject("");
      setDescription("");
      setHelpType("chat");
      setSubjectError("");
      setDescriptionError("");
      setHelpTypeError("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to submit help request.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="help-form-card">
      <div className="help-form-head">
        <h2>Post a Help Request</h2>
        <p>Let others help you with your academic challenges.</p>
      </div>

      {success && (
        <div className="help-form-alert help-form-alert-success">
          <span className="help-form-alert-icon">OK</span>
          <div>
            <p>{success}</p>
            <small>Your request has been posted to the feed.</small>
          </div>
        </div>
      )}

      {error && (
        <div className="help-form-alert help-form-alert-error">
          <span className="help-form-alert-icon">!</span>
          <div>
            <p>{error}</p>
            <small>Please check your inputs and try again.</small>
          </div>
        </div>
      )}

      <div className="help-form-field">
        <label className="help-form-label">Subject</label>
        <input
          type="text"
          placeholder="e.g., Help with calculus derivatives"
          className={`help-form-input ${subjectError ? "is-error" : ""}`}
          value={subject}
          onChange={handleSubjectChange}
        />
        {subjectError && (
          <p className="help-form-feedback help-form-feedback-error">
            {subjectError}
          </p>
        )}
        {!subjectError && subject && (
          <p className="help-form-feedback help-form-feedback-success">
            {subject.length} characters
          </p>
        )}
      </div>

      <div className="help-form-field">
        <label className="help-form-label">Description</label>
        <textarea
          placeholder="Describe what you need help with. Be specific so peers can better assist you."
          className={`help-form-input help-form-textarea ${descriptionError ? "is-error" : ""}`}
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
        />
        {descriptionError && (
          <p className="help-form-feedback help-form-feedback-error">
            {descriptionError}
          </p>
        )}
        {!descriptionError && description && (
          <p className="help-form-feedback help-form-feedback-success">
            {description.length} characters (min: 10)
          </p>
        )}
      </div>

      <div className="help-form-field">
        <label className="help-form-label">Help Type</label>
        <select
          className={`help-form-input help-form-select ${helpTypeError ? "is-error" : ""}`}
          value={helpType}
          onChange={handleHelpTypeChange}
        >
          <option value="">-- Select Help Type --</option>
          <option value="chat">Chat Support</option>
          <option value="session">Study Session</option>
        </select>
        {helpTypeError && (
          <p className="help-form-feedback help-form-feedback-error">
            {helpTypeError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="help-form-submit"
      >
        {loading ? (
          <>
            <span className="help-form-spinner" />
            Submitting...
          </>
        ) : (
          <>Submit Request</>
        )}
      </button>
    </form>
  );
};

export default HelpForm;
