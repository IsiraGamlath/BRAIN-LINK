import React, { useMemo, useState } from "react";
import "./UserProfilePage.css";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

function UserProfilePage({ currentUser, onEditProfile }) {
  const [activeView, setActiveView] = useState("overview");

  const displayName = useMemo(() => {
    if (hasValue(currentUser?.name)) {
      return String(currentUser.name).trim();
    }

    if (hasValue(currentUser?.username)) {
      return String(currentUser.username).trim();
    }

    return "Student Explorer";
  }, [currentUser?.name, currentUser?.username]);

  const handleName = useMemo(() => {
    const normalized = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "");
    return normalized || "studentexplorer";
  }, [displayName]);

  const initials = useMemo(() => {
    const segments = displayName.split(/\s+/).filter(Boolean);
    if (segments.length === 0) {
      return "SE";
    }

    const first = segments[0].charAt(0);
    const second = segments.length > 1 ? segments[1].charAt(0) : segments[0].charAt(1);
    return `${first}${second || ""}`.toUpperCase();
  }, [displayName]);

  const joinedDateText = useMemo(() => {
    const rawDate = currentUser?.createdAt || currentUser?.joinDate;

    if (!hasValue(rawDate)) {
      return "9 April 2026";
    }

    const parsedDate = new Date(rawDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return "9 April 2026";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentUser?.createdAt, currentUser?.joinDate]);

  const academicRows = useMemo(
    () => [
      { label: "IT Number", value: currentUser?.itNumber },
      { label: "Specialization", value: currentUser?.specialization },
      { label: "Batch", value: currentUser?.batch },
      { label: "Semester", value: currentUser?.semester },
      { label: "Study Type", value: currentUser?.studyType },
      { label: "Subgroup", value: currentUser?.subgroup },
    ],
    [
      currentUser?.itNumber,
      currentUser?.specialization,
      currentUser?.batch,
      currentUser?.semester,
      currentUser?.studyType,
      currentUser?.subgroup,
    ]
  );

  const completedCount = academicRows.filter((row) => hasValue(row.value)).length;
  const completionRate = Math.round((completedCount / academicRows.length) * 100);
  const profilePoints = 100 + completedCount * 55;
  const streakCount = 2 + completedCount;

  const profileMood = useMemo(() => {
    if (completionRate >= 90) {
      return "Profile Master";
    }

    if (completionRate >= 60) {
      return "Momentum Builder";
    }

    return "Fresh Starter";
  }, [completionRate]);

  const focusTags = useMemo(() => {
    const tags = [];

    if (hasValue(currentUser?.specialization)) {
      tags.push(String(currentUser.specialization));
    }

    if (hasValue(currentUser?.studyType)) {
      tags.push(String(currentUser.studyType));
    }

    if (hasValue(currentUser?.batch)) {
      tags.push(`Batch ${currentUser.batch}`);
    }

    if (hasValue(currentUser?.semester)) {
      tags.push(`Semester ${currentUser.semester}`);
    }

    return tags.slice(0, 4);
  }, [currentUser?.specialization, currentUser?.studyType, currentUser?.batch, currentUser?.semester]);

  const viewOptions = [
    { id: "overview", label: "Overview" },
    { id: "activity", label: "Activity" },
    { id: "goals", label: "Goals" },
  ];

  const handleEditClick = () => {
    if (typeof onEditProfile === "function") {
      onEditProfile();
    }
  };

  return (
    <section className="fresh-profile-page">
      <aside className="fresh-profile-card">
        <div className="fresh-avatar-block">
          <div className="fresh-avatar" aria-hidden="true">
            {initials}
          </div>
          <span className="fresh-online-dot" aria-hidden="true" />
        </div>

        <p className="fresh-mood-badge">{profileMood}</p>
        <h1 className="fresh-name">{displayName}</h1>
        <p className="fresh-handle">@{handleName}</p>

        <div className="fresh-tag-row">
          {focusTags.length > 0 ? (
            focusTags.map((tag) => (
              <span key={tag} className="fresh-tag">
                {tag}
              </span>
            ))
          ) : (
            <span className="fresh-tag fresh-tag--muted">Add your academic focus areas</span>
          )}
        </div>

        <button type="button" className="fresh-edit-btn" onClick={handleEditClick}>
          Edit Profile
        </button>

        <dl className="fresh-metrics">
          <div>
            <dt>Points</dt>
            <dd>{profilePoints}</dd>
          </div>
          <div>
            <dt>Completion</dt>
            <dd>{completionRate}%</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>{streakCount}d</dd>
          </div>
        </dl>

        <div className="fresh-basics">
          <h2>Profile Basics</h2>
          <ul>
            <li>
              <span>Joined</span>
              <strong>{joinedDateText}</strong>
            </li>
            <li>
              <span>Level</span>
              <strong>{currentUser?.level || "College"}</strong>
            </li>
            <li>
              <span>Status</span>
              <strong>Warnings: 0</strong>
            </li>
          </ul>
        </div>
      </aside>

      <main className="fresh-main">
        <header className="fresh-main-header">
          <div>
            <p className="fresh-kicker">Profile Workspace</p>
            <h2>Craft a standout academic identity</h2>
          </div>

          <div className="fresh-switch" role="tablist" aria-label="Profile views">
            {viewOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`fresh-switch-btn ${activeView === option.id ? "active" : ""}`}
                onClick={() => setActiveView(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {activeView === "overview" && (
          <div className="fresh-grid">
            <section className="fresh-panel fresh-panel--insights">
              <h3>Growth Snapshot</h3>
              <p>Keep your profile complete to unlock better study-group matches.</p>
              <div className="fresh-progress-track" aria-hidden="true">
                <span style={{ width: `${completionRate}%` }} />
              </div>

              <div className="fresh-insight-cards">
                <article>
                  <span>Academic fields ready</span>
                  <strong>
                    {completedCount}/{academicRows.length}
                  </strong>
                </article>
                <article>
                  <span>Current strength</span>
                  <strong>
                    {hasValue(currentUser?.specialization)
                      ? String(currentUser.specialization)
                      : "Still discovering"}
                  </strong>
                </article>
                <article>
                  <span>Momentum</span>
                  <strong>{streakCount} day consistency</strong>
                </article>
              </div>
            </section>

            <section className="fresh-panel fresh-panel--journey">
              <h3>Next Steps</h3>
              <ul className="fresh-journey-list">
                <li>
                  <span className="fresh-step-badge">1</span>
                  <div>
                    <p>Complete all academic fields</p>
                    <small>Improves group matching quality.</small>
                  </div>
                </li>
                <li>
                  <span className="fresh-step-badge">2</span>
                  <div>
                    <p>Add specialization keywords</p>
                    <small>Helps peers discover your expertise.</small>
                  </div>
                </li>
                <li>
                  <span className="fresh-step-badge">3</span>
                  <div>
                    <p>Update profile every semester</p>
                    <small>Keeps recommendations accurate.</small>
                  </div>
                </li>
              </ul>
            </section>

            <section className="fresh-panel fresh-panel--academic">
              <h3>Academic Snapshot</h3>
              <ul className="fresh-academic-list">
                {academicRows.map((row) => {
                  const completed = hasValue(row.value);

                  return (
                    <li key={row.label}>
                      <div>
                        <span className="fresh-academic-label">{row.label}</span>
                        <strong className="fresh-academic-value">
                          {completed ? String(row.value) : "Not added yet"}
                        </strong>
                      </div>
                      <span className={`fresh-status-pill ${completed ? "ready" : "pending"}`}>
                        {completed ? "Ready" : "Pending"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        )}

        {activeView === "activity" && (
          <section className="fresh-panel fresh-panel--empty">
            <h3>Activity feed is waiting</h3>
            <p>Join discussions and answer questions to populate your timeline.</p>
            <button type="button" className="fresh-ghost-btn">
              Explore Discussions
            </button>
          </section>
        )}

        {activeView === "goals" && (
          <section className="fresh-panel fresh-panel--empty">
            <h3>Goals in progress</h3>
            <p>Track milestones as you complete your profile and collaborate with peers.</p>
            <button type="button" className="fresh-ghost-btn">
              View Study Groups
            </button>
          </section>
        )}
      </main>
    </section>
  );
}

export default UserProfilePage;