import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HelpPage = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/help`);
        setHelpRequests(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load help requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading help requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Peer Help Requests</h1>

      {helpRequests.length === 0 ? (
        <p className="text-gray-500">No help requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {helpRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2"
            >
              <h2 className="text-xl font-semibold text-gray-800">{request.subject}</h2>
              <span
                className={`self-start text-xs font-medium px-2 py-1 rounded-full ${
                  request.helpType === "session"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {request.helpType === "session" ? "Session" : "Chat"}
              </span>
              <p className="text-gray-600 text-sm mt-1 line-clamp-3">{request.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpPage;
