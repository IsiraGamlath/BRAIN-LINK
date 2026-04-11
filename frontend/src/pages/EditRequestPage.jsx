import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditForm from "../components/Peer_Help_Request/EditForm";
import "./EditRequestPage.css";

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
    <section className="edit-request-page">
      <div className="edit-request-shell">
        <header className="edit-request-hero">
          <button
            type="button"
            onClick={handleCancel}
            className="edit-request-back-btn"
          >
            ← Back to My Requests
          </button>
          <p className="edit-request-kicker">Profile Workspace</p>
          <h1>Edit Help Request</h1>
          <p>Update your request before you get a response.</p>
        </header>

        {message && (
          <div className="edit-request-flash">
            <span className="edit-request-flash-icon" aria-hidden="true">✓</span>
            <p>{message}</p>
          </div>
        )}

        <div className="edit-request-form-wrap">
          <EditForm requestId={id} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </section>
  );
};

export default EditRequestPage;
