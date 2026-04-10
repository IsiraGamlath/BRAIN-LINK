import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HelpCard from "./HelpCard";

// Replace with actual userId from auth context or props
const userId = "YOUR_USER_ID";

// MyRequests: Display and manage the current user's help requests
const MyRequests = () => {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/help/my/${userId}`);
      setMyRequests(res.data || []);
    } catch {
      setError("Failed to load your requests.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleClose = async (request) => {
    try {
      await axios.put(`http://localhost:5000/api/help/${request._id}/close`);
      fetchMyRequests();
    } catch {
      alert("Failed to close request.");
    }
  };

  const handleViewChat = (requestId) => {
    navigate(`/chat/${requestId}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Help Requests</h2>
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="bg-red-100 text-red-700 rounded px-3 py-2 mb-4">{error}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {myRequests.map((req) => (
          <HelpCard
            key={req._id}
            request={req}
            showClose={req.status === "Accepted"}
            showRespond={false}
            showViewChat={true}
            onClose={handleClose}
            onViewChat={handleViewChat}
          />
        ))}
      </div>
    </div>
  );
};

export default MyRequests;
