import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HelpCard from "../components/Peer_Help_Request/HelpCard";
import RespondModal from "../components/Peer_Help_Request/RespondModal";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../context/CurrentUserContext";
import "./HelpFeedPage.css";

// HelpFeedPage: Display all open help requests
const HelpFeedPage = () => {
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "chat", label: "Chat" },
    { value: "session", label: "Session" },
  ];

  const currentRequesterId = useMemo(() => {
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

    return found ? String(found).trim().toLowerCase() : "";
  }, [user?.slIIId, currentUser?.itNumber, user?._id, user?.email]);

  // Fetch all open help requests
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/help");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load help requests.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const otherUserRequests = useMemo(() => {
    if (!currentRequesterId) {
      return requests;
    }

    return requests.filter((request) => {
      const requestOwner = String(request.userId || "").trim().toLowerCase();
      return requestOwner !== currentRequesterId;
    });
  }, [requests, currentRequesterId]);

  const filteredRequests = useMemo(() => {
    if (requestTypeFilter === "all") {
      return otherUserRequests;
    }

    return otherUserRequests.filter((request) => {
      const requestType = String(request?.helpType || "").trim().toLowerCase();
      return requestType === requestTypeFilter;
    });
  }, [otherUserRequests, requestTypeFilter]);

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  const handleResponded = () => {
    fetchRequests();
  };

  return (
    <section className="help-feed-page">
      <div className="help-feed-shell">
        <header className="help-feed-hero">
          <div>
            <p className="help-feed-kicker">Peer Help Workspace</p>
            <h1>Help Request Feed</h1>
            <p>Browse requests published by other users and respond where you can help.</p>
          </div>
          <button
            type="button"
            className="help-feed-create-btn"
            onClick={() => navigate("/post")}
          >
            Create a Request
          </button>
        </header>

        <section className="help-feed-panel">
          <div className="help-feed-header-row">
            <h2>All Requests by Other Users</h2>
            <span className="help-feed-count">{filteredRequests.length}</span>
          </div>

          <div className="help-feed-filter-row">
            <p className="help-feed-filter-label">Filter by type:</p>
            <div className="help-feed-filter-group" role="tablist" aria-label="Filter requests by type">
              {filterOptions.map((option) => {
                const isActive = requestTypeFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`help-feed-filter-btn${isActive ? " is-active" : ""}`}
                    onClick={() => setRequestTypeFilter(option.value)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {!currentRequesterId && (
            <p className="help-feed-note">Showing all requests. Sign in to automatically hide your own posts.</p>
          )}

          {loading && (
            <div className="help-feed-loading-wrap">
              <div className="help-feed-spinner" aria-hidden="true" />
              <p className="help-feed-state">Loading help requests...</p>
            </div>
          )}

          {!loading && error && <p className="help-feed-state help-feed-state-error">{error}</p>}

          {!loading && !error && otherUserRequests.length === 0 && (
            <div className="help-feed-empty">
              <div className="help-feed-empty-icon" aria-hidden="true">🔎</div>
              <h3>No help requests available</h3>
              <p>There are no requests from other users right now. You can create one to get started.</p>
              <button
                type="button"
                className="help-feed-create-btn"
                onClick={() => navigate("/post")}
              >
                Create a Request
              </button>
            </div>
          )}

          {!loading && !error && otherUserRequests.length > 0 && filteredRequests.length === 0 && (
            <div className="help-feed-empty">
              <div className="help-feed-empty-icon" aria-hidden="true">🔎</div>
              <h3>No {requestTypeFilter} requests found</h3>
              <p>Try another filter to browse all available help requests.</p>
            </div>
          )}

          {!loading && !error && filteredRequests.length > 0 && (
            <div className="help-feed-grid">
              {Array.isArray(filteredRequests) && filteredRequests.map((req) => (
                <HelpCard
                  key={req._id}
                  request={req}
                  showRespond={req.status === "Open"}
                  showClose={req.status === "Accepted"}
                  onRespond={handleRespond}
                  onClose={handleClose}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <RespondModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        requestId={selectedRequest?._id}
        onResponded={handleResponded}
      />
    </section>
  );
};

export default HelpFeedPage;
