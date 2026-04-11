import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./GroupDetailsPage.css";
import StatusBadge from "../components/StatusBadge";
import JoinRequestModal from "../components/JoinRequestModal";
import LeaveConfirmationModal from "../components/LeaveConfirmationModal";

const API_BASE = "http://localhost:5000/api";

function GroupDetailsPage({ currentUser, selectedGroupId, onBackToProjectGroup }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const resolvedGroupId = selectedGroupId || id;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateMaxModal, setShowUpdateMaxModal] = useState(false);
  const [newMaxMembers, setNewMaxMembers] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", text: "" });

  const setError = (text) => setFlashMessage({ type: "error", text });
  const setSuccess = (text) => setFlashMessage({ type: "success", text });

  const navigateBack = useCallback(() => {
    if (typeof onBackToProjectGroup === "function") {
      onBackToProjectGroup();
      return;
    }

    navigate("/project-group-hub", { replace: true });
  }, [navigate, onBackToProjectGroup]);

  const fetchGroup = useCallback(async () => {
    if (!resolvedGroupId) {
      setGroup(null);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/groups/${resolvedGroupId}`);
      setGroup(response.data?.group || null);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load group details.");
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [resolvedGroupId]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup, currentUser.itNumber]);

  useEffect(() => {
    if (!flashMessage.text) {
      return undefined;
    }

    const timer = setTimeout(() => setFlashMessage({ type: "", text: "" }), 3200);
    return () => clearTimeout(timer);
  }, [flashMessage]);

  const relationship = useMemo(() => {
    if (!group) {
      return "non-member";
    }

    if (group.leader === currentUser.itNumber) {
      return "leader";
    }

    const isMember = group.members.some((member) => member.itNumber === currentUser.itNumber);
    return isMember ? "member" : "non-member";
  }, [group, currentUser.itNumber]);

  const availableSlots = useMemo(() => {
    if (!group) {
      return 0;
    }
    return Math.max(group.maxMembers - group.members.length, 0);
  }, [group]);

  const handleJoinSubmit = async (joinData) => {
    if (!group) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_BASE}/groups/join/${group._id}`, {
        currentUser,
        itNumber: currentUser.itNumber,
        message: joinData.message,
      });
      setSuccess("Join request sent successfully.");
      setShowJoinModal(false);
      await fetchGroup();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to send join request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_BASE}/groups/leave/${group._id}`, {
        currentUser,
        itNumber: currentUser.itNumber,
      });
      setSuccess("You have left this group.");
      setShowLeaveModal(false);
      await fetchGroup();
      navigateBack();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to leave group.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) {
      return;
    }

    try {
      setActionLoading(true);
      await axios.delete(`${API_BASE}/groups/${group._id}`, {
        data: { currentUser },
      });
      setSuccess("Group deleted successfully");
      setShowDeleteConfirm(false);
      navigateBack();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to delete group.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMaxMembers = async () => {
    if (!group || !newMaxMembers) {
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

    if (parsedValue < group.members.length) {
      setError("Maximum members cannot be less than current members");
      return;
    }

    try {
      setActionLoading(true);
      await axios.put(`${API_BASE}/groups/${group._id}/max-members`, {
        maxMembers: parsedValue,
        currentUser,
      });
      setSuccess("Maximum members updated successfully");
      setShowUpdateMaxModal(false);
      setNewMaxMembers("");
      await fetchGroup();
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to update maximum members.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="group-details-page">
        <div className="group-details-loading">Loading group details...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-details-page">
        <div className="group-details-empty">Group details are unavailable.</div>
      </div>
    );
  }

  return (
    <div className="group-details-page">
      <div className="group-details-header">
        <button className="details-back" onClick={navigateBack}>
          {typeof onBackToProjectGroup === "function" ? "Back to My Project Group" : "Back to Hub"}
        </button>
        <div className="details-header-right">
          <StatusBadge status={group.status} />
          <span className="details-role">{relationship === "leader" ? "Leader" : relationship === "member" ? "Member" : "Non-member"}</span>
        </div>
      </div>

      {flashMessage.text && (
        <div className={`group-details-flash group-details-flash-${flashMessage.type}`}>
          {flashMessage.text}
        </div>
      )}

      <section className="group-details-card">
        <h1>{group.groupName}</h1>
        <p className="group-details-module">{group.moduleName}</p>
        <p className="group-details-description">{group.description}</p>

        <div className="group-details-grid">
          <div><span>Leader</span><strong>{group.leader}</strong></div>
          <div><span>Members</span><strong>{group.members.length} / {group.maxMembers}</strong></div>
          <div><span>Available Slots</span><strong>{availableSlots}</strong></div>
          <div><span>Created</span><strong>{new Date(group.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</strong></div>
        </div>

        <h3>Members List</h3>
        <div className="details-members">
          {group.members.map((member) => (
            <div className="details-member-row" key={member.itNumber}>
              <div>
                <strong>{member.itNumber}</strong>
                <p>Joined: {new Date(member.joinedAt).toLocaleDateString()}</p>
              </div>
              <span className="details-member-role">{member.role === "leader" ? "Leader" : "Member"}</span>
            </div>
          ))}
        </div>

        <div className="details-actions">
          {relationship === "non-member" && (
            <button
              className="details-primary"
              onClick={() => setShowJoinModal(true)}
              disabled={group.status === "Full" || actionLoading}
            >
              Request to Join
            </button>
          )}

          {relationship === "member" && (
            <button className="details-danger" onClick={() => setShowLeaveModal(true)} disabled={actionLoading}>
              Leave Group
            </button>
          )}

          {relationship === "leader" && (
            <>
              <button className="details-secondary" onClick={() => setShowUpdateMaxModal(true)} disabled={actionLoading}>
                Update Maximum Members
              </button>
              <button className="details-danger" onClick={() => setShowDeleteConfirm(true)} disabled={actionLoading}>
                Delete Group
              </button>
            </>
          )}
        </div>
      </section>

      {showJoinModal && (
        <JoinRequestModal
          isOpen={showJoinModal}
          group={group}
          currentUser={currentUser}
          onCancel={() => setShowJoinModal(false)}
          onSubmit={handleJoinSubmit}
          loading={actionLoading}
        />
      )}

      {showLeaveModal && (
        <LeaveConfirmationModal
          isOpen={showLeaveModal}
          groupName={group.groupName}
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={handleLeaveGroup}
        />
      )}

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
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="modal-danger"
                onClick={handleDeleteGroup}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
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
                Current Members: <strong>{group.members.length}</strong>
              </p>
              <label>
                New Maximum Members:
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newMaxMembers}
                  onChange={(e) => setNewMaxMembers(e.target.value)}
                  disabled={actionLoading}
                  placeholder={`${group.members.length} or higher`}
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
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="modal-primary"
                onClick={handleUpdateMaxMembers}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetailsPage;
