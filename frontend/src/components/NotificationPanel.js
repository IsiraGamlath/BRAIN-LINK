import React from "react";
import "./NotificationPanel.css";

function NotificationPanel({ notifications, isOpen, onClose, onMarkAsRead }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {isOpen && <div className="notification-overlay" onClick={onClose} />}

      <div className={`notification-panel ${isOpen ? "notification-panel-open" : ""}`}>
        <div className="notification-panel-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>

        <div className="notification-panel-content">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">🔔</div>
              <p>No notifications yet</p>
              <p className="notification-empty-hint">Join requests will appear here</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? "notification-unread" : ""}`}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-icon">👤</div>
                    <div className="notification-item-text">
                      <p className="notification-item-message">
                        <strong>{notification.studentName}</strong> requested to join{" "}
                        <strong>{notification.groupName}</strong>
                      </p>
                      <p className="notification-item-time">
                        {new Date(notification.timestamp).toLocaleDateString()}{" "}
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      className="notification-mark-read"
                      onClick={() => onMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notification-panel-footer">
          <button onClick={onClose} className="notification-footer-link">
            View all pending requests →
          </button>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
