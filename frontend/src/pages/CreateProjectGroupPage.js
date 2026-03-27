import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateProjectGroupPage.css";
import ProjectGroupRulesPanel from "../components/ProjectGroupRulesPanel";
import { isProfileComplete } from "../utils/profileHelpers";

const API_BASE = "http://localhost:5000/api";

const MODULE_OPTIONS = [
  "Data Structures",
  "Database Systems",
  "Object Oriented Programming",
  "Software Engineering",
  "Networking",
];

function CreateProjectGroupPage({ currentUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    moduleName: "",
    groupName: "",
    description: "",
    maxMembers: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const profileComplete = useMemo(() => isProfileComplete(currentUser), [currentUser]);

  const validateField = (name, value) => {
    const trimmedValue = String(value).trim();

    if (name === "moduleName") {
      if (!trimmedValue) return "Module Name is required";
      return "";
    }

    if (name === "groupName") {
      if (!trimmedValue) return "Group Name is required";
      if (trimmedValue.length < 3) return "Group Name must be at least 3 characters";
      return "";
    }

    if (name === "description") {
      if (!trimmedValue) return "Description is required";
      if (trimmedValue.length < 10) return "Description must be at least 10 characters";
      return "";
    }

    if (name === "maxMembers") {
      if (!trimmedValue) return "Maximum Members is required";
      const parsed = Number(trimmedValue);
      if (Number.isNaN(parsed) || parsed < 2 || parsed > 10) {
        return "Maximum members must be between 2 and 10";
      }
      return "";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });
    return newErrors;
  };

  const isFormValid = useMemo(() => {
    return Object.keys(formData).every((field) => !validateField(field, formData[field]));
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profileComplete) {
      setFormError("Complete your academic profile first using Edit Academic Profile.");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        moduleName: true,
        groupName: true,
        description: true,
        maxMembers: true,
      });
      return;
    }

    try {
      setLoading(true);
      setFormError("");
      await axios.post(`${API_BASE}/groups`, {
        ...formData,
        maxMembers: Number(formData.maxMembers),
        currentUser,
        itNumber: currentUser.itNumber,
      });

      navigate("/project-group-hub", {
        replace: true,
        state: {
          flashMessage: {
            type: "success",
            text: "Project group created successfully.",
          },
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to create project group.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <div className="create-page-header">
        <h1>Create Project Group</h1>
        <p>Build your group with clear structure and module-focused collaboration.</p>
      </div>

      {!profileComplete && (
        <div className="create-page-warning">
          Complete your academic profile before creating a project group. Use Edit Academic Profile in the header.
        </div>
      )}

      {formError && <div className="create-page-error">{formError}</div>}

      <div className="create-page-layout">
        <section className="create-page-form-card">
          <h2>Create Project Group Form</h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="create-page-field">
              <label htmlFor="moduleName">Module Name</label>
              <select
                id="moduleName"
                name="moduleName"
                value={formData.moduleName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.moduleName && touched.moduleName ? "has-error" : ""}
              >
                <option value="">Select Module</option>
                {MODULE_OPTIONS.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {moduleName}
                  </option>
                ))}
              </select>
              {errors.moduleName && touched.moduleName && (
                <p className="field-error">{errors.moduleName}</p>
              )}
            </div>

            <div className="create-page-field">
              <label htmlFor="groupName">Group Name</label>
              <input
                id="groupName"
                name="groupName"
                type="text"
                value={formData.groupName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., Algorithm Masters"
                className={errors.groupName && touched.groupName ? "has-error" : ""}
              />
              {errors.groupName && touched.groupName && (
                <p className="field-error">{errors.groupName}</p>
              )}
            </div>

            <div className="create-page-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                placeholder="Describe your group goals, strengths, and collaboration style"
                className={errors.description && touched.description ? "has-error" : ""}
              />
              {errors.description && touched.description && (
                <p className="field-error">{errors.description}</p>
              )}
            </div>

            <div className="create-page-grid">
              <div className="create-page-field">
                <label htmlFor="maxMembers">Maximum Members</label>
                <input
                  id="maxMembers"
                  name="maxMembers"
                  type="number"
                  min="2"
                  max="10"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="2 to 10"
                  className={errors.maxMembers && touched.maxMembers ? "has-error" : ""}
                />
                {errors.maxMembers && touched.maxMembers && (
                  <p className="field-error">{errors.maxMembers}</p>
                )}
              </div>

              <div className="create-page-field">
                <label>Specialization</label>
                <input type="text" value={currentUser.specialization} disabled className="readonly" />
              </div>
            </div>

            <div className="create-page-grid">
              <div className="create-page-field">
                <label>Batch</label>
                <input type="text" value={currentUser.batch} disabled className="readonly" />
              </div>
              <div className="create-page-field">
                <label>Semester</label>
                <input type="text" value={currentUser.semester} disabled className="readonly" />
              </div>
            </div>

            <div className="create-page-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate("/project-group-hub")}>
                Cancel
              </button>
              <button type="submit" disabled={loading || !isFormValid || !profileComplete} className="btn-primary">
                {loading ? "Creating..." : "Create Project Group"}
              </button>
            </div>
          </form>
        </section>

        <ProjectGroupRulesPanel />
      </div>
    </div>
  );
}

export default CreateProjectGroupPage;
