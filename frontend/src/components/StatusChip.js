import React from "react";

function StatusChip({ status }) {
  let badgeClass = "status-pending";

  if (status === "Assigned") {
    badgeClass = "status-assigned";
  } else if (status === "In Progress") {
    badgeClass = "status-in-progress";
  } else if (status === "Resolved") {
    badgeClass = "status-resolved";
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="status-badge-dot"></span>
      {status || "Unknown"}
    </span>
  );
}

export default StatusChip;
