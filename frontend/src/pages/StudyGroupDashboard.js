import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudyGroupDashboard.css";
import StatisticsCards from "../components/StatisticsCards";
import FilterBar from "../components/FilterBar";
import GroupCard from "../components/GroupCard";
import JoinRequestModal from "../components/JoinRequestModal";
import LeaveConfirmationModal from "../components/LeaveConfirmationModal";
import TestingUserSwitcher from "../components/TestingUserSwitcher";
import ProjectGroupRulesPanel from "../components/ProjectGroupRulesPanel";
import StatusBadge from "../components/StatusBadge";
import TabNavigation from "../components/TabNavigation";
import { isProfileComplete } from "../utils/profileHelpers";

const API_BASE = "http://localhost:5000/api";

function StudyGroupDashboard({ currentUser, onAddNotification, onSetNotifications }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Groups and requests state
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [pendingRequestsByGroup, setPendingRequestsByGroup] = useState({});
  const [myPendingRequests, setMyPendingRequests] = useState([]);
  const [loadingMyRequests, setLoadingMyRequests] = useState(false);

  // Modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedGroupForAction, setSelectedGroupForAction] = useState(null);

  // Loading and UI state
  const [requestDecisionLoading, setRequestDecisionLoading] = useState(false);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", text: "" });
  const [filterCriteria, setFilterCriteria] = useState({
    search: "",
    module: "All Modules",
    status: "All",
    view: "All Groups",
  });

  // Notifications state
  const [leaderNotifications, setLeaderNotifications] = useState([]);

  const setSuccess = (text) => setFlashMessage({ type: "success", text });
  const setError = (text) => setFlashMessage({ type: "error", text });

  const enableTestUserSwitcher = process.env.REACT_APP_ENABLE_TEST_USER_SWITCHER === "true";

  // Check profile completeness
  const profileComplete = useMemo(() => isProfileComplete(currentUser), [currentUser]);
  const profileIncompleteMessage = "Please complete your academic profile to create or join groups.";

  const fetchMyPendingRequests = useCallback(async () => {
    try {
      setLoadingMyRequests(true);
      const response = await axios.get(`${API_BASE}/requests/student`, {
        params: { itNumber: currentUser.itNumber },
      });
      const allRequests = Array.isArray(response.data?.requests) ? response.data.requests : [];
      const pendingOnly = allRequests.filter((req) => req.status === "Pending");
      setMyPendingRequests(pendingOnly);
    } catch (error) {
      console.error("Error fetching my pending requests:", error);
      setMyPendingRequests([]);
    } finally {
      setLoadingMyRequests(false);
    }
  }, [currentUser.itNumber]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const response = await axios.get(`${API_BASE}/groups`);
      const serverGroups = Array.isArray(response.data?.groups) ? response.data.groups : [];
      setGroups(serverGroups);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load groups.";
      setError(message);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchLeaderRequests = useCallback(
    async (sourceGroups) => {
      const leaderGroups = sourceGroups.filter((group) => group.leader === currentUser.itNumber);

      if (leaderGroups.length === 0) {
        setPendingRequestsByGroup({});
        setLeaderNotifications([]);
        onSetNotifications([]);
        return;
      }

      try {
        const responses = await Promise.all(
          leaderGroups.map((group) =>
            axios.get(`${API_BASE}/requests/group/${group._id}`, {
              params: { itNumber: currentUser.itNumber },
            })
          )
        );

        const mappedRequests = {};
        const notifications = [];

        leaderGroups.forEach((group, index) => {
          const groupRequests = responses[index].data?.requests || [];
          mappedRequests[group._id] = groupRequests;

          // Generate notifications from pending requests
          groupRequests.forEach((request) => {
            if (request.status === "Pending") {
              notifications.push({
                id: `${group._id}-${request._id}`,
                groupId: group._id,
                groupName: group.groupName,
                studentName: request.studentItNumber,
                requestId: request._id,
                timestamp: request.createdAt,
                read: false,
              });
            }
          });
        });

        setPendingRequestsByGroup(mappedRequests);
        setLeaderNotifications(notifications);
        onSetNotifications(notifications);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to load pending requests.";
        setError(message);
      }
    },
    [currentUser.itNumber, onSetNotifications]
  );

  // Initial data fetch
  useEffect(() => {
    fetchGroups();
    fetchMyPendingRequests();
  }, [fetchGroups, fetchMyPendingRequests, currentUser.itNumber]);

  useEffect(() => {
    if (groups.length > 0) {
      fetchLeaderRequests(groups);
    } else {
      setPendingRequestsByGroup({});
      setLeaderNotifications([]);
      onSetNotifications([]);
    }
  }, [groups, fetchLeaderRequests, onSetNotifications]);

  useEffect(() => {
    let filtered = [...groups];

    filtered = filtered.filter(
      (group) =>
        group.specialization === currentUser.specialization &&
        group.batch === currentUser.batch &&
        group.semester === currentUser.semester &&
        group.studyType === currentUser.studyType &&
        group.subgroup === currentUser.subgroup
    );

    if (filterCriteria.search) {
      const search = filterCriteria.search.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          String(group.moduleName).toLowerCase().includes(search) ||
          String(group.groupName).toLowerCase().includes(search)
      );
    }

    if (filterCriteria.module !== "All Modules") {
      filtered = filtered.filter((group) => group.moduleName === filterCriteria.module);
    }

    if (filterCriteria.status !== "All") {
      filtered = filtered.filter((group) => group.status === filterCriteria.status);
    }

    if (filterCriteria.view === "My Groups") {
      filtered = filtered.filter((group) =>
        group.members.some((member) => member.itNumber === currentUser.itNumber)
      );
    } else if (filterCriteria.view === "Groups I Lead") {
      filtered = filtered.filter((group) => group.leader === currentUser.itNumber);
    } else if (filterCriteria.view === "Groups I Joined") {
      filtered = filtered.filter(
        (group) =>
          group.members.some((member) => member.itNumber === currentUser.itNumber) &&
          group.leader !== currentUser.itNumber
      );
    } else if (filterCriteria.view === "Available to Join") {
      filtered = filtered.filter(
        (group) =>
          !group.members.some((member) => member.itNumber === currentUser.itNumber) &&
          group.status === "Open"
      );
    }

    setFilteredGroups(filtered);
  }, [filterCriteria, groups, currentUser]);

  useEffect(() => {
    if (!flashMessage.text) {
      return;
    }

    const timer = setTimeout(() => {
      setFlashMessage({ type: "", text: "" });
    }, 3500);

    return () => clearTimeout(timer);
  }, [flashMessage]);

  useEffect(() => {
    if (!location.state?.flashMessage) {
      return;
    }

    setFlashMessage(location.state.flashMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const handleFilterChange = (newFilters) => {
    setFilterCriteria(newFilters);
  };

  const handleClearFilters = () => {
    setFilterCriteria({
      search: "",
      module: "All Modules",
      status: "All",
      view: "Available to Join",
    });
  };

  const handleJoinGroup = (group) => {
    if (!profileComplete) {
      setError(profileIncompleteMessage);
      return;
    }
    setSelectedGroupForAction(group);
    setShowJoinModal(true);
  };

  const handleLeaveGroup = (group) => {
    setSelectedGroupForAction(group);
    setShowLeaveModal(true);
  };

  const handleJoinSubmit = async (joinData) => {
    if (!selectedGroupForAction?._id) {
      return;
    }

    try {
      setGlobalActionLoading(true);
      await axios.put(`${API_BASE}/groups/join/${selectedGroupForAction._id}`, {
        currentUser,
        itNumber: currentUser.itNumber,
        message: joinData.message,
      });

      setShowJoinModal(false);
      setSelectedGroupForAction(null);
      setSuccess("Join request sent. Waiting for leader approval.");
      await fetchGroups();
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to send join request.";
      setError(message);
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const handleLeaveConfirm = async () => {
    if (!selectedGroupForAction?._id) {
      return;
    }

    try {
      setGlobalActionLoading(true);
      await axios.put(`${API_BASE}/groups/leave/${selectedGroupForAction._id}`, {
        currentUser,
        itNumber: currentUser.itNumber,
      });

      setShowLeaveModal(false);
      setSelectedGroupForAction(null);
      setSuccess("You have left the group.");
      await fetchGroups();
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to leave this group.";
      setError(message);
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const handleRequestDecision = async (groupId, requestId, action) => {
    try {
      setRequestDecisionLoading(true);
      await axios.patch(`${API_BASE}/requests/${groupId}/${action}/${requestId}`, {
        action,
        currentUser,
      });

      setSuccess(`Request ${action === "accept" ? "accepted" : "rejected"} successfully.`);
      await fetchGroups();
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to process this request.";
      setError(message);
    } finally {
      setRequestDecisionLoading(false);
    }
  };

  const getGroupButtonAction = (group) => {
    const isMember = group.members.some((member) => member.itNumber === currentUser.itNumber);
    const isLeader = group.leader === currentUser.itNumber;

    if (isLeader) {
      return "Manage Requests";
    }

    if (isMember) {
      return "Leave";
    }

    if (group.status === "Full") {
      return "Full";
    }

    return "Request to Join";
  };

  const handleGroupCardAction = (group, action) => {
    if (action === "Request to Join") {
      handleJoinGroup(group);
      return;
    }

    if (action === "Leave") {
      handleLeaveGroup(group);
    }
  };

  // Tab content renderers
  const renderOverviewTab = () => (
    <>
      <StatisticsCards groups={groups} user={currentUser} />

      {!profileComplete && (
        <div className="profile-warning-banner">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3 className="warning-title">Complete Your Academic Profile</h3>
            <p className="warning-message">
              {profileIncompleteMessage} Click the "Edit Academic Profile" button in the header to
              get started.
            </p>
          </div>
        </div>
      )}

      <div className="overview-utility-grid">
        <section className="my-group-info-card" aria-label="My Project Group Info">
          <div className="info-card-header">
            <h2 className="section-title">My Project Group</h2>
            <p className="section-description">
              Your current academic context used to match relevant project groups.
            </p>
          </div>

          <div className="profile-tags-section">
            <span className="profile-tag">IT Batch: {currentUser.batch}</span>
            <span className="profile-tag">Semester: {currentUser.semester}</span>
            <span className="profile-tag">Subgroup: {currentUser.subgroup}</span>
            <span className="profile-tag">Study Type: {currentUser.studyType}</span>
          </div>

          <button
            className={`btn-create-group ${!profileComplete ? "btn-disabled" : ""}`}
            onClick={() => navigate("/create-project-group")}
            disabled={!profileComplete}
            title={!profileComplete ? profileIncompleteMessage : "Create a new project group"}
          >
            Create New Project Group
          </button>
        </section>

        <ProjectGroupRulesPanel />
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        filterCriteria={filterCriteria}
      />

      <section className="groups-section">
        <h2 className="section-title">Project Groups ({filteredGroups.length})</h2>
        <p className="section-description">
          Browse available groups in your academic context and request to join.
        </p>

        {loadingGroups ? (
          <div className="no-groups-message">
            <p>Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="empty-groups-state">
            <div className="empty-groups-icon">👥</div>
            <h3>No project groups available yet.</h3>
            <p>Try adjusting filters or create a new project group.</p>
            <button className="btn-create-group" onClick={() => setActiveTab("create")}>
              Create Project Group
            </button>
          </div>
        ) : (
          <div className="groups-grid">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                currentUser={currentUser}
                buttonAction={getGroupButtonAction(group)}
                onButtonClick={(action) => handleGroupCardAction(group, action)}
                onViewDetails={() => navigate(`/group-details/${group._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderCreateTab = () => (
    <div className="tab-content-wrapper">
      <div className="tab-section-card">
        <h2 className="section-title">Create a New Project Group</h2>
        <p className="section-description">
          Fill in the details below to create a new project group for your assignment or project.
        </p>

        {!profileComplete && (
          <div className="profile-warning-banner">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h3 className="warning-title">Complete Your Academic Profile First</h3>
              <p className="warning-message">
                {profileIncompleteMessage} Click the "Edit Academic Profile" button in the header
                to get started.
              </p>
            </div>
          </div>
        )}

        <button
          className={`btn-navigate-page ${!profileComplete ? "btn-disabled" : ""}`}
          onClick={() => navigate("/create-project-group")}
          disabled={!profileComplete}
          title={!profileComplete ? profileIncompleteMessage : "Go to Create Project Group page"}
        >
          📄 Open Create Project Group Form
        </button>

        <ProjectGroupRulesPanel />
      </div>
    </div>
  );

  const renderMyGroupTab = () => (
    <div className="tab-content-wrapper">
      <div className="tab-section-card">
        <h2 className="section-title">My Project Group</h2>

        <button
          className="btn-navigate-page"
          onClick={() => navigate("/my-project-group")}
          title="View your assigned project group"
        >
          🏆 View My Project Group
        </button>
      </div>

      <div className="my-pending-requests-section">
        <h2 className="section-title">My Pending Requests ({myPendingRequests.length})</h2>
        {loadingMyRequests ? (
          <div className="no-groups-message">
            <p>Loading your requests...</p>
          </div>
        ) : myPendingRequests.length === 0 ? (
          <div className="no-groups-message">
            <p>You have no pending join requests.</p>
            <p className="help-text">Send a request to a group to appear here.</p>
          </div>
        ) : (
          <div className="my-pending-requests-grid">
            {myPendingRequests.map((request) => (
              <div key={request._id} className="my-pending-request-card">
                <div className="my-pending-header">
                  <h3>{request.groupId?.groupName || "Group"}</h3>
                  <StatusBadge status={request.status || "Pending"} small />
                </div>
                <div className="my-pending-details">
                  <p>
                    <strong>Module:</strong> {request.groupId?.moduleName || "N/A"}
                  </p>
                  <p>
                    <strong>Leader:</strong> {request.groupId?.leader || "N/A"}
                  </p>
                  <p>
                    <strong>Your Message:</strong>
                  </p>
                  <p className="request-message">{request.message || "No message provided"}</p>
                  <p className="request-date">
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPendingRequestsTab = () => {
    const leaderGroups = groups.filter((group) => group.leader === currentUser.itNumber);
    return (
      <div className="tab-content-wrapper">
        <div className="leader-requests-section">
        <h2 className="section-title">Pending Join Requests for Your Groups</h2>
          {leaderGroups.length === 0 ? (
            <div className="empty-groups-state">
              <div className="empty-groups-icon">📋</div>
              <h3>You are not leading any groups yet.</h3>
              <p>Create a group to see pending join requests here.</p>
              <button className="btn-create-group" onClick={() => setActiveTab("create")}>
                Create Your First Group
              </button>
            </div>
          ) : (
            <div className="leader-requests-grid">
              {leaderGroups.map((group) => {
                const requests = pendingRequestsByGroup[group._id] || [];

                return (
                  <div key={group._id} className="leader-request-card">
                    <div className="leader-request-header">
                      <h3>{group.groupName}</h3>
                      <span className="request-count-badge">{requests.length} Pending</span>
                    </div>

                    {requests.length === 0 ? (
                      <p className="leader-request-empty">No pending requests for this group.</p>
                    ) : (
                      requests.map((request) => (
                        <div key={request._id} className="leader-request-row">
                          <div>
                            <strong>{request.studentItNumber}</strong>
                            <p>{request.message || "No message provided."}</p>
                          </div>
                          <div className="leader-request-actions">
                            <StatusBadge status={request.status} small />
                            <button
                              className="leader-request-btn leader-request-accept"
                              disabled={requestDecisionLoading}
                              onClick={() =>
                                handleRequestDecision(group._id, request._id, "accept")
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="leader-request-btn leader-request-reject"
                              disabled={requestDecisionLoading}
                              onClick={() =>
                                handleRequestDecision(group._id, request._id, "reject")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderNotificationsTab = () => (
    <div className="tab-content-wrapper">
      <div className="notifications-section">
        <h2 className="section-title">Notifications ({leaderNotifications.length})</h2>

        {leaderNotifications.length === 0 ? (
          <div className="empty-groups-state">
            <div className="empty-groups-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>You'll receive notifications when someone requests to join your group.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {leaderNotifications.map((notif) => (
              <div key={notif.id} className="notification-list-item">
                <div className="notification-list-icon">👤</div>
                <div className="notification-list-content">
                  <p className="notification-list-message">
                    <strong>{notif.studentName}</strong> requested to join{" "}
                    <strong>{notif.groupName}</strong>
                  </p>
                  <p className="notification-list-time">
                    {new Date(notif.timestamp).toLocaleDateString()}{" "}
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  className="notification-list-action"
                  onClick={() => setActiveTab("pending-requests")}
                  title="Go to Pending Requests"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="notifications-footer">
          <p className="notifications-hint">
            Manage all requests in the Pending Requests tab to accept or reject them.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="page-title">Project Group Hub</h1>
          <p className="page-subtitle">
            Create, join, and manage project groups for marked assignments and academic projects.
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        {enableTestUserSwitcher && <TestingUserSwitcher />}

        {flashMessage.text && (
          <div className={`hub-flash-message hub-flash-${flashMessage.type}`}>
            {flashMessage.text}
          </div>
        )}

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notificationCount={leaderNotifications.filter((n) => !n.read).length}
        />

        <div className="tab-content">
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "create" && renderCreateTab()}
          {activeTab === "my-group" && renderMyGroupTab()}
          {activeTab === "pending-requests" && renderPendingRequestsTab()}
          {activeTab === "notifications" && renderNotificationsTab()}
        </div>
      </div>

      {showJoinModal && selectedGroupForAction && (
        <JoinRequestModal
          isOpen={showJoinModal}
          group={selectedGroupForAction}
          currentUser={currentUser}
          onCancel={() => setShowJoinModal(false)}
          onSubmit={handleJoinSubmit}
          loading={globalActionLoading}
        />
      )}

      {showLeaveModal && selectedGroupForAction && (
        <LeaveConfirmationModal
          isOpen={showLeaveModal}
          groupName={selectedGroupForAction.groupName}
          onCancel={() => setShowLeaveModal(false)}
          onConfirm={handleLeaveConfirm}
        />
      )}
    </div>
  );
}

export default StudyGroupDashboard;
