import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import SessionCalendar from './SessionCalendar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const CURRENT_STUDENT = 'Isira';

function KuppiSessionsList({ onNavigate, onLogout: passedOnLogout }) {
  const [sessions, setSessionsList] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchSubject, setSearchSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [joinedSessions, setJoinedSessions] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      const allSessions = Array.isArray(response.data) ? response.data : [];
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
    return session.participants.includes(CURRENT_STUDENT);
  };

  const canJoin = (session) => {
    const isAlreadyJoined = isStudentJoined(session) || joinedSessions.has(session._id);
    return !isAlreadyJoined && session.status === 'Booked';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString || '-';
  };

  const handleLogout = () => {
    if (passedOnLogout) passedOnLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar currentPage="sessions" onNavigate={onNavigate} onLogout={handleLogout} />

      <div className="bg-gradient-to-r from-brand to-brand-light text-white py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">Kuppi Sessions</h1>
          <p className="text-lg mb-1">Browse and join study sessions with your peers</p>
          <small className="opacity-90">Logged in as: {CURRENT_STUDENT}</small>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* View Toggle Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-brand text-white shadow-lg'
                : 'bg-white text-brand border-2 border-brand hover:bg-blue-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
            </svg>
            List View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              viewMode === 'calendar'
                ? 'bg-brand text-white shadow-lg'
                : 'bg-white text-brand border-2 border-brand hover:bg-blue-50'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5H4v8a2 2 0 002 2h12a2 2 0 002-2V7h-2v1a1 1 0 11-2 0V7H9v1a1 1 0 11-2 0V7H6v1a1 1 0 11-2 0V7z"
                clipRule="evenodd"
              />
            </svg>
            Calendar View
          </button>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <>
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
                    <span>{session.studentId || 'Unknown'}</span>
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
          </>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && !loading && (
          <SessionCalendar sessions={sessions} />
        )}

        {viewMode === 'calendar' && loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading calendar...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default KuppiSessionsList;
