import React, { useCallback, useEffect, useState } from 'react';
import SessionCard from './SessionCard';
import SessionForm from './SessionForm';
import '../KuppiSessions.css';
import {
  createSession,
  deleteSession,
  fetchPastSessions,
  fetchUpcomingSessions,
  getCurrentUserId,
  updateSession
} from '../api/sessionApi';

function Dashboard() {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const extractErrorMessage = (error, fallback) => {
    const apiErrors = error.response?.data?.errors;
    if (Array.isArray(apiErrors) && apiErrors.length > 0) {
      return apiErrors.join(' | ');
    }
    return error.response?.data?.message || fallback;
  };

  const currentUserId = getCurrentUserId();

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const [upcoming, past] = await Promise.all([fetchUpcomingSessions(), fetchPastSessions()]);
      setUpcomingSessions(upcoming);
      setPastSessions(past);
    } catch (error) {
      const errorText = extractErrorMessage(error, 'Failed to load sessions');
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!selectedSession?._id) {
      return;
    }

    const refreshedSession = [...upcomingSessions, ...pastSessions].find(
      (session) => session._id === selectedSession._id
    );

    if (refreshedSession) {
      setSelectedSession(refreshedSession);
    }
  }, [upcomingSessions, pastSessions, selectedSession?._id]);

  const closeForm = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingSession) {
        await updateSession(editingSession._id, formData, editingSession);
        setMessage({ type: 'success', text: 'Session updated successfully' });
      } else {
        await createSession(formData);
        setMessage({ type: 'success', text: 'Session created successfully' });
      }

      closeForm();
      await loadSessions();
    } catch (error) {
      const errorText = extractErrorMessage(error, 'Operation failed');
      setMessage({ type: 'error', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDelete = async (session) => {
    const confirmed = window.confirm('Are you sure you want to cancel this session?');
    if (!confirmed) return;

    try {
      await deleteSession(session._id);
      setMessage({ type: 'success', text: 'Session cancelled successfully' });
      await loadSessions();
    } catch (error) {
      const errorText = extractErrorMessage(error, 'Failed to cancel session');
      setMessage({ type: 'error', text: errorText });
    }
  };

  const handleViewDetails = (session) => {
    setSelectedSession(session);
  };

  const closeDetails = () => {
    setSelectedSession(null);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return '-';
    }

    return new Date(dateValue).toLocaleDateString();
  };

  const participants = Array.isArray(selectedSession?.participants)
    ? selectedSession.participants.filter((participant) => String(participant || '').trim() !== '')
    : [];

  return (
    <section className="kuppi-fresh-page">
      <div className="kuppi-fresh-wrap">
        <header className="kuppi-fresh-header">
          <div>
            <p className="kuppi-fresh-kicker">Kuppi Workspace</p>
            <h1>Kuppi Session Dashboard</h1>
            <p>Manage your upcoming and completed sessions in one focused workspace.</p>
            <small>{currentUserId ? `Logged in as: ${currentUserId}` : 'No user token found.'}</small>
          </div>

          <button
            type="button"
            className="kuppi-fresh-primary-btn"
            onClick={() => {
              setEditingSession(null);
              setShowForm(true);
            }}
          >
            Create New Session
          </button>
        </header>

        {message.text && (
          <div className={`kuppi-fresh-alert ${message.type === 'success' ? 'is-success' : 'is-error'}`}>
            {message.text}
          </div>
        )}

        {showForm && (
          <SessionForm
            initialValues={editingSession}
            onSubmit={handleCreateOrUpdate}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
            submitLabel={editingSession ? 'Update Session' : 'Create Session'}
          />
        )}

        {selectedSession && (
          <section className="kuppi-fresh-panel kuppi-session-detail-panel" aria-label="Selected session details">
            <div className="kuppi-session-detail-head">
              <h2 className="kuppi-fresh-panel-title">Session Details</h2>
              <button type="button" className="kuppi-fresh-ghost-btn kuppi-fresh-btn-sm" onClick={closeDetails}>
                Close
              </button>
            </div>

            <div className="kuppi-session-detail-grid">
              <div className="kuppi-session-detail-item">
                <strong>Module</strong>
                <span>{selectedSession.subject || '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Status</strong>
                <span>{selectedSession.status || '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Date</strong>
                <span>{formatDate(selectedSession.date)}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Start Time</strong>
                <span>{selectedSession.startTime || '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Duration</strong>
                <span>{selectedSession.duration ? `${selectedSession.duration} min` : '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Mode</strong>
                <span>{selectedSession.mode || '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Creator IT Number</strong>
                <span>{selectedSession.studentId || '-'}</span>
              </div>
              <div className="kuppi-session-detail-item">
                <strong>Location</strong>
                <span>{selectedSession.mode === 'Physical' ? selectedSession.location || '-' : 'N/A'}</span>
              </div>
              <div className="kuppi-session-detail-item kuppi-session-detail-item-wide">
                <strong>Meeting Link</strong>
                <span>{selectedSession.mode === 'Online' ? selectedSession.meetingLink || '-' : 'N/A'}</span>
              </div>
            </div>

            <div className="kuppi-session-participants">
              <h3>Joined Participants ({participants.length})</h3>
              {participants.length === 0 ? (
                <p className="kuppi-fresh-state is-muted">No participants joined yet.</p>
              ) : (
                <ul className="kuppi-session-participants-list">
                  {participants.map((participant, index) => (
                    <li key={`${participant}-${index}`}>{participant}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {loading && <p className="kuppi-fresh-state">Loading sessions...</p>}

        {!loading && (
          <div className="kuppi-fresh-sections">
            <section className="kuppi-fresh-panel">
              <h2 className="kuppi-fresh-panel-title">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <p className="kuppi-fresh-state is-muted">No upcoming sessions.</p>
              ) : (
                <div className="kuppi-session-list">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      canManage={session.status !== 'Cancelled' && session.status !== 'Completed'}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="kuppi-fresh-panel">
              <h2 className="kuppi-fresh-panel-title">Past Sessions</h2>
              {pastSessions.length === 0 ? (
                <p className="kuppi-fresh-state is-muted">No past sessions.</p>
              ) : (
                <div className="kuppi-session-list">
                  {pastSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      canManage={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
