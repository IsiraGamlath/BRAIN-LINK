import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./GroupDetailsPage.css";
import StatusBadge from "../components/StatusBadge";
import JoinRequestModal from "../components/JoinRequestModal";
import LeaveConfirmationModal from "../components/LeaveConfirmationModal";

const API_BASE = "http://localhost:5000/api";

function GroupDetailsPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", text: "" });

  const setError = (text) => setFlashMessage({ type: "error", text });
  const setSuccess = (text) => setFlashMessage({ type: "success", text });

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/groups/${id}`);
      setGroup(response.data?.group || null);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to load group details.");
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
      navigate("/project-group-hub", { replace: true });
    } catch (error) {
      setError(error?.response?.data?.message || "Unable to leave group.");
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
        <button className="details-back" onClick={() => navigate("/project-group-hub")}>Back to Hub</button>
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
              <button className="details-danger" disabled title="Delete endpoint not available in current backend routes">
                Delete Group
              </button>
              <button className="details-secondary" disabled title="Update max members endpoint not available in current backend routes">
                Update Maximum Members
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
    </div>
  );
}

export default GroupDetailsPage;
