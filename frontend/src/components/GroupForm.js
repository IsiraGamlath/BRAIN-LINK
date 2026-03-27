import React, { useState } from "react";
import axios from "axios";

const GroupForm = ({ onGroupCreated }) => {
  const [formData, setFormData] = useState({
    groupName: "",
    subject: "",
    description: "",
    batch: "",
    subgroup: "",
    leader: "",
    maxMembers: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateField = (name, value) => {
    const trimmedValue = String(value).trim();

    switch (name) {
      case "groupName":
        if (!trimmedValue) return "Group Name is required";
        if (trimmedValue.length < 3)
          return "Group Name must be at least 3 characters";
        return "";

      case "subject":
        if (!trimmedValue) return "Subject is required";
        if (trimmedValue.length < 2) return "Subject must be at least 2 characters";
        return "";

      case "description":
        if (!trimmedValue) return "Description is required";
        if (trimmedValue.length < 5)
          return "Description must be at least 5 characters";
        return "";

      case "batch":
        if (!trimmedValue) return "Batch is required";
        return "";

      case "subgroup":
        if (!trimmedValue) return "Subgroup is required";
        return "";

      case "leader":
        if (!trimmedValue) return "Leader is required";
        return "";

      case "maxMembers":
        if (!trimmedValue) return "Maximum Members is required";
        if (isNaN(trimmedValue) || parseInt(trimmedValue) <= 0) {
          return "Maximum Members must be a number greater than 0";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));
    const error = validateField(name, formData[name]);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        groupName: true,
        subject: true,
        description: true,
        batch: true,
        subgroup: true,
        leader: true,
        maxMembers: true,
      });
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/groups", {
        groupName: formData.groupName.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        batch: formData.batch.trim(),
        subgroup: formData.subgroup.trim(),
        leader: formData.leader.trim(),
        maxMembers: parseInt(formData.maxMembers),
      });

      if (response.data.success) {
        setSuccessMessage("Study group created successfully");
        setFormData({
          groupName: "",
          subject: "",
          description: "",
          batch: "",
          subgroup: "",
          leader: "",
          maxMembers: "",
        });
        setErrors({});
        setTouched({});
        if (onGroupCreated) {
          onGroupCreated();
        }
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error creating study group. Please try again.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "820px",
      margin: "0 auto 56px",
      backgroundColor: "#ffffff",
      borderRadius: "18px",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      border: "1px solid #dde5f0",
      padding: "52px",
      backdropFilter: "blur(12px)",
      transition: "all 0.4s ease",
    },
    heading: {
      fontSize: "32px",
      fontWeight: "900",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.6px",
    },
    subheading: {
      fontSize: "15px",
      color: "#64748b",
      marginBottom: "40px",
      fontWeight: "400",
      lineHeight: "1.6",
    },
    formGroup: {
      marginBottom: "28px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "10px",
      letterSpacing: "0.3px",
    },
    input: {
      width: "100%",
      padding: "13px 16px",
      fontSize: "15px",
      border: "1.5px solid #dde5f0",
      borderRadius: "10px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "all 0.3s ease",
      backgroundColor: "#ffffff",
      color: "#0f172a",
    },
    inputFocus: {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.02)",
      outline: "none",
    },
    inputError: {
      borderColor: "#dc2626",
      backgroundColor: "#fff5f5",
    },
    textarea: {
      width: "100%",
      padding: "13px 16px",
      fontSize: "15px",
      border: "1.5px solid #dde5f0",
      borderRadius: "10px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      minHeight: "130px",
      resize: "vertical",
      transition: "all 0.3s ease",
      backgroundColor: "#ffffff",
      color: "#0f172a",
      lineHeight: "1.5",
    },
    textareaFocus: {
      borderColor: "#4f46e5",
      boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.12), inset 0 1px 2px rgba(0, 0, 0, 0.02)",
      outline: "none",
    },
    textareaError: {
      borderColor: "#dc2626",
      backgroundColor: "#fff5f5",
    },
    errorText: {
      fontSize: "13px",
      color: "#dc2626",
      marginTop: "8px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    button: {
      width: "100%",
      padding: "14px 24px",
      fontSize: "16px",
      fontWeight: "800",
      color: "#ffffff",
      backgroundColor: "#4f46e5",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "16px",
      letterSpacing: "0.3px",
      boxShadow: "0 6px 20px rgba(79, 70, 229, 0.25)",
    },
    buttonHover: {
      backgroundColor: "#4338ca",
      boxShadow: "0 10px 32px rgba(79, 70, 229, 0.38)",
      transform: "translateY(-2px)",
    },
    buttonDisabled: {
      backgroundColor: "#cbd5e1",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    successAlert: {
      padding: "14px 16px",
      backgroundColor: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #86efac",
      borderRadius: "10px",
      marginBottom: "28px",
      fontSize: "14px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      animation: "slideInDown 0.3s ease",
    },
    errorAlert: {
      padding: "14px 16px",
      backgroundColor: "#fff5f5",
      color: "#7f1d1d",
      border: "1px solid #fca5a5",
      borderRadius: "10px",
      marginBottom: "28px",
      fontSize: "14px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      animation: "slideInDown 0.3s ease",
    },
    formRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    formRowFull: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Study Group</h2>
      <p style={styles.subheading}>
        Set up a collaborative study group in minutes
      </p>

      {successMessage && (
        <div style={styles.successAlert}>
          <span>✓</span>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={styles.errorAlert}>
          <span>!</span>
          {errorMessage}
        </div>
      )}

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        input:focus, textarea:focus {
          outline: none;
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Group Name</label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.groupName &&
                Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.groupName) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.groupName && touched.groupName
                  ? styles.inputError
                  : {}),
              }}
              placeholder="e.g., Advanced Calculus Study"
            />
            {errors.groupName && touched.groupName && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.groupName}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.subject && Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.subject) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.subject && touched.subject ? styles.inputError : {}),
              }}
              placeholder="e.g., Mathematics"
            />
            {errors.subject && touched.subject && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.subject}
              </div>
            )}
          </div>
        </div>

        <div style={styles.formRowFull}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.description &&
                Object.assign(e.target.style, styles.textareaFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.description) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.textarea,
                ...(errors.description && touched.description
                  ? styles.textareaError
                  : {}),
              }}
              placeholder="Describe the study group's goals and focus areas..."
            />
            {errors.description && touched.description && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.description}
              </div>
            )}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Batch</label>
            <input
              type="text"
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.batch && Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.batch) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.batch && touched.batch ? styles.inputError : {}),
              }}
              placeholder="e.g., 2024-2025"
            />
            {errors.batch && touched.batch && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.batch}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Subgroup</label>
            <input
              type="text"
              name="subgroup"
              value={formData.subgroup}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.subgroup &&
                Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.subgroup) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.subgroup && touched.subgroup
                  ? styles.inputError
                  : {}),
              }}
              placeholder="e.g., Group A"
            />
            {errors.subgroup && touched.subgroup && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.subgroup}
              </div>
            )}
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Leader</label>
            <input
              type="text"
              name="leader"
              value={formData.leader}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.leader && Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.leader) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.leader && touched.leader ? styles.inputError : {}),
              }}
              placeholder="Enter leader name"
            />
            {errors.leader && touched.leader && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.leader}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Maximum Members</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={(e) =>
                !errors.maxMembers &&
                Object.assign(e.target.style, styles.inputFocus)
              }
              onBlurCapture={(e) => {
                if (!errors.maxMembers) {
                  e.target.style.borderColor = "#dde5f0";
                  e.target.style.boxShadow = "none";
                }
              }}
              style={{
                ...styles.input,
                ...(errors.maxMembers && touched.maxMembers
                  ? styles.inputError
                  : {}),
              }}
              placeholder="e.g., 8"
              min="1"
            />
            {errors.maxMembers && touched.maxMembers && (
              <div style={styles.errorText}>
                <span>✕</span>
                {errors.maxMembers}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          onMouseEnter={(e) =>
            !loading && Object.assign(e.target.style, styles.buttonHover)
          }
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#4f46e5";
              e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.25)";
              e.target.style.transform = "translateY(0)";
            }
          }}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
};

export default GroupForm;
