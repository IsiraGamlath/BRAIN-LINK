import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Header.css";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../context/CurrentUserContext";
import NotificationPanel from "./NotificationPanel";

const HELP_API_BASE = "http://localhost:5000/api/help";
const GROUP_API_BASE = "http://localhost:5000/api";
const SESSION_API_BASE = "http://localhost:5000/sessions";

const toSafeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeIdentity = (value) => toSafeString(value).toLowerCase();

const toTimestamp = (value, fallback) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
};

const previewText = (text, maxLength = 72) => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

function Header() {
  const { user, logout } = useAuth();
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [helpNotifications, setHelpNotifications] = useState([]);

  const currentIdentity = useMemo(() => {
    const candidates = [
      user?.slIIId,
      currentUser?.itNumber,
      user?._id,
      user?.email,
      localStorage.getItem("userId"),
    ];

    const found = candidates.find(
      (candidate) => candidate !== undefined && candidate !== null && String(candidate).trim() !== ""
    );

    return found ? String(found).trim() : "";
  }, [user?.slIIId, currentUser?.itNumber, user?._id, user?.email]);

  const normalizedIdentity = useMemo(() => currentIdentity.toLowerCase(), [currentIdentity]);

  const notificationReadStorageKey = useMemo(() => {
    if (!normalizedIdentity) {
      return "";
    }

    return `brainlink.help.notification.read.${normalizedIdentity}`;
  }, [normalizedIdentity]);

  const initials = (currentUser?.name || user?.fullName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const getReadMap = useCallback(() => {
    if (!notificationReadStorageKey) {
      return {};
    }

    try {
      const parsed = JSON.parse(localStorage.getItem(notificationReadStorageKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }, [notificationReadStorageKey]);

  const saveReadMap = useCallback(
    (map) => {
      if (!notificationReadStorageKey) {
        return;
      }

      localStorage.setItem(notificationReadStorageKey, JSON.stringify(map));
    },
    [notificationReadStorageKey]
  );

  const mapHelpRequestsToNotifications = useCallback(
    (requests, readMap) => {
      const list = Array.isArray(requests) ? requests : [];

      const notifications = [];

      list.forEach((request) => {
        const requestId = toSafeString(request?._id);

        if (!requestId) {
          return;
        }

        const requestOwner = normalizeIdentity(request?.userId);
        const requestHelper = normalizeIdentity(request?.helperId);
        const isParticipant = requestOwner === normalizedIdentity || requestHelper === normalizedIdentity;

        if (!isParticipant) {
          return;
        }

        const subject = toSafeString(request?.subject) || "Help request";
        const fallbackTimestamp = toTimestamp(
          request?.updatedAt || request?.createdAt,
          new Date().toISOString()
        );

        const normalizedMessages = (Array.isArray(request?.messages) ? request.messages : [])
          .filter((message) => message && toSafeString(message.text) !== "")
          .map((message, index) => ({
            signature:
              toSafeString(message._id) ||
              `${normalizeIdentity(message.senderId)}:${toSafeString(message.createdAt) || index}:${toSafeString(message.text)}`,
            senderId: normalizeIdentity(message.senderId),
            senderLabel: toSafeString(message.senderName) || toSafeString(message.senderId) || "A peer",
            text: toSafeString(message.text),
            timestamp: toTimestamp(message.createdAt, fallbackTimestamp),
          }));

        const topLevelHelperMessage = toSafeString(request?.helperMessage);

        if (topLevelHelperMessage && requestHelper) {
          const alreadyMapped = normalizedMessages.some(
            (message) => message.senderId === requestHelper && message.text === topLevelHelperMessage
          );

          if (!alreadyMapped) {
            normalizedMessages.push({
              signature: `helper:${requestId}`,
              senderId: requestHelper,
              senderLabel: toSafeString(request?.helperId) || "Helper",
              text: topLevelHelperMessage,
              timestamp: fallbackTimestamp,
            });
          }
        }

        normalizedMessages
          .filter((message) => message.senderId && message.senderId !== normalizedIdentity)
          .forEach((message) => {
            const notificationId = `chat:${requestId}:${message.signature}`;

            notifications.push({
              id: notificationId,
              requestId,
              icon: "💬",
              message: `${message.senderLabel} in "${subject}": ${previewText(message.text)}`,
              timestamp: message.timestamp,
              read: Boolean(readMap[notificationId]),
            });
          });
      });

      return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [normalizedIdentity]
  );

  const mapProjectGroupNotifications = useCallback(
    (groups, requestsByGroup, readMap) => {
      const leaderGroups = (Array.isArray(groups) ? groups : []).filter((group) => {
        return normalizeIdentity(group?.leader) === normalizedIdentity;
      });

      const notifications = [];

      leaderGroups.forEach((group) => {
        const groupId = toSafeString(group?._id);

        if (!groupId) {
          return;
        }

        const requests = Array.isArray(requestsByGroup[groupId]) ? requestsByGroup[groupId] : [];

        requests
          .filter((request) => toSafeString(request?.status).toLowerCase() === "pending")
          .forEach((request) => {
            const timestamp = toTimestamp(
              request?.createdAt || request?.updatedAt,
              new Date().toISOString()
            );
            const notificationId = `group:${groupId}:${toSafeString(request?._id)}:${timestamp}`;
            const studentIdentity = toSafeString(request?.studentItNumber) || "A student";
            const groupName = toSafeString(group?.groupName) || "your group";

            notifications.push({
              id: notificationId,
              icon: "👥",
              message: `${studentIdentity} requested to join "${groupName}".`,
              timestamp,
              read: Boolean(readMap[notificationId]),
              targetPath: "/project-group-hub",
              navigationState: { activeTab: "pending-requests" },
            });
          });
      });

      return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [normalizedIdentity]
  );

  const mapSessionJoinNotifications = useCallback((notifications, readMap) => {
    const list = Array.isArray(notifications) ? notifications : [];

    const mapped = list.map((notification, index) => {
      const rawId =
        toSafeString(notification?.id) ||
        `${toSafeString(notification?.sessionId)}:${toSafeString(notification?.timestamp) || index}`;
      const id = `session:${rawId}`;
      const timestamp = toTimestamp(notification?.timestamp, new Date().toISOString());

      return {
        id,
        icon: toSafeString(notification?.icon) || "📚",
        message: toSafeString(notification?.message) || "A student joined your Kuppi session.",
        timestamp,
        read: Boolean(readMap[id]),
        targetPath: toSafeString(notification?.targetPath) || "/kuppi/browse-sessions",
      };
    });

    return mapped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const fetchHelpNotifications = useCallback(async () => {
    if (!user || !currentIdentity) {
      setHelpNotifications([]);
      return;
    }

    try {
      const readMap = getReadMap();
      const [helpResponse, groupsResponse, sessionResponse] = await Promise.all([
        axios
          .get(`${HELP_API_BASE}/inbox/${encodeURIComponent(currentIdentity)}`)
          .catch(() => ({ data: [] })),
        axios.get(`${GROUP_API_BASE}/groups`).catch(() => ({ data: { groups: [] } })),
        axios
          .get(`${SESSION_API_BASE}/notifications/${encodeURIComponent(currentIdentity)}`)
          .catch(() => ({ data: [] })),
      ]);

      const helpNotifications = mapHelpRequestsToNotifications(helpResponse.data, readMap);
      const groups = Array.isArray(groupsResponse.data?.groups) ? groupsResponse.data.groups : [];

      const leaderGroups = groups.filter((group) => {
        return normalizeIdentity(group?.leader) === normalizedIdentity;
      });

      let requestsByGroup = {};

      if (leaderGroups.length > 0) {
        const requestResponses = await Promise.all(
          leaderGroups.map((group) => {
            return axios
              .get(`${GROUP_API_BASE}/requests/group/${group._id}`, {
                params: { itNumber: currentIdentity },
              })
              .then((response) => ({
                groupId: toSafeString(group?._id),
                requests: Array.isArray(response.data?.requests) ? response.data.requests : [],
              }))
              .catch(() => ({
                groupId: toSafeString(group?._id),
                requests: [],
              }));
          })
        );

        requestsByGroup = requestResponses.reduce((accumulator, entry) => {
          if (entry.groupId) {
            accumulator[entry.groupId] = entry.requests;
          }

          return accumulator;
        }, {});
      }

      const projectGroupNotifications = mapProjectGroupNotifications(groups, requestsByGroup, readMap);
      const sessionJoinNotifications = mapSessionJoinNotifications(sessionResponse.data, readMap);

      const notifications = [
        ...helpNotifications,
        ...projectGroupNotifications,
        ...sessionJoinNotifications,
      ].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setHelpNotifications(notifications);
    } catch {
      setHelpNotifications([]);
    }
  }, [
    user,
    currentIdentity,
    normalizedIdentity,
    getReadMap,
    mapHelpRequestsToNotifications,
    mapProjectGroupNotifications,
    mapSessionJoinNotifications,
  ]);

  useEffect(() => {
    if (currentIdentity) {
      localStorage.setItem("userId", currentIdentity);
    }
  }, [currentIdentity]);

  useEffect(() => {
    fetchHelpNotifications();
  }, [fetchHelpNotifications]);

  useEffect(() => {
    if (!user || !currentIdentity) {
      return;
    }

    const interval = setInterval(fetchHelpNotifications, 5000);
    return () => clearInterval(interval);
  }, [user, currentIdentity, fetchHelpNotifications]);

  const unreadCount = helpNotifications.filter((notification) => !notification.read).length;

  const handleSignOut = async () => {
    await logout();
    setHelpNotifications([]);
    setIsNotificationsOpen(false);
    navigate("/", { replace: true });
  };

  const handleMarkAsRead = useCallback(
    (notificationId) => {
      setHelpNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );

      const readMap = getReadMap();
      readMap[notificationId] = true;
      saveReadMap(readMap);
    },
    [getReadMap, saveReadMap]
  );

  const handleNotificationItemClick = useCallback(
    (notification) => {
      handleMarkAsRead(notification.id);
      setIsNotificationsOpen(false);

      if (notification.requestId) {
        navigate(`/chat/${notification.requestId}`);
        return;
      }

      if (notification.targetPath) {
        if (notification.navigationState) {
          navigate(notification.targetPath, { state: notification.navigationState });
          return;
        }

        navigate(notification.targetPath);
      }
    },
    [handleMarkAsRead, navigate]
  );

  const toggleNotifications = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (nextOpen) {
      await fetchHelpNotifications();
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">🧠 BrainLink</div>
        <div className="subtitle">Faculty of Computing</div>
      </div>

      <nav className="global-nav" aria-label="Main navigation">
        <NavLink
          to="/project-group-hub"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Project Group
        </NavLink>
        <NavLink
          to="/kuppi/browse-sessions"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Kuppi Session
        </NavLink>
        <NavLink
          to="/help-request"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Help Request
        </NavLink>
        <NavLink
          to="/resources"
          className={({ isActive }) => `global-nav-link ${isActive ? "global-nav-link-active" : ""}`}
        >
          Resources
        </NavLink>
      </nav>

      <div className="header-right">
        <div className="auth-nav-actions">
          {user ? (
            <>
              <div className="notification-container">
                <button
                  type="button"
                  className={`notification-icon-btn ${isNotificationsOpen ? "is-open" : ""}`}
                  onClick={toggleNotifications}
                  aria-label="Open notifications"
                  aria-expanded={isNotificationsOpen}
                  title="Notifications"
                >
                  <span className="notification-icon" aria-hidden="true">
                    🔔
                  </span>
                  {unreadCount > 0 && (
                    <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </button>

                <NotificationPanel
                  notifications={helpNotifications}
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  onMarkAsRead={handleMarkAsRead}
                  onNotificationClick={handleNotificationItemClick}
                />
              </div>

              <NavLink
                to="/profile"
                className="profile-icon-link"
                aria-label="Open profile"
                title="Profile"
              >
                {initials || "U"}
              </NavLink>
              <button type="button" className="auth-nav-btn auth-nav-btn-secondary" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="auth-nav-btn auth-nav-btn-secondary">
                Sign In
              </NavLink>
              <NavLink to="/register" className="auth-nav-btn auth-nav-btn-primary">
                Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
