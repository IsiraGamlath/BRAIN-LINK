import React, { useState } from "react";
import "./StatisticsCards.css";

const StatisticsCards = ({ groups, user }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Only count groups in user's academic context
  const relevantGroups = groups.filter(
    (g) =>
      g.specialization === user?.specialization &&
      g.batch === user?.batch &&
      g.semester === user?.semester &&
      g.studyType === user?.studyType &&
      g.subgroup === user?.subgroup
  );

  const totalGroups = relevantGroups.length;
  const openGroups = relevantGroups.filter((g) => g.status === "Open").length;
  const fullGroups = relevantGroups.filter((g) => g.status === "Full").length;
  const myGroups = relevantGroups.filter((g) =>
    g.members.some((m) => m.itNumber === user?.itNumber)
  ).length;

  const cards = [
    { title: "Available Groups", value: totalGroups, icon: "📘", color: "blue", key: "total" },
    { title: "Open Groups", value: openGroups, icon: "✅", color: "green", key: "open" },
    { title: "Full Groups", value: fullGroups, icon: "⛔", color: "red", key: "full" },
    { title: "My Project Groups", value: myGroups, icon: "🎓", color: "purple", key: "my" },
  ];

  return (
    <div className="statistics-grid">
      {cards.map((card, index) => (
        <div
          key={card.key}
          className={`statistics-card statistics-card-${card.color} ${
            hoveredCard === index ? "statistics-card-hovered" : ""
          }`}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="statistics-icon-value">
            <div className="statistics-icon">{card.icon}</div>
            <div className="statistics-value">{card.value}</div>
          </div>
          <div className="statistics-title">{card.title}</div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
