import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HelpCard from "../components/Peer_Help_Request/HelpCard";

// MyRequestsPage: Display logged-in user's help requests
const MyRequestsPage = () => {
  // Replace with actual userId from auth context
  const userId = localStorage.getItem("userId") || "anonymousUser";
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, open, accepted, closed
  const [deleting, setDeleting] = useState(false);

  // Fetch user's help requests
  const fetchMyRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/help/my/${userId}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError("Failed to load your requests.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyRequests();
  }, [userId]);

  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchMyRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  // Handle edit button click - navigate to edit page
  const handleEdit = (requestId) => {
    navigate(`/edit/${requestId}`);
  };

  // Handle view chat - navigate to chat page
  const handleViewChat = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  // Handle delete - simple confirmation dialog
  const handleDelete = async (request) => {
    // Show native confirmation dialog
    const confirmed = window.confirm(
      `Delete "${request.subject}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/help/${request._id}`);
      alert("Request deleted successfully!");
      await fetchMyRequests(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete request. " + err.message);
    }
    setDeleting(false);
  };

  // Filter requests based on selected status
  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status?.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "Open").length,
    accepted: requests.filter((r) => r.status === "Accepted").length,
    closed: requests.filter((r) => r.status === "Closed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Help Requests</h1>
          <p className="mt-2 text-lg text-gray-600">Manage and track your help requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-medium">Total Requests</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Open</p>
            <p className="text-3xl font-bold text-green-500 mt-2">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Accepted</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Closed</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{stats.closed}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "open"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Open ({stats.open})
          </button>
          <button
            onClick={() => setFilter("accepted")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "accepted"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Accepted ({stats.accepted})
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "closed"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Closed ({stats.closed})
          </button>
        </div>

        {/* Content */}
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

        {!loading && filteredRequests.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md text-center border border-gray-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You have not posted any requests</h3>
              <p className="text-gray-600 mb-6">Your help requests will appear here. Get started by posting your first request!</p>
              <a 
                href="/post" 
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Post Your First Request
              </a>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <HelpCard
              key={req._id}
              request={req}
              showRespond={false}
              showViewChat={true}
              showClose={req.status === "Accepted"}
              showEdit={req.status === "Open"}
              showDelete={req.status === "Open"}
              onClose={handleClose}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewChat={handleViewChat}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRequestsPage;
