import React, { useState, useEffect } from "react";
import axios from "axios";
import GroupCard from "./GroupCard";

const GroupList = ({ refreshGroups }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/groups");
      if (response.data.success) {
        setGroups(response.data.groups);
      }
    } catch (err) {
      setError("Failed to fetch study groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [refreshGroups]);

  const handleGroupUpdated = () => {
    fetchGroups();
  };

  const styles = {
    container: {
      maxWidth: "1280px",
      margin: "0 auto",
    },
    sectionHeader: {
      marginBottom: "36px",
    },
    sectionTitle: {
      fontSize: "28px",
      fontWeight: "900",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.6px",
    },
    sectionSubtitle: {
      fontSize: "15px",
      color: "#64748b",
      fontWeight: "400",
      lineHeight: "1.6",
    },
    loadingContainer: {
      textAlign: "center",
      padding: "100px 20px",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "52px",
      height: "52px",
      border: "3px solid #dde5f0",
      borderTop: "3px solid #4f46e5",
      borderRadius: "50%",
      animation: "spinPremium 1s linear infinite",
      marginBottom: "24px",
    },
    loadingText: {
      fontSize: "16px",
      color: "#64748b",
      fontWeight: "500",
    },
    errorContainer: {
      backgroundColor: "#fff5f5",
      border: "1.5px solid #fca5a5",
      borderRadius: "14px",
      padding: "24px",
      color: "#7f1d1d",
      fontSize: "15px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    emptyStateContainer: {
      textAlign: "center",
      padding: "120px 20px",
    },
    emptyStateIcon: {
      fontSize: "84px",
      marginBottom: "24px",
      opacity: 0.9,
    },
    emptyStateText: {
      fontSize: "26px",
      color: "#0f172a",
      fontWeight: "900",
      marginBottom: "12px",
      letterSpacing: "-0.4px",
    },
    emptyStateSubtext: {
      fontSize: "15px",
      color: "#64748b",
      lineHeight: "1.8",
      maxWidth: "500px",
      margin: "0 auto",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
      gap: "28px",
    },
  };

  const keyframes = `
    @keyframes spinPremium {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <style>{keyframes}</style>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Loading study groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <span>⚠</span>
          {error}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyStateContainer}>
          <div style={styles.emptyStateIcon}>📚</div>
          <div style={styles.emptyStateText}>No Study Groups Yet</div>
          <div style={styles.emptyStateSubtext}>
            Start creating your first study group to bring students together for collaborative learning
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Available Study Groups</h2>
        <p style={styles.sectionSubtitle}>
          {groups.length} {groups.length === 1 ? "group" : "groups"} available for joining
        </p>
      </div>
      <div style={styles.gridContainer}>
        {groups.map((group, index) => (
          <div
            key={group._id}
            style={{
              animation: `fadeIn 0.5s ease forwards`,
              animationDelay: `${index * 0.05}s`,
            }}
          >
            <GroupCard
              group={group}
              onGroupUpdated={handleGroupUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
