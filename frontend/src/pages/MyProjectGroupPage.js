import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyProjectGroupPage.css";
import StatusBadge from "../components/StatusBadge";

const API_BASE = "http://localhost:5000/api";

function MyProjectGroupPage({ currentUser, onViewGroupDetails }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", text: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateMaxModal, setShowUpdateMaxModal] = useState(false);
  const [newMaxMembers, setNewMaxMembers] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const setError = (text) => setFlashMessage({ type: "error", text });
  const setSuccess = (text) => setFlashMessage({ type: "success", text });

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/groups`);
      setGroups(Array.isArray(response.data?.groups) ? response.data.groups : []);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load groups.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const myGroup = useMemo(
    () =>
      groups.find((group) =>
        group.members.some((member) => member.itNumber === currentUser.itNumber)
      ) || null,
    [groups, currentUser.itNumber]
  );

  const isLeader = useMemo(
    () => Boolean(myGroup && myGroup.leader === currentUser.itNumber),
    [myGroup, currentUser.itNumber]
  );

  const fetchLeaderRequests = useCallback(async () => {
    if (!myGroup || !isLeader) {
      setRequests([]);
      return;
    }

    try {
      setRequestLoading(true);
      const response = await axios.get(`${API_BASE}/requests/group/${myGroup._id}`, {
        params: { itNumber: currentUser.itNumber },
      });
      setRequests(Array.isArray(response.data?.requests) ? response.data.requests : []);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load join requests.");
      setRequests([]);
    } finally {
      setRequestLoading(false);
    }
  }, [myGroup, isLeader, currentUser.itNumber]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, currentUser.itNumber]);

  useEffect(() => {
    fetchLeaderRequests();
  }, [fetchLeaderRequests]);

  useEffect(() => {
    if (!flashMessage.text) {
      return undefined;
    }

    const timer = setTimeout(() => setFlashMessage({ type: "", text: "" }), 3200);
    return () => clearTimeout(timer);
  }, [flashMessage]);

  const handleDecision = async (requestId, action) => {
    if (!myGroup) {
      return;
    }

    try {
      await axios.patch(`${API_BASE}/requests/${myGroup._id}/${action}/${requestId}`, {
        action,
        currentUser,
      });
      setSuccess(`Request ${action === "accept" ? "accepted" : "rejected"}.`);
      await Promise.all([fetchGroups(), fetchLeaderRequests()]);
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to process request.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!myGroup) {
      return;
    }

    try {
      await axios.put(`${API_BASE}/groups/leave/${myGroup._id}`, {
        currentUser,
        itNumber: currentUser.itNumber,
      });
      setSuccess("You have left your project group.");
      await fetchGroups();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to leave group.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!myGroup) {
      return;
    }

    try {
      setUpdateLoading(true);
      await axios.delete(`${API_BASE}/groups/${myGroup._id}`, {
        data: { currentUser },
      });
      setSuccess("Group deleted successfully");
      setShowDeleteConfirm(false);
      navigate("/dashboard");
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to delete group.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateMaxMembers = async () => {
    if (!myGroup || !newMaxMembers) {
      setError("Please enter a valid number");
      return;
    }

    const parsedValue = Number(newMaxMembers);

    if (isNaN(parsedValue)) {
      setError("Invalid input");
      return;
    }

    if (parsedValue <= 0) {
      setError("Maximum members must be greater than 0");
      return;
    }

    if (parsedValue < myGroup.members.length) {
      setError("Maximum members cannot be less than current members");
      return;
    }

    try {
      setUpdateLoading(true);
      await axios.put(`${API_BASE}/groups/${myGroup._id}/max-members`, {
        maxMembers: parsedValue,
        currentUser,
      });
      setSuccess("Maximum members updated successfully");
      setShowUpdateMaxModal(false);
      setNewMaxMembers("");
      await fetchGroups();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to update maximum members.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-group-page">
        <div className="my-group-loading">Loading your project group...</div>
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div className="my-group-page">
        <div className="my-group-empty-state">
          <div className="empty-icon">👥</div>
          <h2>You are not assigned to any project group yet.</h2>
          <button className="my-group-primary" onClick={() => navigate("/create-project-group")}>
            Create Project Group
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = Math.max(myGroup.maxMembers - myGroup.members.length, 0);

  return (
    <div className="my-group-page">
      <div className="my-group-header">
        <h1>My Project Group</h1>
        <div className="my-group-header-meta">
          <StatusBadge status={myGroup.status} />
          <span className="my-group-role">{isLeader ? "Leader" : "Member"}</span>
        </div>
      </div>

      {flashMessage.text && (
        <div className={`my-group-flash my-group-flash-${flashMessage.type}`}>{flashMessage.text}</div>
      )}

      <div className="my-group-layout">
        <section className="my-group-card">
          <h2>{myGroup.groupName}</h2>
          <p className="my-group-module">{myGroup.moduleName}</p>
          <p className="my-group-description">{myGroup.description}</p>

          <div className="my-group-metrics">
            <div>
              <span className="label">Members</span>
              <span className="value">{myGroup.members.length} / {myGroup.maxMembers}</span>
            </div>
            <div>
              <span className="label">Available Slots</span>
              <span className="value">{availableSlots}</span>
            </div>
            <div>
              <span className="label">Created</span>
              <span className="value">{new Date(myGroup.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div>
              <span className="label">Leader</span>
              <span className="value">{myGroup.leader}</span>
            </div>
          </div>

          <h3>Members List</h3>
          <div className="my-group-members">
            {myGroup.members.map((member) => (
              <div className="member-row" key={member.itNumber}>
                <div>
                  <strong>{member.itNumber}</strong>
                  <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
                </div>
                <span className="role-pill">{member.role === "leader" ? "Leader" : "Member"}</span>
              </div>
            ))}
          </div>

          <div className="my-group-actions">
            <button
              className="my-group-secondary"
              onClick={() => {
                if (typeof onViewGroupDetails === "function") {
                  onViewGroupDetails(myGroup._id);
                  return;
                }

                navigate(`/group-details/${myGroup._id}`);
              }}
            >
              View Group Details
            </button>

            {isLeader ? (
              <>
                <button className="my-group-secondary" onClick={() => setShowUpdateMaxModal(true)}>
                  Update Maximum Members
                </button>
                <button className="my-group-danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Group
                </button>
              </>
            ) : (
              <button className="my-group-danger" onClick={handleLeaveGroup}>
                Leave Group
              </button>
            )}
          </div>
        </section>

        {isLeader && (
          <section className="my-group-card">
            <h3>Pending Join Requests</h3>
            {requestLoading ? (
              <p>Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="empty-sub">No pending requests right now.</p>
            ) : (
              <div className="request-list">
                {requests.map((request) => (
                  <div key={request._id} className="request-row">
                    <div>
                      <p className="request-student">{request.studentItNumber}</p>
                      <p className="request-message">{request.message || "No message provided."}</p>
                      <p className="request-time">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="request-right">
                      <StatusBadge status={request.status} small />
                      <div className="request-actions">
                        <button className="request-accept" onClick={() => handleDecision(request._id, "accept")}>
                          Accept Request
                        </button>
                        <button className="request-reject" onClick={() => handleDecision(request._id, "reject")}>
                          Reject Request
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Group</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this group?</p>
              <p className="modal-warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                className="modal-danger"
                onClick={handleDeleteGroup}
                disabled={updateLoading}
              >
                {updateLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Maximum Members Modal */}
      {showUpdateMaxModal && (
        <div className="modal-backdrop" onClick={() => setShowUpdateMaxModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Maximum Members</h2>
            </div>
            <div className="modal-body">
              <p className="modal-label">
                Current Members: <strong>{myGroup.members.length}</strong>
              </p>
              <label>
                New Maximum Members:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(e.target.value)}
                  disabled={updateLoading}
                  placeholder={`${myGroup.members.length} or higher`}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => {
                  setShowUpdateMaxModal(false);
                  setNewMaxMembers("");
                }}
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                className="modal-primary"
                onClick={handleUpdateMaxMembers}
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProjectGroupPage;
