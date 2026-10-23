import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatusChip from "../../components/StatusChip";
import { problemApi } from "../../services/api";

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await problemApi.getMyProblemDetails(id);
        if (res.data.success) {
          setProblem(res.data.problem);
        }
      } catch (err) {
        console.error("Error fetching problem details:", err);
        const message =
          err.response?.data?.message ||
          "Unable to load problem details. Make sure you are authorized.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <DashboardLayout role="Student">
      <div style={{ maxWidth: "900px" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/user/my-problems")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to My Problems
        </button>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-box">Loading problem report...</div>
        ) : !problem ? (
          <div className="empty-state">
            <h3>Problem Not Found</h3>
            <p>The requested problem report does not exist or you lack permission to view it.</p>
          </div>
        ) : (
          <div className="card">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                borderBottom: "1px solid var(--border-color)",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {problem.problemId}
                </span>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    marginTop: "8px",
                  }}
                >
                  {problem.title}
                </h1>
              </div>
              <StatusChip status={problem.status} />
            </div>

            {/* Problem Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
              }}
            >
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Category
                </span>
                <strong style={{ fontSize: "14px" }}>{problem.category}</strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Location
                </span>
                <strong style={{ fontSize: "14px" }}>{problem.location}</strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Reported On
                </span>
                <strong style={{ fontSize: "14px" }}>{formatDate(problem.createdAt)}</strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Assigned Technician
                </span>
                <strong style={{ fontSize: "14px" }}>
                  {problem.assignedPersonName || "Pending Staff Assignment"}
                </strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                Problem Description
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-main)",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                }}
              >
                {problem.description}
              </p>
            </div>

            {/* Evidence Image */}
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                Evidence Image
              </h3>
              {problem.evidenceImageUrl ? (
                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    maxWidth: "500px",
                  }}
                >
                  <img
                    src={problem.evidenceImageUrl}
                    alt="Problem Evidence"
                    style={{
                      width: "100%",
                      maxHeight: "350px",
                      objectFit: "contain",
                      backgroundColor: "#000000",
                      display: "block",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    backgroundColor: "#f8fafc",
                    border: "1px dashed var(--border-color)",
                    borderRadius: "8px",
                    color: "var(--text-muted)",
                    fontSize: "14px",
                  }}
                >
                  No evidence image was attached with this report.
                </div>
              )}
            </div>

            {/* Resolution Section */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                Resolution Status
              </h3>
              {problem.status === "Resolved" && problem.resolutionImageUrl ? (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#166534",
                      fontWeight: "700",
                      marginBottom: "12px",
                    }}
                  >
                    <span>✓ Problem Marked as Resolved</span>
                    {problem.resolvedAt && (
                      <span style={{ fontSize: "13px", fontWeight: "normal", color: "#15803d" }}>
                        ({formatDate(problem.resolvedAt)})
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "13px", color: "#166534", marginBottom: "12px" }}>
                    Resolution proof photo submitted by {problem.assignedPersonName || "the assigned technician"}:
                  </p>

                  <div
                    style={{
                      border: "1px solid #86efac",
                      borderRadius: "8px",
                      overflow: "hidden",
                      maxWidth: "500px",
                    }}
                  >
                    <img
                      src={problem.resolutionImageUrl}
                      alt="Resolution Proof"
                      style={{
                        width: "100%",
                        maxHeight: "350px",
                        objectFit: "contain",
                        backgroundColor: "#000000",
                        display: "block",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "16px 20px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                  }}
                >
                  <strong>Current Status: {problem.status}</strong>
                  <div style={{ marginTop: "4px" }}>
                    {problem.status === "Pending" &&
                      "Staff is reviewing this report and will assign a technician soon."}
                    {problem.status === "Assigned" &&
                      `Assigned to ${problem.assignedPersonName}. Waiting for work to start.`}
                    {problem.status === "In Progress" &&
                      `Work is actively in progress by ${problem.assignedPersonName}. Resolution image will appear here once work is marked completed.`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ProblemDetails;