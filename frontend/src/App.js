import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HelpFeedPage from './pages/HelpFeedPage';
import PostRequestPage from './pages/PostRequestPage';
import MyRequestsPage from './pages/MyRequestsPage';
import EditRequestPage from './pages/EditRequestPage';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HelpFeedPage />} />
            <Route path="/post" element={<PostRequestPage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />
            <Route path="/edit/:id" element={<EditRequestPage />} />
            <Route path="/chat/:requestId" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
