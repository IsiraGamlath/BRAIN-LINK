import React, { useEffect, useState } from "react";
import axios from "axios";
import HelpCard from "../components/Peer_Help_Request/HelpCard";
import RespondModal from "../components/Peer_Help_Request/RespondModal";

// HelpFeedPage: Display all open help requests
const HelpFeedPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch all open help requests
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/help");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load help requests.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  const handleResponded = () => {
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Help Feed</h1>
          <p className="mt-2 text-lg text-gray-600">Browse and respond to help requests from your peers</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md text-center border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No help requests available</h3>
              <p className="text-gray-600 mb-6">There are no open help requests right now. Be the first to post!</p>
              <a 
                href="/post" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Post a Request
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-max">
          {Array.isArray(requests) && requests.length > 0 && requests.map((req) => (
            <HelpCard
              key={req._id}
              request={req}
              showRespond={req.status === "Open"}
              showClose={req.status === "Accepted"}
              onRespond={handleRespond}
              onClose={handleClose}
            />
          ))}
        </div>
      </div>

      <RespondModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        requestId={selectedRequest?._id}
        onResponded={handleResponded}
      />
    </div>
  );
};

export default HelpFeedPage;
