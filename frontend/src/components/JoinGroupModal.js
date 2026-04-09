import React, { useState } from "react";

const JoinGroupModal = ({ group, currentUser, onClose }) => {
  const [formData, setFormData] = useState({
    gpa: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert("Join request submitted successfully!");
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
      maxWidth: "500px",
      width: "90%",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e0e8f5",
    },
    heading: {
      fontSize: "24px",
      fontWeight: "900",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.3px",
    },
    subheading: {
      fontSize: "14px",
      color: "#64748b",
      marginBottom: "24px",
    },
    groupInfo: {
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      padding: "12px",
      marginBottom: "24px",
      borderLeft: "3px solid #4f46e5",
    },
    groupName: {
      fontSize: "14px",
      fontWeight: "700",
      color: "#1e293b",
    },
    groupModule: {
      fontSize: "12px",
      color: "#64748b",
      marginTop: "4px",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: "1.5px solid #e0e8f5",
      borderRadius: "8px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "all 0.2s ease",
      backgroundColor: "#ffffff",
      color: "#0f172a",
    },
    textarea: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: "1.5px solid #e0e8f5",
      borderRadius: "8px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      minHeight: "80px",
      resize: "vertical",
      color: "#0f172a",
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "24px",
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
    submitButton: {
      backgroundColor: "#4f46e5",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
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
        <h2 style={styles.heading}>Join Study Group</h2>
        <p style={styles.subheading}>
          Submit your request to join {group.groupName}
        </p>

        {/* Group Info */}
        <div style={styles.groupInfo}>
          <div style={styles.groupName}>{group.groupName}</div>
          <div style={styles.groupModule}>{group.moduleName}</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* IT Number (Read-only) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>IT Number</label>
            <input
              type="text"
              value={currentUser.itNumber}
              disabled
              style={{
                ...styles.input,
                backgroundColor: "#f8fafc",
                color: "#64748b",
              }}
            />
          </div>

          {/* GPA */}
          <div style={styles.formGroup}>
            <label style={styles.label}>GPA (Optional)</label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              placeholder="e.g., 3.8"
              min="0"
              max="4"
              step="0.01"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = "#4f46e5";
                e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e8f5";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Message */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell the group leader why you want to join..."
              style={styles.textarea}
              onFocus={(e) => {
                e.target.style.borderColor = "#4f46e5";
                e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e8f5";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
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
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.submitButton,
                ...(loading ? { backgroundColor: "#cbd5e1", cursor: "not-allowed" } : {}),
              }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.backgroundColor = "#4338ca")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.backgroundColor = "#4f46e5")
              }
            >
              {loading ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
