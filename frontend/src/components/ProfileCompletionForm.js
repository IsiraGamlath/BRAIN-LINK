import React, { useState } from "react";
import "./ProfileCompletionForm.css";

const ProfileCompletionForm = ({ onProfileComplete }) => {
  const [formData, setFormData] = useState({
    batch: "",
    semester: "",
    studyType: "",
    subgroup: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batch || formData.batch.trim() === "") {
      newErrors.batch = "Batch is required";
    }

    if (!formData.semester || formData.semester.trim() === "") {
      newErrors.semester = "Semester is required";
    }

    if (!formData.studyType) {
      newErrors.studyType = "Study Type is required";
    }

    if (!formData.subgroup) {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      onProfileComplete({
        batch: formData.batch.trim(),
        semester: formData.semester.trim(),
        studyType: formData.studyType,
        subgroup: formData.subgroup,
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="profile-completion-container">
      <h1 className="profile-completion-heading">Complete Your Academic Profile</h1>
      <p className="profile-completion-subheading">
        Fill in your academic details to access the Project Group Hub
      </p>

      <form onSubmit={handleSubmit}>
        {/* Batch */}
        <div className="profile-form-group">
          <label className="profile-form-label">Batch *</label>
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            placeholder="e.g., 128, 129"
            className={`profile-form-input ${errors.batch ? "profile-input-error" : ""}`}
          />
          {errors.batch && <div className="profile-error-text">{errors.batch}</div>}
        </div>

        {/* Semester */}
        <div className="profile-form-group">
          <label className="profile-form-label">Semester *</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className={`profile-form-input ${errors.semester ? "profile-input-error" : ""}`}
          >
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          {errors.semester && <div className="profile-error-text">{errors.semester}</div>}
        </div>

        {/* Study Type */}
        <div className="profile-form-group">
          <label className="profile-form-label">Study Type *</label>
          <select
            name="studyType"
            value={formData.studyType}
            onChange={handleChange}
            className={`profile-form-input ${errors.studyType ? "profile-input-error" : ""}`}
          >
            <option value="">Select Study Type</option>
            <option value="Weekday">Weekday</option>
            <option value="Weekend">Weekend</option>
          </select>
          {errors.studyType && <div className="profile-error-text">{errors.studyType}</div>}
        </div>

        {/* Subgroup */}
        <div className="profile-form-group">
          <label className="profile-form-label">Subgroup *</label>
          <select
            name="subgroup"
            value={formData.subgroup}
            onChange={handleChange}
            className={`profile-form-input ${errors.subgroup ? "profile-input-error" : ""}`}
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
          {errors.subgroup && <div className="profile-error-text">{errors.subgroup}</div>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`profile-btn-primary ${loading ? "profile-btn-disabled" : ""}`}
        >
          {loading ? "Saving..." : "Save and Continue"}
        </button>
      </form>
    </div>
  );
};

export default ProfileCompletionForm;
