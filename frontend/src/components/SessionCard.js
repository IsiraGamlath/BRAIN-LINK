import React from 'react';

function SessionCard({ session, onEdit, onDelete, canManage }) {
  const displayDate = session.date ? new Date(session.date).toLocaleDateString() : '-';
  const displayTime = session.startTime || '-';

  return (
    <article className="bg-white border-2 border-blue-100 rounded-2xl shadow-brand p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent-blue">
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-bold text-brand flex-1">{session.subject || 'Untitled Session'}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(session)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete session"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full ${
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
      </div>

      <div className="flex gap-4 text-sm font-semibold text-brand mb-3">
        <span>{displayDate}</span>
        <span>{displayTime}</span>
        <span>{session.mode || '-'}</span>
        <span>{session.duration ? `${session.duration} min` : '-'}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1 py-2"
          onClick={() => onEdit(session)}
          disabled={!canManage}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn-danger flex-1 py-2"
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
