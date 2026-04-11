import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createSession,
  deleteSession,
  fetchPastSessions,
  fetchUpcomingSessions,
  updateSession,
} from "../api/sessionApi";
import SessionCard from "../components/SessionCard";
import SessionForm from "../components/SessionForm";
import CreateProjectGroupPage from "./CreateProjectGroupPage";
import MyProjectGroupPage from "./MyProjectGroupPage";
import GroupDetailsPage from "./GroupDetailsPage";
import "../KuppiSessions.css";
import "./UserProfilePage.css";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const normalizeRequestStatus = (status) => {
  const normalized = String(status || "Open").trim().toLowerCase();

  if (normalized === "accepted") {
    return "Accepted";
  }

  if (normalized === "closed") {
    return "Closed";
  }

  return "Open";
};

const formatRequestDate = (dateValue) => {
  if (!hasValue(dateValue)) {
    return "Unknown time";
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown time";
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeSessionStatus = (status) => {
  const normalized = String(status || "Booked").trim().toLowerCase();

  if (normalized === "cancelled") {
    return "Cancelled";
  }

  if (normalized === "completed") {
    return "Completed";
  }

  return "Booked";
};

function UserProfilePage({ currentUser, onEditProfile }) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [requestFilter, setRequestFilter] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [myUpcomingSessions, setMyUpcomingSessions] = useState([]);
  const [myPastSessions, setMyPastSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [showCreateSessionForm, setShowCreateSessionForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState({ type: "", text: "" });
  const [selectedProjectGroupId, setSelectedProjectGroupId] = useState("");
  const [showCreateProjectGroupForm, setShowCreateProjectGroupForm] = useState(false);

  const requestUserId = useMemo(() => {
    const candidates = [
      authUser?.slIIId,
      currentUser?.itNumber,
      authUser?._id,
      authUser?.email,
      localStorage.getItem("userId"),
    ];

    const found = candidates.find((candidate) => hasValue(candidate));
    return found ? String(found).trim() : "";
  }, [authUser?.slIIId, authUser?._id, authUser?.email, currentUser?.itNumber]);

  const displayName = useMemo(() => {
    if (hasValue(currentUser?.name)) {
      return String(currentUser.name).trim();
    }

    if (hasValue(currentUser?.username)) {
      return String(currentUser.username).trim();
    }

    return "Student Explorer";
  }, [currentUser?.name, currentUser?.username]);

  const handleName = useMemo(() => {
    const normalized = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return normalized || "studentexplorer";
  }, [displayName]);

  const initials = useMemo(() => {
    const segments = displayName.split(/\s+/).filter(Boolean);
    if (segments.length === 0) {
      return "SE";
    }

    const first = segments[0].charAt(0);
    const second = segments.length > 1 ? segments[1].charAt(0) : segments[0].charAt(1);
    return `${first}${second || ""}`.toUpperCase();
  }, [displayName]);

  const joinedDateText = useMemo(() => {
    const rawDate = currentUser?.createdAt || currentUser?.joinDate;

    if (!hasValue(rawDate)) {
      return "9 April 2026";
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return "9 April 2026";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentUser?.createdAt, currentUser?.joinDate]);

  const academicRows = useMemo(
    () => [
      { label: "IT Number", value: currentUser?.itNumber },
      { label: "Specialization", value: currentUser?.specialization },
      { label: "Batch", value: currentUser?.batch },
      { label: "Semester", value: currentUser?.semester },
      { label: "Study Type", value: currentUser?.studyType },
      { label: "Subgroup", value: currentUser?.subgroup },
    ],
    [
      currentUser?.itNumber,
      currentUser?.specialization,
      currentUser?.batch,
      currentUser?.semester,
      currentUser?.studyType,
      currentUser?.subgroup,
    ]
  );

  const completedCount = academicRows.filter((row) => hasValue(row.value)).length;
  const completionRate = Math.round((completedCount / academicRows.length) * 100);
  const profilePoints = 100 + completedCount * 55;
  const streakCount = 2 + completedCount;

  const profileMood = useMemo(() => {
    if (completionRate >= 90) {
      return "Profile Master";
    }

    if (completionRate >= 60) {
      return "Momentum Builder";
    }

    return "Fresh Starter";
  }, [completionRate]);

  const focusTags = useMemo(() => {
    const tags = [];

    if (hasValue(currentUser?.specialization)) {
      tags.push(String(currentUser.specialization));
    }

    if (hasValue(currentUser?.studyType)) {
      tags.push(String(currentUser.studyType));
    }

    if (hasValue(currentUser?.batch)) {
      tags.push(`Batch ${currentUser.batch}`);
    }

    if (hasValue(currentUser?.semester)) {
      tags.push(`Semester ${currentUser.semester}`);
    }

    return tags.slice(0, 4);
  }, [currentUser?.specialization, currentUser?.studyType, currentUser?.batch, currentUser?.semester]);

  useEffect(() => {
    if (activeView !== "requests") {
      return;
    }

    if (!hasValue(requestUserId)) {
      setMyRequests([]);
      setRequestsError("Unable to identify your account. Please log in again.");
      return;
    }

    let ignore = false;

    const fetchMyRequests = async () => {
      setRequestsLoading(true);
      setRequestsError("");

      try {
        const response = await axios.get(
          `http://localhost:5000/api/help/my/${encodeURIComponent(requestUserId)}`
        );

        if (!ignore) {
          setMyRequests(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        if (!ignore) {
          setRequestsError("Failed to load your help requests.");
          setMyRequests([]);
        }
      } finally {
        if (!ignore) {
          setRequestsLoading(false);
        }
      }
    };

    fetchMyRequests();

    return () => {
      ignore = true;
    };
  }, [activeView, requestUserId]);

  const loadMySessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError("");

    try {
      const [upcoming, past] = await Promise.all([fetchUpcomingSessions(), fetchPastSessions()]);
      setMyUpcomingSessions(Array.isArray(upcoming) ? upcoming : []);
      setMyPastSessions(Array.isArray(past) ? past : []);
    } catch {
      setSessionsError("Failed to load your sessions.");
      setMyUpcomingSessions([]);
      setMyPastSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView !== "sessions") {
      return;
    }

    loadMySessions();
  }, [activeView, loadMySessions]);

  useEffect(() => {
    if (!selectedSession?._id) {
      return;
    }

    const refreshedSession = [...myUpcomingSessions, ...myPastSessions].find(
      (session) => session?._id === selectedSession._id
    );

    if (refreshedSession) {
      setSelectedSession(refreshedSession);
    }
  }, [myUpcomingSessions, myPastSessions, selectedSession?._id]);

  useEffect(() => {
    if (activeView === "sessions") {
      return;
    }

    setEditingSession(null);
    setShowCreateSessionForm(false);
    setSelectedSession(null);
  }, [activeView]);

  useEffect(() => {
    if (activeView === "goals") {
      return;
    }

    setSelectedProjectGroupId("");
    setShowCreateProjectGroupForm(false);
  }, [activeView]);

  const handleSessionEdit = (session) => {
    setEditingSession(session);
    setShowCreateSessionForm(false);
    setSessionFeedback({ type: "", text: "" });
  };

  const handleSessionCreateStart = () => {
    setEditingSession(null);
    setShowCreateSessionForm(true);
    setSelectedSession(null);
    setSessionFeedback({ type: "", text: "" });
  };

  const handleSessionFormCancel = () => {
    setEditingSession(null);
    setShowCreateSessionForm(false);
  };

  const handleSessionViewDetails = (session) => {
    setSelectedSession(session);
    setSessionFeedback({ type: "", text: "" });
  };

  const handleSessionDetailsClose = () => {
    setSelectedSession(null);
  };

  const formatSessionDate = (dateValue) => {
    if (!hasValue(dateValue)) {
      return "-";
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString();
  };

  const handleSessionCancelOrDelete = async (session) => {
    const confirmed = window.confirm(
      `Cancel "${session?.subject || "this session"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSessionFeedback({ type: "", text: "" });

    try {
      await deleteSession(session?._id);
      if (editingSession?._id === session?._id) {
        setEditingSession(null);
      }
      setSessionFeedback({ type: "success", text: "Session cancelled successfully." });
      await loadMySessions();
    } catch (error) {
      setSessionFeedback({
        type: "error",
        text: error?.response?.data?.message || "Failed to cancel session.",
      });
    }
  };

  const handleSessionUpdate = async (formData) => {
    if (!editingSession?._id) {
      return;
    }

    setSessionSubmitting(true);
    setSessionFeedback({ type: "", text: "" });

    try {
      await updateSession(editingSession._id, formData, editingSession);
      setEditingSession(null);
      setSessionFeedback({ type: "success", text: "Session updated successfully." });
      await loadMySessions();
    } catch (error) {
      setSessionFeedback({
        type: "error",
        text: error?.response?.data?.message || "Failed to update session.",
      });
    } finally {
      setSessionSubmitting(false);
    }
  };

  const handleSessionCreate = async (formData) => {
    setSessionSubmitting(true);
    setSessionFeedback({ type: "", text: "" });

    try {
      await createSession(formData);
      setShowCreateSessionForm(false);
      setSessionFeedback({ type: "success", text: "Session created successfully." });
      await loadMySessions();
    } catch (error) {
      setSessionFeedback({
        type: "error",
        text: error?.response?.data?.message || "Failed to create session.",
      });
    } finally {
      setSessionSubmitting(false);
    }
  };

  const handleProjectGroupCreateStart = () => {
    setSelectedProjectGroupId("");
    setShowCreateProjectGroupForm(true);
  };

  const handleProjectGroupCreateCancel = () => {
    setShowCreateProjectGroupForm(false);
  };

  const handleProjectGroupCreated = () => {
    setShowCreateProjectGroupForm(false);
    setSelectedProjectGroupId("");
  };

  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") {
      return myRequests;
    }

    return myRequests.filter((request) => {
      return normalizeRequestStatus(request?.status).toLowerCase() === requestFilter;
    });
  }, [myRequests, requestFilter]);

  const requestStats = useMemo(() => {
    return {
      total: myRequests.length,
      open: myRequests.filter((request) => normalizeRequestStatus(request?.status) === "Open").length,
      accepted: myRequests.filter((request) => normalizeRequestStatus(request?.status) === "Accepted").length,
      closed: myRequests.filter((request) => normalizeRequestStatus(request?.status) === "Closed").length,
    };
  }, [myRequests]);

  const totalSessionCount = myUpcomingSessions.length + myPastSessions.length;

  const viewOptions = [
    { id: "overview", label: "Overview" },
    { id: "requests", label: "My Request" },
    { id: "sessions", label: "My Sessions" },
    { id: "goals", label: "My Project Group" },
  ];

  const handleEditClick = () => {
    if (typeof onEditProfile === "function") {
      onEditProfile();
    }
  };

  return (
    <section className="fresh-profile-page">
      <aside className="fresh-profile-card">
        <div className="fresh-avatar-block">
          <div className="fresh-avatar" aria-hidden="true">
            {initials}
          </div>
          <span className="fresh-online-dot" aria-hidden="true" />
        </div>

        <p className="fresh-mood-badge">{profileMood}</p>
        <h1 className="fresh-name">{displayName}</h1>
        <p className="fresh-handle">@{handleName}</p>

        <div className="fresh-tag-row">
          {focusTags.length > 0 ? (
            focusTags.map((tag) => (
              <span key={tag} className="fresh-tag">
                {tag}
              </span>
            ))
          ) : (
            <span className="fresh-tag fresh-tag--muted">Add your academic focus areas</span>
          )}
        </div>

        <button type="button" className="fresh-edit-btn" onClick={handleEditClick}>
          Edit Profile
        </button>

        <dl className="fresh-metrics">
          <div>
            <dt>Points</dt>
            <dd>{profilePoints}</dd>
          </div>
          <div>
            <dt>Completion</dt>
            <dd>{completionRate}%</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>{streakCount}d</dd>
          </div>
        </dl>

        <div className="fresh-basics">
          <h2>Profile Basics</h2>
          <ul>
            <li>
              <span>Joined</span>
              <strong>{joinedDateText}</strong>
            </li>
            <li>
              <span>Level</span>
              <strong>{currentUser?.level || "College"}</strong>
            </li>
            <li>
              <span>Status</span>
              <strong>Warnings: 0</strong>
            </li>
          </ul>
        </div>
      </aside>

      <main className="fresh-main">
        <header className="fresh-main-header">
          <div>
            <p className="fresh-kicker">Profile Workspace</p>
            <h2>Craft a standout academic identity</h2>
          </div>

          <div className="fresh-switch" role="tablist" aria-label="Profile views">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`fresh-switch-btn ${activeView === option.id ? "active" : ""}`}
                onClick={() => setActiveView(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {activeView === "overview" && (
          <div className="fresh-grid">
            <section className="fresh-panel fresh-panel--insights">
              <h3>Growth Snapshot</h3>
              <p>Keep your profile complete to unlock better study-group matches.</p>
              <div className="fresh-progress-track" aria-hidden="true">
                <span style={{ width: `${completionRate}%` }} />
              </div>

              <div className="fresh-insight-cards">
                <article>
                  <span>Academic fields ready</span>
                  <strong>
                    {completedCount}/{academicRows.length}
                  </strong>
                </article>
                <article>
                  <span>Current strength</span>
                  <strong>
                    {hasValue(currentUser?.specialization)
                      ? String(currentUser.specialization)
                      : "Still discovering"}
                  </strong>
                </article>
                <article>
                  <span>Momentum</span>
                  <strong>{streakCount} day consistency</strong>
                </article>
              </div>
            </section>

            <section className="fresh-panel fresh-panel--journey">
              <h3>Next Steps</h3>
              <ul className="fresh-journey-list">
                <li>
                  <span className="fresh-step-badge">1</span>
                  <div>
                    <p>Complete all academic fields</p>
                    <small>Improves group matching quality.</small>
                  </div>
                </li>
                <li>
                  <span className="fresh-step-badge">2</span>
                  <div>
                    <p>Add specialization keywords</p>
                    <small>Helps peers discover your expertise.</small>
                  </div>
                </li>
                <li>
                  <span className="fresh-step-badge">3</span>
                  <div>
                    <p>Update profile every semester</p>
                    <small>Keeps recommendations accurate.</small>
                  </div>
                </li>
              </ul>
            </section>

            <section className="fresh-panel fresh-panel--academic">
              <h3>Academic Snapshot</h3>
              <ul className="fresh-academic-list">
                {academicRows.map((row) => {
                  const completed = hasValue(row.value);

                  return (
                    <li key={row.label}>
                      <div>
                        <span className="fresh-academic-label">{row.label}</span>
                        <strong className="fresh-academic-value">
                          {completed ? String(row.value) : "Not added yet"}
                        </strong>
                      </div>
                      <span className={`fresh-status-pill ${completed ? "ready" : "pending"}`}>
                        {completed ? "Ready" : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {activeView === "requests" && (
          <section className="fresh-panel fresh-panel--requests">
            <div className="fresh-requests-head">
              <div>
                <h3>My Help Requests</h3>
                <p>Requests submitted from HelpForm with your logged-in account.</p>
              </div>
              <button
                type="button"
                className="fresh-action-btn"
                onClick={() => navigate("/help-request")}
              >
                Create New Request
              </button>
            </div>

            <div className="fresh-request-filter-row" role="toolbar" aria-label="Request status filters">
              <button
                type="button"
                className={`fresh-filter-chip ${requestFilter === "all" ? "active" : ""}`}
                onClick={() => setRequestFilter("all")}
              >
                All ({requestStats.total})
              </button>
              <button
                type="button"
                className={`fresh-filter-chip ${requestFilter === "open" ? "active" : ""}`}
                onClick={() => setRequestFilter("open")}
              >
                Open ({requestStats.open})
              </button>
              <button
                type="button"
                className={`fresh-filter-chip ${requestFilter === "accepted" ? "active" : ""}`}
                onClick={() => setRequestFilter("accepted")}
              >
                Accepted ({requestStats.accepted})
              </button>
              <button
                type="button"
                className={`fresh-filter-chip ${requestFilter === "closed" ? "active" : ""}`}
                onClick={() => setRequestFilter("closed")}
              >
                Closed ({requestStats.closed})
              </button>
            </div>

            {requestsLoading && <p className="fresh-request-state">Loading your requests...</p>}

            {!requestsLoading && requestsError && (
              <p className="fresh-request-state fresh-request-state--error">{requestsError}</p>
            )}

            {!requestsLoading && !requestsError && filteredRequests.length === 0 && (
              <p className="fresh-request-state">No help requests found for this filter.</p>
            )}

            {!requestsLoading && !requestsError && filteredRequests.length > 0 && (
              <ul className="fresh-request-list">
                {filteredRequests.map((request) => {
                  const requestStatus = normalizeRequestStatus(request?.status);
                  const requestType = String(request?.helpType || "chat").toLowerCase() === "session"
                    ? "Study Session"
                    : "Chat Support";

                  return (
                    <li key={request?._id || `${request?.subject}-${request?.createdAt}`}>
                      <div className="fresh-request-top">
                        <strong>{request?.subject || "Untitled request"}</strong>
                        <span className={`fresh-status-pill ${requestStatus.toLowerCase()}`}>{requestStatus}</span>
                      </div>
                      <p>{request?.description || "No description provided."}</p>
                      <div className="fresh-request-meta">
                        <span>{requestType}</span>
                        <span>{formatRequestDate(request?.createdAt)}</span>
                      </div>
                      <div className="fresh-request-actions">
                        <button
                          type="button"
                          className="fresh-request-view-btn"
                          onClick={() => navigate("/my-requests")}
                        >
                          View More
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {activeView === "sessions" && (
          <section className="fresh-panel fresh-panel--sessions">
            <div className="fresh-requests-head">
              <div>
                <h3>My Sessions</h3>
                <p>View and track your Kuppi sessions directly from profile.</p>
              </div>
              <button
                type="button"
                className="fresh-action-btn"
                onClick={handleSessionCreateStart}
              >
                Create New Session
              </button>
            </div>

            <div className="fresh-request-filter-row">
              <span className="fresh-filter-chip active">Total ({totalSessionCount})</span>
              <span className="fresh-filter-chip">Upcoming ({myUpcomingSessions.length})</span>
              <span className="fresh-filter-chip">Past ({myPastSessions.length})</span>
            </div>

            {sessionsLoading && <p className="fresh-request-state">Loading your sessions...</p>}

            {!sessionsLoading && sessionsError && (
              <p className="fresh-request-state fresh-request-state--error">{sessionsError}</p>
            )}

            {!sessionsLoading && !sessionsError && sessionFeedback.text && (
              <p
                className={`fresh-request-state ${
                  sessionFeedback.type === "error" ? "fresh-request-state--error" : ""
                }`}
              >
                {sessionFeedback.text}
              </p>
            )}

            {!sessionsLoading && !sessionsError && (editingSession || showCreateSessionForm) && (
              <div className="fresh-session-form-wrap">
                <SessionForm
                  initialValues={editingSession || undefined}
                  onSubmit={editingSession ? handleSessionUpdate : handleSessionCreate}
                  onCancel={handleSessionFormCancel}
                  isSubmitting={sessionSubmitting}
                  submitLabel={editingSession ? "Update Session" : "Create Session"}
                />
              </div>
            )}

            {!sessionsLoading && !sessionsError && totalSessionCount === 0 && (
              <p className="fresh-request-state">No sessions found for your account yet.</p>
            )}

            {!sessionsLoading && !sessionsError && totalSessionCount > 0 && (
              <div className="fresh-session-sections">
                <section className="fresh-session-block">
                  <h4>Upcoming Sessions</h4>
                  {myUpcomingSessions.length === 0 ? (
                    <p className="fresh-request-state">No upcoming sessions.</p>
                  ) : (
                    <div className="fresh-session-card-list">
                      {myUpcomingSessions.map((session) => {
                        const status = normalizeSessionStatus(session?.status);

                        return (
                          <SessionCard
                            key={session?._id || `${session?.subject}-${session?.date}-${session?.startTime}`}
                            session={session}
                            onEdit={handleSessionEdit}
                            onDelete={handleSessionCancelOrDelete}
                            onViewDetails={handleSessionViewDetails}
                            canManage={status === "Booked"}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="fresh-session-block">
                  <h4>Past Sessions</h4>
                  {myPastSessions.length === 0 ? (
                    <p className="fresh-request-state">No past sessions.</p>
                  ) : (
                    <div className="fresh-session-card-list">
                      {myPastSessions.map((session) => {
                        return (
                          <SessionCard
                            key={session?._id || `${session?.subject}-${session?.date}-${session?.startTime}`}
                            session={session}
                            onEdit={handleSessionEdit}
                            onDelete={handleSessionCancelOrDelete}
                            onViewDetails={handleSessionViewDetails}
                            canManage={false}
                          />
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            )}

            {!sessionsLoading && !sessionsError && selectedSession && (
              <section className="fresh-session-block fresh-session-details-block">
                <div className="fresh-session-details-head">
                  <h4>Session Details</h4>
                  <button
                    type="button"
                    className="fresh-request-view-btn"
                    onClick={handleSessionDetailsClose}
                  >
                    Close
                  </button>
                </div>

                <div className="fresh-session-details-grid">
                  <div className="fresh-session-details-item">
                    <strong>Module</strong>
                    <span>{selectedSession?.subject || "-"}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Status</strong>
                    <span>{selectedSession?.status || "-"}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Date</strong>
                    <span>{formatSessionDate(selectedSession?.date)}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Start Time</strong>
                    <span>{selectedSession?.startTime || "-"}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Duration</strong>
                    <span>
                      {hasValue(selectedSession?.duration) ? `${selectedSession.duration} min` : "-"}
                    </span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Mode</strong>
                    <span>{selectedSession?.mode || "-"}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Creator IT Number</strong>
                    <span>{selectedSession?.studentId || "-"}</span>
                  </div>
                  <div className="fresh-session-details-item">
                    <strong>Location</strong>
                    <span>
                      {String(selectedSession?.mode || "").toLowerCase() === "physical"
                        ? selectedSession?.location || "-"
                        : "N/A"}
                    </span>
                  </div>
                  <div className="fresh-session-details-item fresh-session-details-item-wide">
                    <strong>Meeting Link</strong>
                    <span>
                      {String(selectedSession?.mode || "").toLowerCase() === "online"
                        ? selectedSession?.meetingLink || "-"
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="fresh-session-participants">
                  <h5>
                    Joined Participants (
                    {Array.isArray(selectedSession?.participants)
                      ? selectedSession.participants.filter((participant) => hasValue(participant)).length
                      : 0}
                    )
                  </h5>

                  {Array.isArray(selectedSession?.participants) &&
                  selectedSession.participants.filter((participant) => hasValue(participant)).length > 0 ? (
                    <ul className="fresh-session-participants-list">
                      {selectedSession.participants
                        .filter((participant) => hasValue(participant))
                        .map((participant, index) => (
                          <li key={`${participant}-${index}`}>{participant}</li>
                        ))}
                    </ul>
                  ) : (
                    <p className="fresh-request-state">No participants joined yet.</p>
                  )}
                </div>
              </section>
            )}
          </section>
        )}

        {activeView === "goals" && (
          <section className="fresh-panel fresh-panel--project-group">
            <div className="fresh-project-group-head">
              <div>
                <h3>My Project Group</h3>
                <p>Create a new group or manage your current project group details.</p>
              </div>
              <button
                type="button"
                className="fresh-action-btn"
                onClick={handleProjectGroupCreateStart}
              >
                Create Project Group
              </button>
            </div>

            {showCreateProjectGroupForm ? (
              <CreateProjectGroupPage
                currentUser={currentUser}
                embedded
                onCancel={handleProjectGroupCreateCancel}
                onCreated={handleProjectGroupCreated}
              />
            ) : selectedProjectGroupId ? (
              <GroupDetailsPage
                currentUser={currentUser}
                selectedGroupId={selectedProjectGroupId}
                onBackToProjectGroup={() => setSelectedProjectGroupId("")}
              />
            ) : (
              <MyProjectGroupPage
                currentUser={currentUser}
                onViewGroupDetails={(groupId) => {
                  setShowCreateProjectGroupForm(false);
                  setSelectedProjectGroupId(String(groupId || ""));
                }}
              />
            )}
          </section>
        )}
      </main>
    </section>
  );
}

export default UserProfilePage;