import React from "react";

const ProfileTags = ({ user }) => {
  const styles = {
    container: {
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
      padding: "16px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      border: "1px solid #e0e8f5",
    },
    tag: {
      display: "inline-block",
      padding: "8px 14px",
      backgroundColor: "#f1f5ff",
      border: "1px solid #c7d2fe",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: "700",
      color: "#4f46e5",
      letterSpacing: "0.2px",
    },
    label: {
      display: "inline-block",
      fontSize: "12px",
      fontWeight: "800",
      color: "#64748b",
      marginRight: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.tag}>
        <span style={styles.label}>Specialization:</span>
        {user.specialization}
      </div>
      <div style={styles.tag}>
        <span style={styles.label}>Batch:</span>
        {user.batch}
      </div>
      <div style={styles.tag}>
        <span style={styles.label}>Subgroup:</span>
        {user.subgroup}
      </div>
      <div style={styles.tag}>
        <span style={styles.label}>Study Type:</span>
        {user.studyType}
      </div>
    </div>
  );
};

export default ProfileTags;
