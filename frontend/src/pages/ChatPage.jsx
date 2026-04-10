import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ChatPage: Full chat view for a help request
const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  // Get userId from localStorage or generate one
  const [currentUserId] = useState(
    localStorage.getItem("userId") || "user_" + Math.random().toString(36).substr(2, 9)
  );

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch request details and messages on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch request details
        const requestRes = await axios.get(
          `http://localhost:5000/api/help/${requestId}`
        );
        setRequest(requestRes.data);

        // Fetch messages
        const messagesRes = await axios.get(
          `http://localhost:5000/api/help/${requestId}/messages`
        );
        setMessages(messagesRes.data.data || []);
      } catch (err) {
        setError("Failed to load chat. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Validate message
    if (!newMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    try {
      setSending(true);
      setError(""); // Clear previous errors
      
      const messagePayload = {
        senderId: currentUserId,
        senderName: currentUserId,
        text: newMessage.trim(),
      };

      console.log("📤 Sending message payload:", messagePayload);
      console.log("📍 Request ID:", requestId);

      const res = await axios.post(
        `http://localhost:5000/api/help/${requestId}/messages`,
        messagePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Message sent successfully:", res.data);

      // Update messages list
      if (res.data && res.data.data) {
        setMessages(res.data.data);
        setNewMessage("");
        setError("");
      } else {
        console.warn("⚠️ Unexpected response format:", res.data);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      
      let errorMessage = "Failed to send message";
      
      if (err.response) {
        console.error("Backend error response:", err.response.data);
        errorMessage = err.response.data?.message || err.response.data?.error || err.message;
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server - is backend running?";
      } else {
        console.error("Error details:", err.message);
        errorMessage = err.message;
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  // Format date to readable time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600 mb-4">Request not found</p>
        <button
          onClick={() => navigate("/my-requests")}
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Back to My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with Request Info */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate("/my-requests")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 break-words">
              {request.subject}
            </h1>
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {request.description}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className={`px-2.5 py-1 rounded-full font-semibold ${
                request.status === 'Open' ? 'bg-green-100 text-green-800' :
                request.status === 'Accepted' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
              <span className="text-gray-500">
                Type: {request.helpType === 'chat' ? '💬 Chat' : '📅 Session'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 sm:px-6">
          <p className="text-red-700 text-sm flex items-center gap-2">
            ❌ {error}
          </p>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 text-lg mb-2">💬 No messages yet</p>
            <p className="text-gray-400 text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUserId;
            return (
              <div
                key={index}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xs sm:max-w-sm lg:max-w-md rounded-lg px-4 py-2 ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}>
                  {/* Sender Name - show for others' messages */}
                  {!isCurrentUser && (
                    <p className="text-xs font-semibold opacity-75 mb-1">
                      {msg.senderName || msg.senderId}
                    </p>
                  )}
                  {/* Message Text */}
                  <p className="text-sm break-words leading-relaxed">
                    {msg.text}
                  </p>
                  {/* Message Time */}
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? "text-blue-100" : "text-gray-600"
                  }`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 sm:px-6">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </>
            ) : (
              <>✉️ Send</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
