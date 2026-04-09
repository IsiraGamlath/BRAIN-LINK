import React from 'react';

function Navbar({ currentPage, onNavigate, onLogout }) {
  return (
    <nav className="sticky top-0 z-20 bg-gradient-to-r from-white/95 to-blue-50/90 backdrop-blur-md border-b-2 border-blue-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold text-brand">BrainLink | Kuppi Session</div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              currentPage === 'dashboard'
                ? 'bg-blue-100 text-accent-blue'
                : 'text-brand hover:text-accent-blue'
            }`}
          >
            My Sessions
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sessions')}
            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
              currentPage === 'sessions'
                ? 'bg-blue-100 text-accent-blue'
                : 'text-brand hover:text-accent-blue'
            }`}
          >
            Browse Sessions
          </button>
          <button type="button" className="btn-outline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
