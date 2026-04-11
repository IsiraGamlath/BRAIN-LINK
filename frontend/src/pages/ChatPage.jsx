import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useCurrentUser } from "../context/CurrentUserContext";
import "./ChatPage.css";

const HELP_API_BASE = "http://localhost:5000/api/help";

const toSafeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const normalizeIdentity = (value) => toSafeString(value).toLowerCase();

const toTimestamp = (value, fallback) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return parsed.toISOString();
};

const buildChatMessages = (request, incomingMessages) => {
  const fallbackTime = toTimestamp(
    request?.updatedAt || request?.createdAt,
    new Date().toISOString()
  );

  const normalizedMessages = (Array.isArray(incomingMessages) ? incomingMessages : [])
    .filter((message) => message && toSafeString(message.text) !== "")
    .map((message, index) => {
      return {
        id:
          toSafeString(message._id) ||
          `${toSafeString(message.senderId) || "unknown"}:${toSafeString(message.createdAt) || index}`,
        senderId: toSafeString(message.senderId),
        senderName: toSafeString(message.senderName),
        text: toSafeString(message.text),
        createdAt: toTimestamp(message.createdAt, fallbackTime),
        sequence: index,
      };
    });

  const helperText = toSafeString(request?.helperMessage);
  const helperId = toSafeString(request?.helperId || "helper");

  if (helperText) {
    const helperAlreadyPresent = normalizedMessages.some((message) => {
      return (
        normalizeIdentity(message.senderId) === normalizeIdentity(helperId) &&
        message.text === helperText
      );
    });

    if (!helperAlreadyPresent) {
      normalizedMessages.push({
        id: `helper:${toSafeString(request?._id) || "request"}`,
        senderId: helperId,
        senderName: helperId,
        text: helperText,
        createdAt: fallbackTime,
        sequence: normalizedMessages.length,
      });
    }
  }

  return normalizedMessages.sort((firstMessage, secondMessage) => {
    const firstTime = new Date(firstMessage.createdAt).getTime();
    const secondTime = new Date(secondMessage.createdAt).getTime();

    if (firstTime === secondTime) {
      return (firstMessage.sequence || 0) - (secondMessage.sequence || 0);
    }

    return firstTime - secondTime;
  });
};

// ChatPage: Full chat view for a help request
const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();

  const currentIdentity = useMemo(() => {
    const candidates = [
      user?.slIIId,
      currentUser?.itNumber,
      user?._id,
      user?.email,
      localStorage.getItem("userId"),
    ];

    const found = candidates.find((candidate) => toSafeString(candidate) !== "");
    return toSafeString(found);
  }, [user?.slIIId, user?._id, user?.email, currentUser?.itNumber]);

  const normalizedCurrentIdentity = useMemo(() => {
    return normalizeIdentity(currentIdentity);
  }, [currentIdentity]);

  const currentDisplayName = useMemo(() => {
    if (toSafeString(currentUser?.name)) {
      return toSafeString(currentUser.name);
    }

    if (toSafeString(user?.fullName)) {
      return toSafeString(user.fullName);
    }

    return currentIdentity || "Current User";
  }, [currentIdentity, currentUser?.name, user?.fullName]);

  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentIdentity) {
      localStorage.setItem("userId", currentIdentity);
    }
  }, [currentIdentity]);

  const fetchChatData = useCallback(async ({ silent = false } = {}) => {
    if (!requestId) {
      return;
    }

    try {
      if (!silent) {
        setLoading(true);
      }
      setError("");

      const [requestResponse, messagesResponse] = await Promise.all([
        axios.get(`${HELP_API_BASE}/${requestId}`),
        axios.get(`${HELP_API_BASE}/${requestId}/messages`),
      ]);

      const requestData = requestResponse.data || null;
      setRequest(requestData);
      setMessages(buildChatMessages(requestData, messagesResponse.data?.data));
    } catch {
      setError("Failed to load chat. Please try again.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [requestId]);

  useEffect(() => {
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    if (!requestId) {
      return undefined;
    }

    const poll = setInterval(() => {
      fetchChatData({ silent: true });
    }, 3000);

    return () => clearInterval(poll);
  }, [fetchChatData, requestId]);

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }

    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    if (!currentIdentity) {
      setError("Unable to identify your account. Please sign in again.");
      return;
    }

    try {
      setSending(true);
      setError("");

      const messagePayload = {
        senderId: currentIdentity,
        senderName: currentDisplayName,
        text: newMessage.trim(),
      };

      const res = await axios.post(
        `${HELP_API_BASE}/${requestId}/messages`,
        messagePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (Array.isArray(res.data?.data)) {
        setMessages(buildChatMessages(request, res.data.data));
        setNewMessage("");
        setError("");
      }
    } catch (err) {
      let errorMessage = "Failed to send message";

      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || err.message;
      } else if (err.request) {
        errorMessage = "No response from server - is backend running?";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  // Format date to readable time
  const formatTime = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageAuthorLabel = (message) => {
    const messageSender = normalizeIdentity(message?.senderId);

    if (messageSender && messageSender === normalizedCurrentIdentity) {
      return "You";
    }

    if (messageSender && messageSender === normalizeIdentity(request?.userId)) {
      return "Requester";
    }

    if (messageSender && messageSender === normalizeIdentity(request?.helperId)) {
      return "Helper";
    }

    return toSafeString(message?.senderName) || toSafeString(message?.senderId) || "Unknown User";
  };

  if (loading) {
    return (
      <section className="chat-page">
        <div className="chat-shell">
          <div className="chat-state-wrap">
            <div className="chat-spinner" aria-hidden="true" />
            <p className="chat-state">Loading chat messages...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!request) {
    return (
      <section className="chat-page">
        <div className="chat-shell">
          <div className="chat-state-wrap">
            <p className="chat-state">Request not found.</p>
            <button type="button" onClick={() => navigate("/my-requests")} className="chat-back-btn">
              Back to My Requests
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-page">
      <div className="chat-shell">
        <header className="chat-hero">
          <button type="button" onClick={() => navigate("/my-requests")} className="chat-back-btn">
            ← Back to My Requests
          </button>
          <p className="chat-kicker">Profile Workspace</p>
          <h1>{request.subject || "Help Chat"}</h1>
          <p>{request.description || "No description provided."}</p>
          <div className="chat-meta-row">
            <span className={`chat-status-pill ${toSafeString(request.status).toLowerCase() || "open"}`}>
              {toSafeString(request.status) || "Open"}
            </span>
            <span className="chat-type-pill">
              {request.helpType === "chat" ? "Chat Support" : "Study Session"}
            </span>
          </div>
        </header>

        {error && <p className="chat-flash chat-flash-error">{error}</p>}

        <section className="chat-board">
          <div className="chat-messages" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <p>No messages yet.</p>
                <small>Start the conversation using the input below.</small>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser =
                  normalizeIdentity(message?.senderId) === normalizedCurrentIdentity;

                return (
                  <article
                    key={message.id}
                    className={`chat-message ${isCurrentUser ? "is-own" : "is-peer"}`}
                  >
                    {!isCurrentUser && (
                      <p className="chat-message-author">{getMessageAuthorLabel(message)}</p>
                    )}
                    <p className="chat-message-text">{message.text}</p>
                    <time className="chat-message-time">{formatTime(message.createdAt)}</time>
                  </article>
                );
              })
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <form onSubmit={handleSendMessage} className="chat-composer">
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={sending}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="chat-send-btn"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
};

export default ChatPage;
