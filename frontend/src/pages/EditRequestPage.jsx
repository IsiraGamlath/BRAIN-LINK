import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditForm from "../components/Peer_Help_Request/EditForm";

// EditRequestPage: Page for editing an existing help request
const EditRequestPage = () => {
  const { id } = useParams(); // Get request ID from URL parameters
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSuccess = () => {
    setMessage("Request updated! Redirecting...");
    setTimeout(() => {
      navigate("/my-requests");
    }, 1500);
  };

  const handleCancel = () => {
    if (window.confirm("Discard changes and go back?")) {
      navigate("/my-requests");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to My Requests
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Edit Help Request</h1>
          <p className="mt-2 text-lg text-gray-600">Update your request before you get a response</p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
            <span className="text-xl">✅</span>
            <p className="font-semibold text-green-900">{message}</p>
          </div>
        )}

        <EditForm requestId={id} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default EditRequestPage;
