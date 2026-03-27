import React, { useCallback, useEffect, useState } from 'react';
import Navbar from './Navbar';
import SessionCard from './SessionCard';
import SessionForm from './SessionForm';
import {
  createSession,
  deleteSession,
  fetchPastSessions,
  fetchUpcomingSessions,
  getCurrentUserId,
  updateSession
} from '../api/sessionApi';

function Dashboard({ onNavigate, onLogout: passedOnLogout }) {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
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

  const handleLogout = () => {
    if (passedOnLogout) passedOnLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar currentPage="dashboard" onNavigate={onNavigate} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-brand mb-2">Kuppi Session Dashboard</h1>
            <p className="text-gray-600 mb-1">Manage your upcoming and past sessions in one place.</p>
            {currentUserId ? (
              <small className="text-gray-500">Logged in as: {currentUserId}</small>
            ) : (
              <small className="text-gray-500">No user token found.</small>
            )}
          </div>
          <button
            type="button"
            className="btn-primary px-6 py-3"
            onClick={() => {
              setEditingSession(null);
              setShowForm(true);
            }}
          >
            Create New Session
          </button>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>{message.text}</div>
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

        {loading && <p className="text-center text-gray-600 py-8">Loading sessions...</p>}

        {!loading && (
          <div className="grid grid-cols-2 gap-6">
            <section>
              <h2 className="text-2xl font-bold text-brand mb-4">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-500">No upcoming sessions.</p>
              ) : (
                <div className="grid gap-4">
                  {upcomingSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      canManage={session.status !== 'Cancelled' && session.status !== 'Completed'}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-bold text-brand mb-4">Past Sessions</h2>
              {pastSessions.length === 0 ? (
                <p className="text-gray-500">No past sessions.</p>
              ) : (
                <div className="grid gap-4">
                  {pastSessions.map((session) => (
                    <SessionCard
                      key={session._id}
                      session={session}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      canManage={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
