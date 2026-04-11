// frontend/src/components/Toast/Toast.jsx  — Global notification system
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error',   dur),
    warning: (msg, dur) => addToast(msg, 'warning',  dur),
    info:    (msg, dur) => addToast(msg, 'info',     dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg viewBox="0 0 20 20" role="img" aria-hidden="true">
          <path d="M16.6 5.8a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.4 9.8a1 1 0 1 1 1.4-1.4l3.9 3.9 6.5-6.5a1 1 0 0 1 1.4 0Z" fill="currentColor" />
        </svg>
      );
    case 'error':
      return (
        <svg viewBox="0 0 20 20" role="img" aria-hidden="true">
          <path d="M5.8 5.8a1 1 0 0 1 1.4 0L10 8.6l2.8-2.8a1 1 0 1 1 1.4 1.4L11.4 10l2.8 2.8a1 1 0 0 1-1.4 1.4L10 11.4l-2.8 2.8a1 1 0 0 1-1.4-1.4L8.6 10 5.8 7.2a1 1 0 0 1 0-1.4Z" fill="currentColor" />
        </svg>
      );
    case 'warning':
      return (
        <svg viewBox="0 0 20 20" role="img" aria-hidden="true">
          <path d="M10.9 3.1 18 15.7a1.1 1.1 0 0 1-1 1.7H3a1.1 1.1 0 0 1-1-1.7L9.1 3.1a1 1 0 0 1 1.8 0ZM10 7a1 1 0 0 0-1 1v3.2a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 8a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 10 15Z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" role="img" aria-hidden="true">
          <path d="M10 2.2a7.8 7.8 0 1 0 0 15.6A7.8 7.8 0 0 0 10 2.2Zm0 3.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm1 8.8H9v-5h2v5Z" fill="currentColor" />
        </svg>
      );
  }
};

const ToastItem = ({ toast, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-close
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350);
    }, toast.duration || 4000);

    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [toast.duration, onClose]);

  return (
    <div className={`toast toast--${toast.type} ${visible ? 'toast--visible' : ''}`}>
      <span className="toast__icon">
        <ToastIcon type={toast.type} />
      </span>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={() => { setVisible(false); setTimeout(onClose, 350); }}>×</button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
