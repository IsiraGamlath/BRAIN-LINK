import React, { useState } from "react";
import "./FilterBar.css";

const FilterBar = ({ onFilterChange, onClearFilters }) => {
  const [filters, setFilters] = useState({
    search: "",
    module: "All Modules",
    status: "All",
    view: "All Groups",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({
      search: "",
      module: "All Modules",
      status: "All",
      view: "All Groups",
    });
    onClearFilters();
  };

  return (
    <div className="filterbar-container">
      <div className="filterbar-grid">
        {/* Search Input */}
        <div className="filterbar-form-group">
          <label className="filterbar-label">Search</label>
          <input
            type="text"
            name="search"
            placeholder="Search by module or group..."
            value={filters.search}
            onChange={handleChange}
            className="filterbar-input"
          />
        </div>

        {/* Module Dropdown */}
        <div className="filterbar-form-group">
          <label className="filterbar-label">Module</label>
          <select
            name="module"
            value={filters.module}
            onChange={handleChange}
            className="filterbar-input filterbar-select"
          >
            <option value="All Modules">All Modules</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Database Systems">Database Systems</option>
            <option value="Object Oriented Programming">Object Oriented Programming</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Networking">Networking</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="filterbar-form-group">
          <label className="filterbar-label">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="filterbar-input filterbar-select"
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Full">Full</option>
          </select>
        </div>

        {/* View Dropdown */}
        <div className="filterbar-form-group">
          <label className="filterbar-label">View</label>
          <select
            name="view"
            value={filters.view}
            onChange={handleChange}
            className="filterbar-input filterbar-select"
          >
            <option value="All Groups">All Groups</option>
            <option value="My Groups">My Groups</option>
            <option value="Groups I Lead">Groups I Lead</option>
            <option value="Groups I Joined">Groups I Joined</option>
            <option value="Available to Join">Available to Join</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="filterbar-button-group">
        <button
          onClick={handleClear}
          className="filterbar-btn-secondary"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
