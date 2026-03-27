import React, { useState } from "react";
import "./CreateGroupForm.css";

const CreateGroupForm = ({ currentUser, onGroupCreated, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    moduleName: "",
    groupName: "",
    description: "",
    maxMembers: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const trimmedValue = String(value).trim();

    switch (name) {
      case "moduleName":
        if (!trimmedValue) return "Module Name is required";
        return "";
      case "groupName":
        if (!trimmedValue) return "Group Name is required";
        if (trimmedValue.length < 3) return "Group Name must be at least 3 characters";
        return "";
      case "description":
        if (!trimmedValue) return "Description is required";
        if (trimmedValue.length < 5) return "Description must be at least 5 characters";
        return "";
      case "maxMembers": {
        if (!trimmedValue) return "Maximum Members is required";
        const num = parseInt(trimmedValue, 10);
        if (isNaN(num) || num < 2 || num > 10) {
          return "Maximum members must be between 2 and 10";
        }
        return "";
      }
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
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, formData[name]) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        moduleName: true,
        groupName: true,
        description: true,
        maxMembers: true,
      });
      return;
    }

    onGroupCreated({
      moduleName: formData.moduleName,
      groupName: formData.groupName,
      description: formData.description,
      maxMembers: parseInt(formData.maxMembers, 10),
    });
  };

  return (
    <div className="create-group-container">
      <h3 className="create-group-heading">Create New Study Group</h3>

      <form onSubmit={handleSubmit}>
        <div className="create-group-grid">
          <div>
            <label className="create-group-label">Module Name *</label>
            <select
              name="moduleName"
              value={formData.moduleName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`create-group-input create-group-select ${
                errors.moduleName && touched.moduleName ? "create-group-error" : ""
              }`}
            >
              <option value="">Select Module</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Database Systems">Database Systems</option>
              <option value="Object Oriented Programming">Object Oriented Programming</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Networking">Networking</option>
            </select>
            {errors.moduleName && touched.moduleName && (
              <div className="create-group-error-text">{errors.moduleName}</div>
            )}
          </div>

          <div>
            <label className="create-group-label">Group Name *</label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Advanced Algorithms"
              className={`create-group-input ${
                errors.groupName && touched.groupName ? "create-group-error" : ""
              }`}
            />
            {errors.groupName && touched.groupName && (
              <div className="create-group-error-text">{errors.groupName}</div>
            )}
          </div>
        </div>

        <div className="create-group-grid-full">
          <div>
            <label className="create-group-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe the group's focus and goals..."
              className={`create-group-textarea ${
                errors.description && touched.description ? "create-group-error" : ""
              }`}
            />
            {errors.description && touched.description && (
              <div className="create-group-error-text">{errors.description}</div>
            )}
          </div>
        </div>

        <div className="create-group-grid">
          <div>
            <label className="create-group-label">Maximum Members *</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="2-10"
              min="2"
              max="10"
              className={`create-group-input ${
                errors.maxMembers && touched.maxMembers ? "create-group-error" : ""
              }`}
            />
            {errors.maxMembers && touched.maxMembers && (
              <div className="create-group-error-text">{errors.maxMembers}</div>
            )}
          </div>

          <div>
            <label className="create-group-label">Specialization</label>
            <input
              type="text"
              value={currentUser.specialization}
              disabled
              className="create-group-input create-group-readonly"
            />
          </div>
        </div>

        <div className="create-group-grid">
          <div>
            <label className="create-group-label">Batch</label>
            <input
              type="text"
              value={currentUser.batch}
              disabled
              className="create-group-input create-group-readonly"
            />
          </div>
          <div>
            <label className="create-group-label">Study Type</label>
            <input
              type="text"
              value={currentUser.studyType}
              disabled
              className="create-group-input create-group-readonly"
            />
          </div>
        </div>

        <div className="create-group-button-group">
          <button type="button" onClick={onCancel} className="create-group-btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`create-group-btn-primary ${loading ? "create-group-btn-disabled" : ""}`}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroupForm;
