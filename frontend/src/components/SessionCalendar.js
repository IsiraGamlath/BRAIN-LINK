import React, { useState, useMemo, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Mock current user - replace with actual user from auth/context
const CURRENT_USER = {
  itNumber: '12345',
  name: 'Isira',
};

function SessionCalendar({ sessions }) {
  const [filter, setFilter] = useState('all'); // all, my, joined
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Helper to combine date and time
  const getSessionDateTime = (date, startTime) => {
    const dateObj = new Date(date);
    const [hours, minutes] = startTime.split(':');
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateObj.toISOString();
  };

  // Helper to get end time (date + startTime + duration)
  const getSessionEndTime = (date, startTime, duration) => {
    const dateObj = new Date(date);
    const [hours, minutes] = startTime.split(':');
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    dateObj.setMinutes(dateObj.getMinutes() + duration);
    return dateObj.toISOString();
  };

  // Convert sessions to FullCalendar events - only upcoming sessions
  const calendarEvents = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((session) => {
        const endDateTime = new Date(getSessionEndTime(session.date, session.startTime, session.duration));
        return endDateTime > now;
      })
      .map((session) => {
        const isLeader = session.studentId === CURRENT_USER.itNumber;
        const isJoined =
          Array.isArray(session.participants) &&
          session.participants.includes(CURRENT_USER.itNumber);

        let backgroundColor = '#FBBF24'; // Yellow - Other
        let borderColor = '#F59E0B';

        if (isLeader) {
          backgroundColor = '#34D399'; // Green - My sessions
          borderColor = '#10B981';
        } else if (isJoined) {
          backgroundColor = '#60A5FA'; // Blue - Joined
          borderColor = '#3B82F6';
        }

        return {
          id: session._id,
          title: `${session.startTime} ${session.subject}`,
          start: getSessionDateTime(session.date, session.startTime),
          end: getSessionEndTime(session.date, session.startTime, session.duration),
          backgroundColor,
          borderColor,
          extendedProps: {
            ...session,
            isLeader,
            isJoined,
          },
        };
      });
  }, [sessions]);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    return calendarEvents.filter((event) => {
      if (filter === 'my') {
        return event.extendedProps.isLeader;
      } else if (filter === 'joined') {
        return event.extendedProps.isJoined;
      }
      return true; // all
    });
  }, [calendarEvents, filter]);

  // Get upcoming sessions (next 3) - only sessions that haven't ended
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter((s) => {
        const endDateTime = new Date(getSessionEndTime(s.date, s.startTime, s.duration));
        return endDateTime > now;
      })
      .sort((a, b) => {
        const aDateTime = new Date(getSessionDateTime(a.date, a.startTime));
        const bDateTime = new Date(getSessionDateTime(b.date, b.startTime));
        return aDateTime.getTime() - bDateTime.getTime();
      })
      .slice(0, 3);
  }, [sessions]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setShowModal(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main Calendar */}
      <div className="flex-1 bg-white rounded-2xl shadow-brand p-6 border-2 border-blue-100">
        {/* Filter Buttons */}
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'bg-brand text-white shadow-lg'
                : 'bg-blue-50 text-brand border-2 border-blue-100 hover:bg-blue-100'
            }`}
          >
            All Sessions
          </button>
          <button
            type="button"
            onClick={() => setFilter('my')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'my'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
            }`}
          >
            My Sessions
          </button>
          <button
            type="button"
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'joined'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100'
            }`}
          >
            Joined Sessions
          </button>
        </div>

        {/* Calendar Legend */}
        <div className="mb-6 flex gap-6 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-400"></div>
            <span className="text-brand">My Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-400"></div>
            <span className="text-brand">Joined</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span className="text-brand">Other</span>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="fc-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            initialView="dayGridMonth"
            events={filteredEvents}
            eventClick={handleEventClick}
            height="auto"
            contentHeight="auto"
            eventDisplay="block"
            themeSystem="bootstrap5"
            selectable={true}
            editable={false}
          />
        </div>
      </div>

      {/* Upcoming Sessions Sidebar */}
      <div className="w-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-brand p-6 border-2 border-blue-100 self-start">
        <h3 className="text-xl font-bold text-brand mb-4">Upcoming Sessions</h3>

        {upcomingSessions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No upcoming sessions</p>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <h4 className="font-bold text-brand mb-2">
                  {session.subject}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-brand">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-brand">
                      {formatTime(session.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-xs ${
                        session.mode === 'Online'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {session.mode}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border-2 border-blue-100">
            <div className="bg-gradient-to-r from-brand to-brand-light text-white p-6 rounded-t-2xl flex justify-between items-start">
              <h2 className="text-2xl font-bold">Session Details</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Module Name</label>
                  <p className="text-brand font-semibold mt-1">
                    {selectedEvent.subject || '-'}
                  </p>
                </div>
                <div>
                  <label className="label">Mode</label>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedEvent.mode === 'Online'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {selectedEvent.mode === 'Online' ? '🔗' : '📍'}{' '}
                    {selectedEvent.mode}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-blue-100 pt-4 space-y-3">
                <div>
                  <label className="label">Date & Time</label>
                  <p className="text-brand font-semibold mt-1">
                    {formatDate(selectedEvent.date)} at{' '}
                    {formatTime(selectedEvent.startTime)}
                  </p>
                </div>

                <div>
                  <label className="label">Duration</label>
                  <p className="text-brand font-semibold mt-1">
                    {selectedEvent.duration || '-'} minutes
                  </p>
                </div>

                {selectedEvent.mode === 'Online' ? (
                  <div>
                    <label className="label">Meeting Link</label>
                    {selectedEvent.meetingLink ? (
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-blue font-semibold hover:underline block mt-1 break-all"
                      >
                        Join Meeting →
                      </a>
                    ) : (
                      <p className="text-gray-500 mt-1">No meeting link</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="label">Location</label>
                    <p className="text-brand font-semibold mt-1">
                      {selectedEvent.location || 'TBA'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="label">Leader</label>
                  <p className="text-brand font-semibold mt-1">
                    {selectedEvent.studentId || 'Unknown'}
                  </p>
                </div>

                {Array.isArray(selectedEvent.participants) &&
                  selectedEvent.participants.length > 0 && (
                    <div>
                      <label className="label">
                        Members ({selectedEvent.participants.length})
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEvent.participants.map((member, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <label className="label">Status</label>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedEvent.status === 'Booked'
                        ? 'bg-blue-100 text-accent-blue'
                        : selectedEvent.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedEvent.status === 'Booked'
                      ? 'Scheduled'
                      : selectedEvent.status}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-blue-100 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-primary flex-1 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FullCalendar Styles */}
      <style>{`
        .fc-calendar {
          font-family: 'Segoe UI', sans-serif;
        }

        .fc .fc-button-primary {
          background-color: #232C63;
          border-color: #232C63;
        }

        .fc .fc-button-primary:hover {
          background-color: #3d4a99;
          border-color: #3d4a99;
        }

        .fc .fc-button-primary.fc-button-active {
          background-color: #1a2149;
          border-color: #1a2149;
        }

        .fc .fc-col-header-cell {
          background-color: #f0f3ff;
          color: #232C63;
          font-weight: bold;
          border-color: #e0e9ff;
        }

        .fc .fc-daygrid-day.fc-day-other {
          background-color: #fafbff;
        }

        .fc .fc-daygrid-day:hover {
          background-color: #f5f7ff;
        }

        .fc .fc-daygrid-day.fc-day-today {
          background-color: #e0e9ff;
        }

        .fc .fc-daygrid-day-frame {
          min-height: 100px;
        }

        .fc .fc-event {
          cursor: pointer;
          transition: all 0.2s;
        }

        .fc .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(35, 44, 99, 0.2);
        }

        .fc .fc-event-title {
          font-weight: bold;
          font-size: 0.85em;
          white-space: normal;
          padding: 2px 4px;
        }

        .fc .fc-toolbar {
          margin-bottom: 1.5em;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5em;
          color: #232C63;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default SessionCalendar;
