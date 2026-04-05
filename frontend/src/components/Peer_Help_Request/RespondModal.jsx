import React, { useState } from "react";
import axios from "axios";

// RespondModal: Modal for submitting a response to a help request with validation
// Opens when user clicks "Respond" button on a help request card
const RespondModal = ({ open, onClose, requestId, onResponded }) => {
  const [helperMessage, setHelperMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState(""); // Field-level error

  if (!open) return null;

  // Validate message field
  const validateMessage = (value) => {
    if (!value.trim()) {
      setMessageError("Response message is required");
      return false;
    } else if (value.trim().length < 3) {
      setMessageError("Response must be at least 3 characters");
      return false;
    } else {
      setMessageError("");
      return true;
    }
  };

  // Handle message change - clear error when user types
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setHelperMessage(value);
    // Clear error if user starts typing and there was an error
    if (messageError) {
      validateMessage(value);
    }
  };

  // Handle response submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate message field
    if (!validateMessage(helperMessage)) {
      return;
    }

    setLoading(true);
    try {
      // Send POST request to respond to help request
      await axios.post(`http://localhost:5000/api/help/${requestId}/respond`, {
        helperId: localStorage.getItem("userId") || "helper",
        helperMessage: helperMessage,
      });

      // Reset form
      setHelperMessage("");
      setMessageError("");
      
      // Notify parent component to refresh data
      if (onResponded) onResponded();
      
      // Close modal
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit response.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">✉️ Respond to Help Request</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm font-medium">
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Your Response
          </label>
          
          <textarea
            className={`w-full rounded border px-3 py-2 transition focus:outline-none resize-none ${
              messageError
                ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            }`}
            rows={4}
            placeholder="Type your response or offer help..."
            value={helperMessage}
            onChange={handleMessageChange}
          />
          
          {messageError && (
            <p className="text-red-600 text-sm font-medium mt-1.5 flex items-center gap-1">
              <span>❌</span> {messageError}
            </p>
          )}
          
          {!messageError && helperMessage && (
            <p className="text-green-600 text-sm font-medium mt-1.5 flex items-center gap-1">
              <span>✓</span> {helperMessage.length} characters (min: 3)
            </p>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 font-medium transition disabled:opacity-60"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium transition disabled:opacity-60 flex items-center gap-2"
              disabled={loading || !!messageError}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>✓ Send Response</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RespondModal;
