import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import KuppiSessionsList from './components/KuppiSessionsList';

const CURRENT_PAGE_KEY = 'brainlink-current-page';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem(CURRENT_PAGE_KEY) || 'dashboard';
  });

  const handleNavigate = (page) => {
    setCurrentPage(page);
    localStorage.setItem(CURRENT_PAGE_KEY, page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.setItem(CURRENT_PAGE_KEY, 'dashboard');
    setCurrentPage('dashboard');
  };

  return (
    <>
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} onLogout={handleLogout} />}
      {currentPage === 'sessions' && <KuppiSessionsList onNavigate={handleNavigate} onLogout={handleLogout} />}
    </>
  );
}

export default App;
