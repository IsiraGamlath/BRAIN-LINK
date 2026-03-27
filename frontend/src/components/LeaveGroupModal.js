import React, { useState } from "react";

const LeaveGroupModal = ({ group, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert("You have left the study group successfully!");
      setLoading(false);
      onClose();
    }, 500);
  };

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "40px",
      maxWidth: "420px",
      width: "90%",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e0e8f5",
      textAlign: "center",
    },
    icon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
    heading: {
      fontSize: "22px",
      fontWeight: "900",
      color: "#0f172a",
      marginBottom: "12px",
      letterSpacing: "-0.3px",
    },
    message: {
      fontSize: "14px",
      color: "#64748b",
      marginBottom: "8px",
      lineHeight: "1.6",
    },
    groupName: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#dc2626",
      marginBottom: "24px",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
    },
    button: {
      flex: 1,
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: "700",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    confirmButton: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
    },
    cancelButton: {
      backgroundColor: "#f8fafc",
      color: "#64748b",
      border: "1.5px solid #e0e8f5",
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.icon}>⚠️</div>
        <h2 style={styles.heading}>Leave Study Group?</h2>
        <p style={styles.message}>
          Are you sure you want to leave
        </p>
        <div style={styles.groupName}>{group.groupName}</div>

        <div style={styles.buttonGroup}>
          <button
            onClick={onClose}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#eff0f5";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f8fafc";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.confirmButton,
              ...(loading ? { backgroundColor: "#b91c1c", cursor: "not-allowed" } : {}),
            }}
            onMouseEnter={(e) =>
              !loading && (e.target.style.backgroundColor = "#991b1b")
            }
            onMouseLeave={(e) =>
              !loading && (e.target.style.backgroundColor = "#dc2626")
            }
          >
            {loading ? "Leaving..." : "Yes, Leave Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveGroupModal;
