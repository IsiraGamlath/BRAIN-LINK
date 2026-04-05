import React from "react";
import HelpForm from "../components/Peer_Help_Request/HelpForm";

// PostRequestPage: Show only the help request submission form
const PostRequestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Post a Help Request</h1>
          <p className="mt-2 text-lg text-gray-600">Ask the community for academic help and support</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <HelpForm onSuccess={() => {
              // Optional: Show success message or redirect
              window.scrollTo(0, 0);
            }} />
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Tips for a Great Request</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">✏️</span>
                  <div>
                    <p className="font-semibold text-gray-900">Be Specific</p>
                    <p className="text-sm text-gray-600 mt-1">Include the exact topic or concept you need help with</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">📚</span>
                  <div>
                    <p className="font-semibold text-gray-900">Provide Context</p>
                    <p className="text-sm text-gray-600 mt-1">Mention your course, level, and what you've already tried</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🎯</span>
                  <div>
                    <p className="font-semibold text-gray-900">Choose Help Type</p>
                    <p className="text-sm text-gray-600 mt-1">Chat for quick explanations, Session for detailed tutoring</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">⏰</span>
                  <div>
                    <p className="font-semibold text-gray-900">Be Responsive</p>
                    <p className="text-sm text-gray-600 mt-1">Reply to peers who offer help quickly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostRequestPage;
