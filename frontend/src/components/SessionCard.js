import React from 'react';

function SessionCard({ session, onEdit, onDelete, onViewDetails, canManage }) {
  const displayDate = session.date ? new Date(session.date).toLocaleDateString() : '-';
  const displayTime = session.startTime || '-';
  const normalizedStatus = String(session.status || 'Booked').trim().toLowerCase();
  const statusLabel = normalizedStatus === 'booked' ? 'Scheduled' : session.status || 'Scheduled';
  const isScheduled = normalizedStatus === 'booked' || normalizedStatus === 'scheduled';

  return (
    <article className="kuppi-fresh-card">
      <div className="kuppi-fresh-card-head">
        <h3 className="kuppi-fresh-card-title">{session.subject || 'Untitled Session'}</h3>
        <div className="kuppi-fresh-card-head-actions">
          <button
            type="button"
            onClick={() => onDelete(session)}
            className="kuppi-fresh-icon-btn"
            title="Delete session"
            aria-label="Delete session"
            disabled={!canManage}
          >
            <svg className="kuppi-fresh-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <span className={`kuppi-fresh-status kuppi-fresh-status--${normalizedStatus}`}>{statusLabel}</span>
        </div>
      </div>

      <div className="kuppi-fresh-meta">
        <span>{displayDate}</span>
        <span>{displayTime}</span>
        <span>{session.mode || '-'}</span>
        <span>{session.duration ? `${session.duration} min` : '-'}</span>
      </div>

      <div className="kuppi-fresh-card-actions">
        {isScheduled && typeof onViewDetails === 'function' && (
          <button
            type="button"
            className="kuppi-fresh-ghost-btn kuppi-fresh-btn-sm"
            onClick={() => onViewDetails(session)}
          >
            View Details
          </button>
        )}
        <button
          type="button"
          className="kuppi-fresh-primary-btn kuppi-fresh-btn-sm"
          onClick={() => onEdit(session)}
          disabled={!canManage}
        >
          Edit
        </button>
        <button
          type="button"
          className="kuppi-fresh-danger-btn kuppi-fresh-btn-sm"
          onClick={() => onDelete(session)}
          disabled={!canManage}
        >
          Cancel
        </button>
      </div>
    </article>
  );
}

export default SessionCard;
