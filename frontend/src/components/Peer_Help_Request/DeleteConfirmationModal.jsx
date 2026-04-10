import React from "react";

// DeleteConfirmationModal: Confirm before deleting a help request
const DeleteConfirmationModal = ({ isOpen, request, onConfirm, onCancel, isLoading }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md p-8 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Request?</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this request? This action cannot be undone.
          </p>
          <p className="bg-gray-50 rounded-lg p-3 mb-4">
            <span className="font-semibold text-gray-900">{request.subject}</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(request._id)}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>🗑️ Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
