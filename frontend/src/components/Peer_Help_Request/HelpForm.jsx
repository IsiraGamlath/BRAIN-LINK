import React, { useState, useEffect } from "react";
import axios from "axios";

// HelpForm: Form to create a new help request with validation
const HelpForm = ({ onSuccess }) => {
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

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/help", {
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
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-gray-100 p-8 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          📝 Post a Help Request
        </h2>
        <p className="text-sm text-gray-600 mt-1">Let others help you with your academic challenges</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-green-900">{success}</p>
            <p className="text-sm text-green-700 mt-1">Your request has been posted to the feed</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-semibold text-red-900">{error}</p>
            <p className="text-sm text-red-700 mt-1">Please check your inputs and try again</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          📌 Subject
        </label>
        <input
          type="text"
          placeholder="e.g., Help with calculus derivatives"
          className={`w-full rounded-lg border px-4 py-2.5 transition focus:outline-none ${
            subjectError
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          value={subject}
          onChange={handleSubjectChange}
        />
        {subjectError && (
          <p className="text-red-600 text-sm font-medium mt-1.5 flex items-center gap-1">
            <span>❌</span> {subjectError}
          </p>
        )}
        {!subjectError && subject && (
          <p className="text-green-600 text-sm font-medium mt-1.5 flex items-center gap-1">
            <span>✓</span> {subject.length} characters
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          📝 Description
        </label>
        <textarea
          placeholder="Describe what you need help with. Be specific so peers can better assist you."
          className={`w-full rounded-lg border px-4 py-2.5 transition focus:outline-none resize-none ${
            descriptionError
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
        />
        {descriptionError && (
          <p className="text-red-600 text-sm font-medium mt-1.5 flex items-center gap-1">
            <span>❌</span> {descriptionError}
          </p>
        )}
        {!descriptionError && description && (
          <p className="text-green-600 text-sm font-medium mt-1.5 flex items-center gap-1">
            <span>✓</span> {description.length} characters (min: 10)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          💬 Help Type
        </label>
        <select
          className={`w-full rounded-lg border px-4 py-2.5 transition focus:outline-none cursor-pointer ${
            helpTypeError
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          value={helpType}
          onChange={handleHelpTypeChange}
        >
          <option value="">-- Select Help Type --</option>
          <option value="chat">💬 Chat Support</option>
          <option value="session">📅 Study Session</option>
        </select>
        {helpTypeError && (
          <p className="text-red-600 text-sm font-medium mt-1.5 flex items-center gap-1">
            <span>❌</span> {helpTypeError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Submitting...
          </>
        ) : (
          <>
            🚀 Submit Request
          </>
        )}
      </button>
    </form>
  );
};

export default HelpForm;
