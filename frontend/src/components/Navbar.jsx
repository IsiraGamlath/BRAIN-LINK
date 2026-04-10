import React from "react";
import { Link, useLocation } from "react-router-dom";

// Navbar: Top navigation bar with links
const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "📡 Help Feed" },
    { path: "/post", label: "📝 Post Request" },
    { path: "/my-requests", label: "📋 My Requests" },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700">
            <span className="text-2xl">🎓</span>
            Peer Help Platform
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded text-sm font-medium ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
