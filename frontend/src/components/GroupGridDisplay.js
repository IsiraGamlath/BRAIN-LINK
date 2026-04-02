import React, { useState } from "react";
import JoinGroupModal from "./JoinGroupModal";
import LeaveGroupModal from "./LeaveGroupModal";

const GroupGridDisplay = ({ groups, loading, currentUser }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalType, setModalType] = useState(null); // "join" or "leave"
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleJoinClick = (group) => {
    setSelectedGroup(group);
    setModalType("join");
  };

  const handleLeaveClick = (group) => {
    setSelectedGroup(group);
    setModalType("leave");
  };

  const handleModalClose = () => {
    setSelectedGroup(null);
    setModalType(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "16px", color: "#64748b" }}>Loading study groups...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "18px", color: "#64748b", fontWeight: "600" }}>
          No study groups found
        </div>
        <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "8px" }}>
          Try adjusting your filters or create a new group
        </div>
      </div>
    );
  }

  const styles = {
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
      gap: "24px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: "24px",
      border: "1px solid #e0e8f5",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
    },
    cardHover: {
      borderColor: "#c7d2fe",
      boxShadow: "0 12px 32px rgba(79, 70, 229, 0.12)",
      transform: "translateY(-4px)",
    },
    header: {
      marginBottom: "16px",
      paddingBottom: "16px",
      borderBottom: "1px solid #e0e8f5",
    },
    moduleName: {
      fontSize: "12px",
      fontWeight: "700",
      color: "#4f46e5",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
      marginBottom: "4px",
    },
    groupName: {
      fontSize: "18px",
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: "6px",
      lineHeight: "1.3",
    },
    statusBadge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: "0.2px",
    },
    statusOpen: {
      backgroundColor: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #86efac",
    },
    statusFull: {
      backgroundColor: "#fff5f5",
      color: "#7f1d1d",
      border: "1px solid #fca5a5",
    },
    description: {
      fontSize: "14px",
      color: "#475569",
      marginBottom: "14px",
      lineHeight: "1.6",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "14px",
      paddingBottom: "14px",
      borderBottom: "1px solid #e0e8f5",
    },
    infoItem: {
      fontSize: "12px",
    },
    infoLabel: {
      fontWeight: "700",
      color: "#94a3b8",
      marginBottom: "2px",
      textTransform: "uppercase",
      letterSpacing: "0.2px",
    },
    infoValue: {
      fontWeight: "600",
      color: "#1e293b",
    },
    memberInfo: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "12px",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    button: {
      padding: "10px 14px",
      fontSize: "12px",
      fontWeight: "700",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      flex: "1 1 auto",
      minWidth: "80px",
    },
    joinButton: {
      backgroundColor: "#4f46e5",
      color: "#ffffff",
      boxShadow: "0 2px 8px rgba(79, 70, 229, 0.15)",
    },
    joinButtonHover: {
      backgroundColor: "#4338ca",
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
    },
    leaveButton: {
      backgroundColor: "#ffffff",
      color: "#f97316",
      border: "1.5px solid #f97316",
    },
    leaveButtonHover: {
      backgroundColor: "#f97316",
      color: "#ffffff",
    },
    openButton: {
      backgroundColor: "#ffffff",
      color: "#64748b",
      border: "1.5px solid #cbd5e1",
    },
    openButtonHover: {
      backgroundColor: "#f8fafc",
      borderColor: "#94a3b8",
    },
  };

  return (
    <>
      <div style={styles.grid}>
        {groups.map((group, index) => {
          const isMember = group.members.some((m) => m.itNumber === currentUser.itNumber);
          const isLeader = group.leader === currentUser.itNumber;

          return (
            <div
              key={group._id}
              style={{
                ...styles.card,
                ...(hoveredCard === index ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Header */}
              <div style={styles.header}>
                <div style={styles.moduleName}>{group.moduleName}</div>
                <div style={styles.groupName}>{group.groupName}</div>
                <div
                  style={{
                    ...styles.statusBadge,
                    ...(group.status === "Open" ? styles.statusOpen : styles.statusFull),
                  }}
                >
                  {group.status}
                </div>
              </div>

              {/* Description */}
              <div style={styles.description}>{group.description}</div>

              {/* Info Grid */}
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Leader</div>
                  <div style={styles.infoValue}>{group.leader}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Study Type</div>
                  <div style={styles.infoValue}>{group.studyType}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Batch</div>
                  <div style={styles.infoValue}>{group.batch}</div>
                </div>
                <div style={styles.infoItem}>
                  <div style={styles.infoLabel}>Subgroup</div>
                  <div style={styles.infoValue}>{group.subgroup}</div>
                </div>
              </div>

              {/* Members Info */}
              <div style={styles.memberInfo}>
                👥 {group.members.length} / {group.maxMembers} Members
              </div>

              {/* Actions */}
              <div style={styles.buttonGroup}>
                {!isMember && !isLeader && (
                  <>
                    <button
                      onClick={() => handleJoinClick(group)}
                      disabled={group.status === "Full"}
                      style={{
                        ...styles.button,
                        ...styles.joinButton,
                        ...(group.status === "Full"
                          ? {
                              backgroundColor: "#cbd5e1",
                              cursor: "not-allowed",
                              boxShadow: "none",
                            }
                          : {}),
                      }}
                      onMouseEnter={(e) =>
                        group.status !== "Full" &&
                        Object.assign(e.target.style, styles.joinButtonHover)
                      }
                      onMouseLeave={(e) => {
                        if (group.status !== "Full") {
                          e.target.style.backgroundColor = "#4f46e5";
                          e.target.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.15)";
                        }
                      }}
                    >
                      {group.status === "Full" ? "Full" : "Join"}
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.openButton }}
                      onMouseEnter={(e) => Object.assign(e.target.style, styles.openButtonHover)}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                    >
                      Open
                    </button>
                  </>
                )}

                {isMember && !isLeader && (
                  <>
                    <button
                      onClick={() => handleLeaveClick(group)}
                      style={{ ...styles.button, ...styles.leaveButton }}
                      onMouseEnter={(e) =>
                        Object.assign(e.target.style, styles.leaveButtonHover)
                      }
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.color = "#f97316";
                      }}
                    >
                      Leave
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.openButton }}
                      onMouseEnter={(e) => Object.assign(e.target.style, styles.openButtonHover)}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                    >
                      Manage
                    </button>
                  </>
                )}

                {isLeader && (
                  <>
                    <button
                      style={{ ...styles.button, ...styles.openButton }}
                      onMouseEnter={(e) => Object.assign(e.target.style, styles.openButtonHover)}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.borderColor = "#cbd5e1";
                      }}
                    >
                      Manage
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {modalType === "join" && selectedGroup && (
        <JoinGroupModal group={selectedGroup} currentUser={currentUser} onClose={handleModalClose} />
      )}
      {modalType === "leave" && selectedGroup && (
        <LeaveGroupModal group={selectedGroup} onClose={handleModalClose} />
      )}
    </>
  );
};

export default GroupGridDisplay;
