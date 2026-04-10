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
    <form className="bg-white border-2 border-blue-100 rounded-2xl shadow-brand p-6 mb-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-brand mb-4">
        {submitLabel === 'Update Session' ? 'Edit Session' : 'Create New Session'}
      </h2>

      <div className="mb-4">
        <label className="label block mb-2">Subject</label>
        <input
          className="input-field"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label block mb-2">Date</label>
          <input
            type="date"
            min={today}
            className="input-field"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label block mb-2">Start Time</label>
          <input
            type="time"
            className="input-field"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label block mb-2">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            className="input-field"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="label block mb-2">Mode</label>
          <select className="input-field" name="mode" value={formData.mode} onChange={handleChange} required>
            <option value="Online">Online</option>
            <option value="Physical">Physical</option>
          </select>
        </div>
      </div>

      {formData.mode === 'Online' ? (
        <div className="mb-4">
          <label className="label block mb-2">Meeting Link</label>
          <input
            className="input-field"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            required
          />
        </div>
      ) : null}

      {formData.mode === 'Physical' ? (
        <div className="mb-4">
          <label className="label block mb-2">Location</label>
          <input className="input-field" name="location" value={formData.location} onChange={handleChange} required />
        </div>
      ) : null}

      <div className="mb-4">
        <label className="label block mb-2">Student ID</label>
        <input
          className="input-field"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="Leave blank to use your logged-in account ID"
        />
      </div>

      {initialValues?.status ? (
        <div className="mb-4">
          <label className="label block mb-2">Status</label>
          <select className="input-field" name="status" value={formData.status} onChange={handleChange}>
            <option value="Booked">Booked</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      ) : null}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex-1 py-2" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" className="btn-outline flex-1 py-2" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default SessionForm;
