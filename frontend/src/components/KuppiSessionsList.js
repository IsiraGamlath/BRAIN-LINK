import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  fetchAllSessions,
  getCurrentStudentId,
  getCurrentUserIdentifiers
} from '../api/sessionApi';

function KuppiSessionsList() {
  const [sessions, setSessionsList] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchSubject, setSearchSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [joinedSessions, setJoinedSessions] = useState(new Set());
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

  const handleJoinSession = (sessionId) => {
    const newJoined = new Set(joinedSessions);
    newJoined.add(sessionId);
    setJoinedSessions(newJoined);
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
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-full">
      <div className="bg-gradient-to-r from-brand to-brand-light text-white py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Kuppi Sessions</h1>
          <p className="text-lg mb-1">Browse and join study sessions with your peers</p>
          <small className="opacity-90">Logged in as: {currentStudentId}</small>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label block mb-2">Search by Subject</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g., Mathematics, Programming..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="label block mb-2">Filter by Date</label>
            <input
              className="input-field"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {filterDate && (
            <div className="flex items-end">
              <button
                type="button"
                className="btn-outline px-4 py-2 w-full"
                onClick={() => setFilterDate('')}
              >
                Clear Date
              </button>
            </div>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading && <p className="text-center text-gray-600 py-8">Loading sessions...</p>}

        {!loading && filteredSessions.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-lg">
            {sessions.length === 0 ? 'No sessions available yet.' : 'No sessions match your search criteria.'}
          </p>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const isJoined = isStudentJoined(session) || joinedSessions.has(session._id);
            const showJoinButton = canJoin(session);
            const isOwned = isOwnedByCurrentUser(session);
            const participantCount = Array.isArray(session.participants) ? session.participants.length : 0;

            return (
              <div
                key={session._id}
                className="bg-white border-2 border-blue-100 rounded-2xl shadow-brand overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent-blue"
              >
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex justify-between items-start gap-3 border-b border-blue-200">
                  <h2 className="font-bold text-brand flex-1">{session.subject || 'Untitled Session'}</h2>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                      session.status === 'Booked'
                        ? 'bg-blue-100 text-accent-blue border border-blue-300'
                        : session.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }`}
                  >
                    {session.status === 'Booked' ? 'Scheduled' : session.status || 'Scheduled'}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-2">
                  <div className="flex justify-between">
                    <strong className="text-brand">Date:</strong>
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong className="text-brand">Time:</strong>
                    <span>{formatTime(session.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong className="text-brand">Mode:</strong>
                    <span>{session.mode || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong className="text-brand">Host:</strong>
                    <span>{isOwned ? 'You' : session.studentId || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <strong className="text-brand">Participants:</strong>
                    <span>{participantCount}</span>
                  </div>

                  {session.mode === 'Physical' ? (
                    <div className="flex justify-between">
                      <strong className="text-brand">Location:</strong>
                      <span>{session.location || 'TBA'}</span>
                    </div>
                  ) : null}

                  {session.mode === 'Online' ? (
                    <div className="flex justify-between items-start gap-2">
                      <strong className="text-brand">Meeting:</strong>
                      {isJoined ? (
                        <a
                          href={session.meetingLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-blue font-semibold hover:bg-blue-100 px-2 py-1 rounded"
                        >
                          Join Meeting
                        </a>
                      ) : (
                        <span className="text-gray-500 italic">Join to access link</span>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="px-4 py-3 border-t border-blue-100 flex gap-2">
                  {showJoinButton ? (
                    <button
                      type="button"
                      className="btn-primary flex-1 py-2 text-sm"
                      onClick={() => handleJoinSession(session._id)}
                    >
                      Join Session
                    </button>
                  ) : isOwned ? (
                    <span className="flex-1 bg-blue-100 text-accent-blue border border-blue-300 rounded-lg py-2 text-center font-semibold text-sm">
                      Your Session
                    </span>
                  ) : isJoined ? (
                    <span className="flex-1 bg-green-100 text-green-800 border border-green-300 rounded-lg py-2 text-center font-semibold text-sm">
                      ✓ Joined
                    </span>
                  ) : null}

                  {session.status === 'Cancelled' && !isJoined ? (
                    <span className="flex-1 bg-red-100 text-red-800 border border-red-300 rounded-lg py-2 text-center font-semibold text-sm">
                      Cancelled
                    </span>
                  ) : null}

                  {session.status === 'Completed' && !isJoined ? (
                    <span className="flex-1 bg-green-100 text-green-800 border border-green-300 rounded-lg py-2 text-center font-semibold text-sm">
                      Completed
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default KuppiSessionsList;
