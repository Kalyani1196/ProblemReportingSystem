import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StatusChip from "../../components/StatusChip";
import { publicUpdateApi } from "../../services/api";

function UpdateProblem() {
  const { id, problemId, token } = useParams();
  const targetId = (id || problemId || "").trim();
  const cleanToken = (token || "").trim();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Resolution image state
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);

  const fetchProblemData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await publicUpdateApi.getProblem(targetId, cleanToken);
      if (res.data.success) {
        setProblem(res.data.problem);
      }
    } catch (err) {
      console.error("Error fetching problem via public token link:", err);
      setError(
        err.response?.data?.message ||
          "Invalid or expired status link. Please make sure you used the exact link sent on WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, cleanToken]);

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");

      const res = await publicUpdateApi.startWork(targetId, cleanToken);
      if (res.data.success) {
        setSuccessMsg("Work status has been updated to 'In Progress'.");
        setProblem((prev) => ({
          ...prev,
          status: "In Progress",
          startedAt: res.data.problem.startedAt,
        }));
      }
    } catch (err) {
      console.error("Error starting work:", err);
      setError(
        err.response?.data?.message || "Failed to start work. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      setResolutionFile(file);
      setResolutionPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleRemoveResolutionImage = () => {
    setResolutionFile(null);
    if (resolutionPreview) {
      URL.revokeObjectURL(resolutionPreview);
      setResolutionPreview(null);
    }
  };

  const handleMarkCompleted = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resolutionFile) {
      setError(
        "A resolution image is strictly required before marking the problem as completed."
      );
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("resolutionImage", resolutionFile);

      const res = await publicUpdateApi.resolveProblem(targetId, cleanToken, formData);
      if (res.data.success) {
        setSuccessMsg("Problem successfully marked as Resolved! Proof image uploaded.");
        setProblem((prev) => ({
          ...prev,
          status: "Resolved",
          resolutionImageUrl: res.data.problem.resolutionImageUrl,
          resolvedAt: res.data.problem.resolvedAt,
        }));
        handleRemoveResolutionImage();
      }
    } catch (err) {
      console.error("Resolution failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload resolution proof. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-page)",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Top Header Card */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "24px",
            backgroundColor: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "18px",
              marginBottom: "8px",
            }}
          >
            P
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "var(--secondary)" }}>
            Campus Problem Resolution Portal
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
            Authorized technician status-update page
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {loading ? (
          <div className="card loading-box">Validating secure update link...</div>
        ) : !problem ? (
          <div className="card empty-state">
            <h3>Invalid or Expired Link</h3>
            <p>
              This status-update link is invalid or has expired. Please verify
              the exact URL received in your WhatsApp assignment message.
            </p>
          </div>
        ) : (
          <div className="card">
            {/* Header with Title and Status */}
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
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--primary)",
                    backgroundColor: "var(--primary-light)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {problem.problemId}
                </span>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    marginTop: "6px",
                  }}
                >
                  {problem.title}
                </h2>
              </div>
              <StatusChip status={problem.status} />
            </div>

            {/* Problem Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px",
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
                  Assigned Person
                </span>
                <strong style={{ fontSize: "14px" }}>{problem.assignedPersonName}</strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Assigned Date
                </span>
                <strong style={{ fontSize: "14px" }}>{formatDate(problem.assignedAt)}</strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>
                Problem Description
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-main)",
                  lineHeight: "1.6",
                  backgroundColor: "#ffffff",
                  padding: "12px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {problem.description}
              </p>
            </div>

            {/* Evidence Image (if attached) */}
            {problem.evidenceImageUrl && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>
                  Reported Evidence Photo
                </h3>
                <div
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    maxWidth: "450px",
                  }}
                >
                  <img
                    src={problem.evidenceImageUrl}
                    alt="Reported Issue Evidence"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain",
                      backgroundColor: "#000000",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            )}

            {/* WORKFLOW ACTIONS */}
            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "24px",
                marginTop: "16px",
              }}
            >
              {/* STAGE 1: Assigned -> Start Work */}
              {problem.status === "Assigned" && (
                <div
                  style={{
                    backgroundColor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#1e40af", marginBottom: "6px" }}>
                    Start Work
                  </h3>
                  <p style={{ fontSize: "14px", color: "#1d4ed8", marginBottom: "16px" }}>
                    Click the button below when you begin working on this maintenance request.
                    This will notify staff and students that resolution is in progress.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleStartWork}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Updating..." : "Start Work"}
                  </button>
                </div>
              )}

              {/* STAGE 2: In Progress -> Upload Resolution Photo & Mark Completed */}
              {problem.status === "In Progress" && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
                    Complete Problem & Submit Proof
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
                    Upload a photograph showing that the repair or task is fully finished.
                    A resolution image is <strong>mandatory</strong> to mark this problem resolved.
                  </p>

                  <form onSubmit={handleMarkCompleted}>
                    <input
                      type="file"
                      id="resolutionFileInput"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageSelect}
                    />

                    {!resolutionPreview ? (
                      <label
                        htmlFor="resolutionFileInput"
                        className="btn btn-secondary"
                        style={{ display: "inline-block", cursor: "pointer", marginBottom: "16px" }}
                      >
                        Choose Resolution Photo
                      </label>
                    ) : (
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            overflow: "hidden",
                            display: "inline-block",
                          }}
                        >
                          <img
                            src={resolutionPreview}
                            alt="Resolution Preview"
                            style={{
                              display: "block",
                              maxWidth: "320px",
                              maxHeight: "220px",
                              objectFit: "contain",
                              backgroundColor: "#000000",
                            }}
                          />
                        </div>
                        <div style={{ marginTop: "8px" }}>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={handleRemoveResolutionImage}
                          >
                            Change / Remove Photo
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={actionLoading || !resolutionFile}
                      >
                        {actionLoading ? "Uploading & Resolving..." : "Mark Completed"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STAGE 3: Resolved -> Read-only confirmation */}
              {problem.status === "Resolved" && (
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      color: "#ffffff",
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginBottom: "12px",
                    }}
                  >
                    ✓
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#166534", marginBottom: "4px" }}>
                    Problem Marked as Resolved
                  </h3>
                  <p style={{ fontSize: "14px", color: "#15803d", marginBottom: "18px" }}>
                    Work has been completed and verified. Completed on {formatDate(problem.resolvedAt)}.
                  </p>

                  {problem.resolutionImageUrl && (
                    <div
                      style={{
                        margin: "0 auto",
                        maxWidth: "450px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #86efac",
                      }}
                    >
                      <img
                        src={problem.resolutionImageUrl}
                        alt="Resolution Proof"
                        style={{
                          width: "100%",
                          maxHeight: "320px",
                          objectFit: "contain",
                          backgroundColor: "#000000",
                          display: "block",
                        }}
                      />
                    </div>
                  )}

                  <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "14px" }}>
                    This status update link is now archived and read-only.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateProblem;