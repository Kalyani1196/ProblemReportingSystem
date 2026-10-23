/**
 * Status definitions and helper utilities for Problem Reporting and Tracking System
 */

export const PROBLEM_STATUS = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const STATUS_SEQUENCE = [
  PROBLEM_STATUS.PENDING,
  PROBLEM_STATUS.ASSIGNED,
  PROBLEM_STATUS.IN_PROGRESS,
  PROBLEM_STATUS.RESOLVED,
];

/**
 * Returns user-friendly status badge styling class
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case PROBLEM_STATUS.PENDING:
      return "status-pending";
    case PROBLEM_STATUS.ASSIGNED:
      return "status-assigned";
    case PROBLEM_STATUS.IN_PROGRESS:
      return "status-in-progress";
    case PROBLEM_STATUS.RESOLVED:
      return "status-resolved";
    default:
      return "status-pending";
  }
};
