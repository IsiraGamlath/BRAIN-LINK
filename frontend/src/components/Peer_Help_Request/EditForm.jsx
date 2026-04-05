import React, { useState, useEffect } from "react";
import axios from "axios";

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
  }

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-gray-100 p-8 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          ✏️ Edit Help Request
        </h2>
        <p className="text-sm text-gray-600 mt-1">Update your request (only Open requests can be edited)</p>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-green-900">{success}</p>
            <p className="text-sm text-green-700 mt-1">Your request has been updated</p>
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
          className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none transition ${
            subjectError
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          value={subject}
          onChange={handleSubjectChange}
          required
        />
        {subjectError ? (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            ❌ {subjectError}
          </p>
        ) : subject.trim().length > 0 ? (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            ✓ {subject.trim().length} characters (min: 3)
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          📝 Description
        </label>
        <textarea
          placeholder="Describe what you need help with. Be specific so peers can better assist you."
          className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none transition resize-none ${
            descriptionError
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }`}
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          required
        />
        {descriptionError ? (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            ❌ {descriptionError}
          </p>
        ) : description.trim().length > 0 ? (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            ✓ {description.trim().length} characters (min: 10)
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          💬 Help Type
        </label>
        <select
          className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none transition cursor-pointer ${
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
        {helpTypeError ? (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            ❌ {helpTypeError}
          </p>
        ) : helpType ? (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            ✓ {helpType === "chat" ? "Chat Support" : "Study Session"} selected
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-lg bg-gray-200 hover:bg-gray-300 px-4 py-3 font-semibold text-gray-900 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !!subjectError || !!descriptionError || !!helpTypeError}
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>✏️ Save Changes</>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditForm;
