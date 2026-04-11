import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  fetchAllSessions,
  getCurrentStudentId,
  getCurrentUserIdentifiers,
  joinSession
} from '../api/sessionApi';
import '../KuppiSessions.css';

function KuppiSessionsList() {
  const [sessions, setSessionsList] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchSubject, setSearchSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [joinedSessions, setJoinedSessions] = useState(new Set());
  const [joiningSessionId, setJoiningSessionId] = useState('');
  const currentStudentId = useMemo(() => getCurrentStudentId() || 'Guest', []);
  const currentIdentifierSet = useMemo(
    () => new Set(getCurrentUserIdentifiers().map((id) => String(id || '').trim().toLowerCase())),
    []
  );

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allSessions = await fetchAllSessions();
      setSessionsList(allSessions);
      setFilteredSessions(allSessions);
    } catch (err) {
      setError('Failed to fetch sessions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const applyFilters = useCallback(() => {
    let filtered = [...sessions];

    if (searchSubject.trim()) {
      filtered = filtered.filter((session) =>
        (session.subject || '').toLowerCase().includes(searchSubject.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter((session) => {
        if (!session.date) return false;
        const sessionDate = new Date(session.date).toISOString().slice(0, 10);
        return sessionDate === filterDate;
      });
    }

    setFilteredSessions(filtered);
  }, [sessions, searchSubject, filterDate]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleJoinSession = async (sessionId) => {
    try {
      setError(null);
      setJoiningSessionId(sessionId);

      await joinSession(sessionId, currentStudentId);

      setJoinedSessions((prev) => {
        const next = new Set(prev);
        next.add(sessionId);
        return next;
      });

      await fetchSessions();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to join session. Please try again later.';
      setError(message);
    } finally {
      setJoiningSessionId('');
    }
  };

  const isStudentJoined = (session) => {
    if (!session.participants || !Array.isArray(session.participants)) {
      return false;
    }

    return session.participants.some((participant) =>
      currentIdentifierSet.has(String(participant || '').trim().toLowerCase())
    );
  };

  const isOwnedByCurrentUser = (session) => {
    const ownerId = String(session?.studentId || '').trim().toLowerCase();
    return ownerId ? currentIdentifierSet.has(ownerId) : false;
  };

  const canJoin = (session) => {
    const isAlreadyJoined = isStudentJoined(session) || joinedSessions.has(session._id);
    return !isAlreadyJoined && !isOwnedByCurrentUser(session) && session.status === 'Booked';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString || '-';
  };

  return (
    <section className="kuppi-fresh-page">
      <div className="kuppi-fresh-wrap">
        <header className="kuppi-fresh-header">
          <div>
            <p className="kuppi-fresh-kicker">Kuppi Workspace</p>
            <h1>Browse Sessions</h1>
            <p>Discover scheduled peer-learning sessions and join what fits your goals.</p>
            <small>Logged in as: {currentStudentId}</small>
          </div>
        </header>

        <section className="kuppi-fresh-panel kuppi-fresh-filter-panel">
          <div className="kuppi-fresh-form-grid kuppi-fresh-form-grid--filters">
            <div className="kuppi-fresh-field">
              <label className="kuppi-fresh-label">Search by Subject</label>
              <input
                className="kuppi-fresh-input"
                type="text"
                placeholder="e.g., Mathematics, Programming"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
              />
            </div>

            <div className="kuppi-fresh-field">
              <label className="kuppi-fresh-label">Filter by Date</label>
              <input
                className="kuppi-fresh-input"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            {filterDate && (
              <div className="kuppi-fresh-field kuppi-fresh-field--actions">
                <label className="kuppi-fresh-label">Reset</label>
                <button
                  type="button"
                  className="kuppi-fresh-ghost-btn"
                  onClick={() => setFilterDate('')}
                >
                  Clear Date
                </button>
              </div>
            )}
          </div>
        </section>

        {error && <div className="kuppi-fresh-alert is-error">{error}</div>}

        {loading && <p className="kuppi-fresh-state">Loading sessions...</p>}

        {!loading && filteredSessions.length === 0 ? (
          <p className="kuppi-fresh-state is-muted">
            {sessions.length === 0 ? 'No sessions available yet.' : 'No sessions match your search criteria.'}
          </p>
        ) : null}

        {!loading && filteredSessions.length > 0 ? (
          <div className="kuppi-fresh-session-grid">
            {filteredSessions.map((session) => {
              const isJoined = isStudentJoined(session) || joinedSessions.has(session._id);
              const showJoinButton = canJoin(session);
              const isOwned = isOwnedByCurrentUser(session);
              const participantCount = Array.isArray(session.participants) ? session.participants.length : 0;
              const normalizedStatus = String(session.status || 'Booked').trim().toLowerCase();

              return (
                <article key={session._id} className="kuppi-fresh-card kuppi-fresh-card--browse">
                  <div className="kuppi-fresh-card-head">
                    <h2 className="kuppi-fresh-card-title">{session.subject || 'Untitled Session'}</h2>
                    <span className={`kuppi-fresh-status kuppi-fresh-status--${normalizedStatus}`}>
                      {session.status === 'Booked' ? 'Scheduled' : session.status || 'Scheduled'}
                    </span>
                  </div>

                  <div className="kuppi-fresh-detail-list">
                    <div className="kuppi-fresh-detail-row">
                      <strong>Date</strong>
                      <span>{formatDate(session.date)}</span>
                    </div>
                    <div className="kuppi-fresh-detail-row">
                      <strong>Time</strong>
                      <span>{formatTime(session.startTime)}</span>
                    </div>
                    <div className="kuppi-fresh-detail-row">
                      <strong>Mode</strong>
                      <span>{session.mode || '-'}</span>
                    </div>
                    <div className="kuppi-fresh-detail-row">
                      <strong>Host</strong>
                      <span>{isOwned ? 'You' : session.studentId || 'Unknown'}</span>
                    </div>
                    <div className="kuppi-fresh-detail-row">
                      <strong>Participants</strong>
                      <span>{participantCount}</span>
                    </div>

                    {session.mode === 'Physical' ? (
                      <div className="kuppi-fresh-detail-row">
                        <strong>Location</strong>
                        <span>{session.location || 'TBA'}</span>
                      </div>
                    ) : null}

                    {session.mode === 'Online' ? (
                      <div className="kuppi-fresh-detail-row">
                        <strong>Meeting</strong>
                        {isJoined ? (
                          <a
                            href={session.meetingLink || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kuppi-fresh-link"
                          >
                            Join Meeting
                          </a>
                        ) : (
                          <span className="kuppi-fresh-hint">Join to access link</span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="kuppi-fresh-card-actions">
                    {showJoinButton ? (
                      <button
                        type="button"
                        className="kuppi-fresh-primary-btn kuppi-fresh-btn-sm"
                        disabled={joiningSessionId === session._id}
                        onClick={() => handleJoinSession(session._id)}
                      >
                        {joiningSessionId === session._id ? 'Joining...' : 'Join Session'}
                      </button>
                    ) : isOwned ? (
                      <span className="kuppi-fresh-static-pill is-owned">Your Session</span>
                    ) : isJoined ? (
                      <span className="kuppi-fresh-static-pill is-joined">Joined</span>
                    ) : null}

                    {session.status === 'Cancelled' && !isJoined ? (
                      <span className="kuppi-fresh-static-pill is-cancelled">Cancelled</span>
                    ) : null}

                    {session.status === 'Completed' && !isJoined ? (
                      <span className="kuppi-fresh-static-pill is-completed">Completed</span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default KuppiSessionsList;
