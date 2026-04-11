import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HelpCard from "../components/Peer_Help_Request/HelpCard";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../context/CurrentUserContext";
import "./MyRequestsPage.css";

// MyRequestsPage: Display logged-in user's help requests
const MyRequestsPage = () => {
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();
  const userId = useMemo(() => {
    const candidates = [
      user?.slIIId,
      currentUser?.itNumber,
      user?._id,
      user?.email,
      localStorage.getItem("userId"),
    ];

    const found = candidates.find((candidate) => {
      return candidate !== undefined && candidate !== null && String(candidate).trim() !== "";
    });

    return found ? String(found).trim() : "";
  }, [user?.slIIId, user?._id, user?.email, currentUser?.itNumber]);

  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, open, accepted, closed

  // Fetch user's help requests
  const fetchMyRequests = useCallback(async () => {
    if (!userId) {
      setRequests([]);
      setError("Unable to identify your account. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/help/my/${userId}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load your requests.");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchMyRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  // Handle edit button click - navigate to edit page
  const handleEdit = (requestId) => {
    navigate(`/edit/${requestId}`);
  };

  // Handle view chat - navigate to chat page
  const handleViewChat = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  // Handle delete - simple confirmation dialog
  const handleDelete = async (request) => {
    // Show native confirmation dialog
    const confirmed = window.confirm(
      `Delete "${request.subject}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/help/${request._id}`);
      alert("Request deleted successfully!");
      await fetchMyRequests(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request. " + err.message);
    }
  };

  // Filter requests based on selected status
  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status?.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "Open").length,
    accepted: requests.filter((r) => r.status === "Accepted").length,
    closed: requests.filter((r) => r.status === "Closed").length,
  };

  return (
    <section className="my-requests-page">
      <div className="my-requests-shell">
        <header className="my-requests-hero">
          <p className="my-requests-kicker">Profile Workspace</p>
          <h1>My Help Requests</h1>
          <p>Manage and track your help requests.</p>
        </header>

        <section className="my-requests-panel">
          <div className="my-requests-stats">
            <article className="my-requests-stat-card is-total">
              <p>Total Requests</p>
              <strong>{stats.total}</strong>
            </article>
            <article className="my-requests-stat-card is-open">
              <p>Open</p>
              <strong>{stats.open}</strong>
            </article>
            <article className="my-requests-stat-card is-accepted">
              <p>Accepted</p>
              <strong>{stats.accepted}</strong>
            </article>
            <article className="my-requests-stat-card is-closed">
              <p>Closed</p>
              <strong>{stats.closed}</strong>
            </article>
          </div>

          <div className="my-requests-filter-row" role="toolbar" aria-label="Request status filters">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`my-requests-filter-btn ${filter === "all" ? "active" : ""}`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter("open")}
              className={`my-requests-filter-btn ${filter === "open" ? "active" : ""}`}
            >
              Open ({stats.open})
            </button>
            <button
              type="button"
              onClick={() => setFilter("accepted")}
              className={`my-requests-filter-btn ${filter === "accepted" ? "active" : ""}`}
            >
              Accepted ({stats.accepted})
            </button>
            <button
              type="button"
              onClick={() => setFilter("closed")}
              className={`my-requests-filter-btn ${filter === "closed" ? "active" : ""}`}
            >
              Closed ({stats.closed})
            </button>
          </div>

          {loading && (
            <div className="my-requests-state-wrap">
              <div className="my-requests-spinner" aria-hidden="true" />
              <p className="my-requests-state">Loading your requests...</p>
            </div>
          )}

          {!loading && error && <p className="my-requests-state my-requests-state-error">{error}</p>}

          {!loading && !error && filteredRequests.length === 0 && (
            <div className="my-requests-empty-card">
              <div className="my-requests-empty-icon" aria-hidden="true">📋</div>
              <h3>You have not posted any requests</h3>
              <p>Your help requests will appear here. Get started by posting your first request.</p>
              <a href="/post" className="my-requests-primary-link">
                Post Your First Request
              </a>
            </div>
          )}

          {!loading && !error && filteredRequests.length > 0 && (
            <div className="my-requests-list">
              {filteredRequests.map((req) => (
                <HelpCard
                  key={req._id}
                  request={req}
                  showRespond={false}
                  showViewChat={true}
                  showClose={req.status === "Accepted"}
                  showEdit={req.status === "Open"}
                  showDelete={req.status === "Open"}
                  onClose={handleClose}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewChat={handleViewChat}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default MyRequestsPage;
