import React from "react";
import { useNavigate } from "react-router-dom";
import StatusChip from "./StatusChip";

function ProblemCard({ problem, basePath = "/user/problem" }) {
  const navigate = useNavigate();
  const id = problem.problemId || problem._id || problem.id;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onClick={() => navigate(`${basePath}/${id}`)}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--primary)",
              backgroundColor: "var(--primary-light)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}
          >
            {problem.problemId || id}
          </span>
          <StatusChip status={problem.status} />
        </div>

        <h3
          style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "var(--text-main)",
            marginBottom: "8px",
          }}
        >
          {problem.title}
        </h3>

        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
          <strong>Category:</strong> {problem.category}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
          <strong>Location:</strong> {problem.location}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "10px" }}>
          <strong>Reported:</strong> {formatDate(problem.createdAt || problem.date)}
        </div>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-main)",
            lineHeight: "1.5",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {problem.description}
        </p>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border-color)",
          paddingTop: "12px",
          marginTop: "14px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${basePath}/${id}`);
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

export default ProblemCard;
