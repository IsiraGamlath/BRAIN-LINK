import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AcademicProfileModal.css";

const API_BASE = "http://localhost:5000/api";

const AcademicProfileModal = ({
  isOpen,
  currentUser,
  onClose,
  onProfileSaved,
}) => {
  const [formData, setFormData] = useState({
    batch: currentUser?.batch || "",
    semester: currentUser?.semester || "",
    studyType: currentUser?.studyType || "",
    subgroup: currentUser?.subgroup || "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Reinitialize form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        batch: currentUser.batch || "",
        semester: currentUser.semester || "",
        studyType: currentUser.studyType || "",
        subgroup: currentUser.subgroup || "",
      });
      setErrors({});
      setSaveError("");
    }
  }, [currentUser, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batch || formData.batch.trim() === "") {
      newErrors.batch = "Batch is required";
    }

    if (!formData.semester || formData.semester.trim() === "") {
      newErrors.semester = "Semester is required";
    }

    if (!formData.studyType || formData.studyType.trim() === "") {
      newErrors.studyType = "Study Type is required";
    }

    if (!formData.subgroup || formData.subgroup.trim() === "") {
      newErrors.subgroup = "Subgroup is required";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setSaveError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSaveError("");

    try {
      const payload = {
        itNumber: currentUser.itNumber,
        specialization: currentUser.specialization,
        batch: formData.batch.trim(),
        semester: formData.semester.trim(),
        studyType: formData.studyType.trim(),
        subgroup: formData.subgroup.trim(),
      };

      await axios.patch(`${API_BASE}/profile`, payload);

      // Call the callback with updated profile data
      onProfileSaved({
        ...currentUser,
        ...payload,
      });

      // Close modal after successful save
      onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to save academic profile";
      setSaveError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2 className="profile-modal-title">Edit Academic Profile</h2>
          <button
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="profile-modal-body">
          {saveError && (
            <div className="profile-modal-error-banner">
              <span>⚠️</span> {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* IT Number - Read Only */}
            <div className="profile-form-group">
              <label className="profile-form-label">IT Number</label>
              <input
                type="text"
                value={currentUser?.itNumber || ""}
                disabled
                className="profile-form-input profile-input-readonly"
              />
            </div>

            {/* Specialization - Read Only */}
            <div className="profile-form-group">
              <label className="profile-form-label">Specialization</label>
              <input
                type="text"
                value={currentUser?.specialization || ""}
                disabled
                className="profile-form-input profile-input-readonly"
              />
            </div>

            {/* Batch */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Batch <span className="required">*</span>
              </label>
              <input
                type="text"
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                placeholder="e.g., 128, 129"
                className={`profile-form-input ${
                  errors.batch ? "profile-input-error" : ""
                }`}
              />
              {errors.batch && (
                <div className="profile-error-text">{errors.batch}</div>
              )}
            </div>

            {/* Semester */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Semester <span className="required">*</span>
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className={`profile-form-input ${
                  errors.semester ? "profile-input-error" : ""
                }`}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
              {errors.semester && (
                <div className="profile-error-text">{errors.semester}</div>
              )}
            </div>

            {/* Study Type */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Study Type <span className="required">*</span>
              </label>
              <select
                name="studyType"
                value={formData.studyType}
                onChange={handleChange}
                className={`profile-form-input ${
                  errors.studyType ? "profile-input-error" : ""
                }`}
              >
                <option value="">Select Study Type</option>
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
              {errors.studyType && (
                <div className="profile-error-text">{errors.studyType}</div>
              )}
            </div>

            {/* Subgroup */}
            <div className="profile-form-group">
              <label className="profile-form-label">
                Subgroup <span className="required">*</span>
              </label>
              <select
                name="subgroup"
                value={formData.subgroup}
                onChange={handleChange}
                className={`profile-form-input ${
                  errors.subgroup ? "profile-input-error" : ""
                }`}
              >
                <option value="">Select Subgroup</option>
                <option value="1.1">1.1</option>
                <option value="1.2">1.2</option>
                <option value="2.1">2.1</option>
                <option value="2.2">2.2</option>
                <option value="3.1">3.1</option>
                <option value="3.2">3.2</option>
                <option value="4.1">4.1</option>
                <option value="4.2">4.2</option>
                <option value="5.1">5.1</option>
                <option value="5.2">5.2</option>
                <option value="6.1">6.1</option>
                <option value="6.2">6.2</option>
              </select>
              {errors.subgroup && (
                <div className="profile-error-text">{errors.subgroup}</div>
              )}
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`profile-btn-primary ${
                  loading ? "profile-btn-disabled" : ""
                }`}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcademicProfileModal;
