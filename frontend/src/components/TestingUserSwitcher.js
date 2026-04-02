import React from "react";
import { useCurrentUser } from "../context/CurrentUserContext";
import "./TestingUserSwitcher.css";

const TestingUserSwitcher = () => {
  const { currentUser, testUsers, setCurrentUserByItNumber } = useCurrentUser();

  return (
    <section className="testing-user-context-card" aria-label="Testing User Context">
      <div className="testing-user-context-header">
        <div>
          <h2 className="testing-user-context-title">Testing User Context</h2>
          <p className="testing-user-context-subtitle">
            Switch users to test group requests, approvals, and membership rules.
          </p>
        </div>
        <span className="testing-user-context-badge">TEMPORARY</span>
      </div>

      <div className="testing-user-context-grid">
        <div className="testing-user-context-control">
          <label htmlFor="test-user-selector" className="testing-user-context-label">
            Select Current Test User
          </label>
          <select
            id="test-user-selector"
            className="testing-user-context-select"
            value={currentUser.itNumber}
            onChange={(e) => setCurrentUserByItNumber(e.target.value)}
          >
            {testUsers.map((user) => (
              <option key={user.itNumber} value={user.itNumber}>
                {user.name} ({user.itNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="testing-user-context-details">
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">Name</span>
            <strong>{currentUser.name}</strong>
          </div>
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">IT Number</span>
            <strong>{currentUser.itNumber}</strong>
          </div>
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">Batch</span>
            <strong>{currentUser.batch}</strong>
          </div>
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">Semester</span>
            <strong>{currentUser.semester}</strong>
          </div>
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">Subgroup</span>
            <strong>{currentUser.subgroup}</strong>
          </div>
          <div className="testing-user-context-item">
            <span className="testing-user-context-item-label">Study Type</span>
            <strong>{currentUser.studyType}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestingUserSwitcher;
