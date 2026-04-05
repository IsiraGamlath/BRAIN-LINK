import React, { useEffect, useState } from "react";
import axios from "axios";
import HelpForm from "./HelpForm";
import HelpCard from "./HelpCard";
import RespondModal from "./RespondModal";

// HelpPage: Main feed page for all help requests
const HelpPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState("");

  // Fetch all help requests
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/help");
      setRequests(res.data || []);
    } catch (err) {
      setError("Failed to load help requests.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Open respond modal
  const handleRespond = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  // Close request
  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  // After response, refresh feed
  const handleResponded = () => {
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-4xl font-bold text-gray-900">Peer Help Platform</h1>
            <p className="mt-2 text-lg text-gray-600">Connect with students for academic support</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Form Section */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <HelpForm onSuccess={fetchRequests} />
                </div>
              </div>

              {/* Feed Section */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Requests</h2>
                  <p className="text-gray-600">Browse and respond to help requests from your peers</p>
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
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-gray-600 text-lg font-medium">No help requests yet</p>
                    <p className="text-gray-500 mt-2">Be the first to post a request or check back later</p>
                  </div>
                )}

                <div className="space-y-4">
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
            </div>
          </div>
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

export default HelpPage;
