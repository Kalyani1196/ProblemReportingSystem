import React from "react";
import { useNavigate } from "react-router-dom";
import StatusChip from "./StatusChip";
import "./ProblemTable.css";

function ProblemTable({ problems, basePath = "/staff/problem" }) {
  const navigate = useNavigate();

  if (!problems || problems.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Problems Found</h3>
        <p>No problem reports match the selected criteria.</p>
      </div>
    );
  }

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
    <div className="table-responsive">
      <table className="problem-table">
        <thead>
          <tr>
            <th>Problem ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Location</th>
            <th>Reported By</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => {
            const id = problem.problemId || problem._id || problem.id;
            return (
              <tr
                key={id}
                onClick={() => navigate(`${basePath}/${id}`)}
              >
                <td className="table-problem-id">{problem.problemId || id}</td>
                <td className="table-title">{problem.title}</td>
                <td>
                  <span className="category-badge">{problem.category}</span>
                </td>
                <td>{problem.location}</td>
                <td>{problem.reportedBy?.name || problem.reportedBy || "Student"}</td>
                <td className="table-date">
                  {formatDate(problem.createdAt || problem.date)}
                </td>
                <td>
                  <StatusChip status={problem.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${basePath}/${id}`);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProblemTable;
