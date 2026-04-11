import React, { useEffect, useState } from 'react';

const initialState = {
  subject: '',
  date: '',
  startTime: '',
  duration: 60,
  mode: 'Online',
  location: '',
  meetingLink: '',
  studentId: '',
  status: 'Booked',
};

function SessionForm({ initialValues, onSubmit, onCancel, isSubmitting, submitLabel }) {
  const [formData, setFormData] = useState(initialState);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        subject: initialValues.subject || '',
        date: initialValues.date ? new Date(initialValues.date).toISOString().slice(0, 10) : '',
        startTime: initialValues.startTime || '',
        duration: initialValues.duration || 60,
        mode: initialValues.mode || 'Online',
        location: initialValues.location || '',
        meetingLink: initialValues.meetingLink || '',
        studentId: initialValues.studentId || '',
        status: initialValues.status || 'Booked',
      });
    } else {
      setFormData(initialState);
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form className="kuppi-fresh-form" onSubmit={handleSubmit}>
      <h2 className="kuppi-fresh-form-title">
        {submitLabel === 'Update Session' ? 'Edit Session' : 'Create New Session'}
      </h2>

      <div className="kuppi-fresh-field">
        <label className="kuppi-fresh-label">Subject</label>
        <input
          className="kuppi-fresh-input"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="kuppi-fresh-form-grid">
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Date</label>
          <input
            type="date"
            min={today}
            className="kuppi-fresh-input"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Start Time</label>
          <input
            type="time"
            className="kuppi-fresh-input"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="kuppi-fresh-form-grid">
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            className="kuppi-fresh-input"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Mode</label>
          <select className="kuppi-fresh-input" name="mode" value={formData.mode} onChange={handleChange} required>
            <option value="Online">Online</option>
            <option value="Physical">Physical</option>
          </select>
        </div>
      </div>

      {formData.mode === 'Online' ? (
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Meeting Link</label>
          <input
            className="kuppi-fresh-input"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            required
          />
        </div>
      ) : null}

      {formData.mode === 'Physical' ? (
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Location</label>
          <input
            className="kuppi-fresh-input"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
      ) : null}

      <div className="kuppi-fresh-field">
        <label className="kuppi-fresh-label">Student ID</label>
        <input
          className="kuppi-fresh-input"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="Leave blank to use your logged-in account ID"
        />
      </div>

      {initialValues?.status ? (
        <div className="kuppi-fresh-field">
          <label className="kuppi-fresh-label">Status</label>
          <select className="kuppi-fresh-input" name="status" value={formData.status} onChange={handleChange}>
            <option value="Booked">Booked</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      ) : null}

      <div className="kuppi-fresh-form-actions">
        <button type="submit" className="kuppi-fresh-primary-btn kuppi-fresh-btn-sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          className="kuppi-fresh-ghost-btn kuppi-fresh-btn-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default SessionForm;
