import React from "react";

// Helper for status badge styling
const getStatusStyles = (status) => {
  const statusLower = (status || "").toLowerCase();
  
  const styles = {
    open: {
      container: "bg-green-50 border border-green-200",
      badge: "bg-green-100 text-green-800",
      icon: "🟢"
    },
    accepted: {
      container: "bg-yellow-50 border border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      icon: "🟡"
    },
    closed: {
      container: "bg-red-50 border border-red-200",
      badge: "bg-red-100 text-red-800",
      icon: "🔴"
    },
  };
  
  return styles[statusLower] || { container: "bg-gray-50", badge: "bg-gray-100 text-gray-700", icon: "⚪" };
};

// HelpCard: Card to display a help request
const HelpCard = ({
  request,
  onRespond,
  onClose,
  onEdit,
  onDelete,
  onViewChat,
  showClose,
  showRespond,
  showEdit,
  showDelete,
  showViewChat,
}) => {
  const statusStyles = getStatusStyles(request.status);
  
  return (
    <div className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden border border-gray-100 bg-white group`}>
      {/* Header with Status */}
      <div className={`px-5 py-3 ${statusStyles.container}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
              {request.subject}
            </h3>
          </div>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusStyles.badge}`}>
            {request.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-3 space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {request.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs font-medium">Type:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold capitalize">
            {request.helpType === 'chat' ? '💬' : '📅'}
            {request.helpType}
          </span>
        </div>

        {/* Creator info */}
        {request.userId && (
          <p className="text-xs text-gray-500">
            Posted by: <span className="font-medium text-gray-700">{request.userId}</span>
          </p>
        )}

        {/* Responses Section */}
        {request.responses && request.responses.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
              💬 Responses ({request.responses.length})
            </h4>
            <div className="space-y-2">
              {request.responses.map((response, index) => (
                <div key={index} className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {response.message || response.helperMessage}
                  </p>
                  {(response.responderName || response.helperId) && (
                    <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-blue-100">
                      By: <span className="font-medium text-blue-700">{response.responderName || response.helperId}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Single Response (for backward compatibility) */}
        {!request.responses && request.helperMessage && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1">
              💬 Responses
            </h4>
            <div className="space-y-2">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {request.helperMessage}
                </p>
                {request.helperId && (
                  <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-blue-100">
                    By: <span className="font-medium text-blue-700">{request.helperId}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2">
        {showViewChat && (
          <button
            onClick={() => onViewChat(request._id)}
            className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white text-sm transition-all hover:bg-purple-700 active:scale-95 shadow-sm hover:shadow-md"
          >
            💬 View Chat
          </button>
        )}
        {showRespond && (
          <button
            onClick={() => onRespond(request)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white text-sm transition-all hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md"
          >
            ✉️ Respond
          </button>
        )}
        {showClose && (
          <button
            onClick={() => onClose(request)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white text-sm transition-all hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md"
          >
            ✓ Close
          </button>
        )}
        {showEdit && (
          <button
            onClick={() => onEdit(request._id)}
            className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white text-sm transition-all hover:bg-green-700 active:scale-95 shadow-sm hover:shadow-md"
          >
            ✏️ Edit
          </button>
        )}
        {showDelete && (
          <button
            onClick={() => onDelete(request)}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white text-sm transition-all hover:bg-red-700 active:scale-95 shadow-sm hover:shadow-md"
          >
            🗑️ Delete
          </button>
        )}
        {!showViewChat && !showRespond && !showClose && !showEdit && !showDelete && (
          <div className="w-full">
            {request.status?.toLowerCase() === 'open' && (
              <p className="text-xs font-medium text-gray-500 text-center">⏳ Waiting for helper</p>
            )}
            {request.status?.toLowerCase() === 'closed' && (
              <p className="text-xs font-medium text-gray-500 text-center">✅ Completed</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCard;
