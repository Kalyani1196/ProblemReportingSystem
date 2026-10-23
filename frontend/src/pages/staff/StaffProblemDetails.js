import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatusChip from "../../components/StatusChip";
import { problemApi, assignmentApi } from "../../services/api";

function StaffProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Assignment Form State
  const [personName, setPersonName] = useState("");
  const [personPhone, setPersonPhone] = useState("+91");
  const [assignLoading, setAssignLoading] = useState(false);
  const [preparedData, setPreparedData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showReassignForm, setShowReassignForm] = useState(false);

  const handleCopyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fetchProblemDetails = async () => {
    try {
      setLoading(true);
      const res = await problemApi.getStaffProblemDetails(id);
      if (res.data.success) {
        setProblem(res.data.problem);
        if (res.data.problem.assignedPersonName) {
          setPersonName(res.data.problem.assignedPersonName);
        }
        if (res.data.problem.assignedPersonPhone) {
          setPersonPhone(res.data.problem.assignedPersonPhone);
        }
      }
    } catch (err) {
      console.error("Error loading problem details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load problem details. Verify that you are authorized as Staff."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Step 1: Staff Prepares Assignment and Opens WhatsApp Click-to-Chat
  const handlePrepareAndOpenWhatsApp = async (e) => {
    e.preventDefault();
    setError("");
    setActionSuccess("");

    if (!personName.trim()) {
      setError("Please enter the concerned person's name.");
      return;
    }

    if (!personPhone.trim() || personPhone.trim() === "+91") {
      setError("Please enter a valid WhatsApp phone number with country code.");
      return;
    }

    try {
      setAssignLoading(true);
      const res = await assignmentApi.prepare({
        problemId: problem.problemId,
        assignedPersonName: personName.trim(),
        assignedPersonPhone: personPhone.trim(),
      });

      if (res.data.success) {
        const data = res.data.data;
        setPreparedData(data);
        setShowReassignForm(false);

        // Update local problem state immediately so UI updates without page reload
        setProblem((prev) => ({
          ...prev,
          status: "Assigned",
          assignedPersonName: data.assignedPersonName,
          assignedPersonPhone: data.assignedPersonPhone,
          assignedAt: new Date().toISOString(),
        }));

        // Open WhatsApp Web / App with prefilled message
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        }

        setActionSuccess(
          "Assignment successfully recorded in database! WhatsApp opened with the message. The status-update link is now live and working."
        );
      }
    } catch (err) {
      console.error("Assignment preparation failed:", err);
      setError(
        err.response?.data?.message ||
          "Could not generate assignment link. Please check inputs."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // Step 2: Staff confirms assignment after sending WhatsApp message
  const handleConfirmAssignment = async () => {
    if (!preparedData) return;

    try {
      setAssignLoading(true);
      setError("");

      const res = await assignmentApi.confirm({
        problemId: problem.problemId,
        assignedPersonName: preparedData.assignedPersonName,
        assignedPersonPhone: preparedData.assignedPersonPhone,
        tokenHash: preparedData.tokenHash,
      });

      if (res.data.success) {
        setActionSuccess(
          `Assignment confirmed! Problem status is now 'Assigned' to ${preparedData.assignedPersonName}.`
        );
        setPreparedData(null);
        // Refresh details to show updated status
        await fetchProblemDetails();
      }
    } catch (err) {
      console.error("Failed to confirm assignment:", err);
      setError(
        err.response?.data?.message ||
          "Could not confirm assignment in system. Please try again."
      );
    } finally {
      setAssignLoading(false);
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
    <DashboardLayout role="Staff">
      <div style={{ maxWidth: "960px" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/staff/problems")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to All Problems
        </button>

        {error && <div className="alert alert-error">{error}</div>}
        {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

        {loading ? (
          <div className="loading-box">Loading problem report...</div>
        ) : !problem ? (
          <div className="empty-state">
            <h3>Problem Not Found</h3>
            <p>The requested problem report does not exist.</p>
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

            {/* Info Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                  Reported By
                </span>
                <strong style={{ fontSize: "14px" }}>
                  {problem.reportedBy?.name || "Student"} ({problem.reportedBy?.email || "N/A"})
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                  Date Reported
                </span>
                <strong style={{ fontSize: "14px" }}>{formatDate(problem.createdAt)}</strong>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                Description
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
                    padding: "16px",
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

            {/* ASSIGNMENT & WHATSAPP SECTION */}
            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "24px",
                marginTop: "24px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>
                Staff WhatsApp Assignment
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "18px" }}>
                Assign the responsible person and dispatch details directly via WhatsApp Click-to-Chat.
              </p>

              {(problem.status === "Pending" || showReassignForm) && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--navy-primary)" }}>
                      {showReassignForm ? "Reassign or Generate New Link" : "Assign Responsible Person"}
                    </h4>
                    {showReassignForm && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowReassignForm(false)}
                      >
                        Cancel Reassignment
                      </button>
                    )}
                  </div>

                  <form onSubmit={handlePrepareAndOpenWhatsApp}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="personName">
                          Concerned Person Name <span className="required">*</span>
                        </label>
                        <input
                          id="personName"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Ramesh Sharma (Electrician)"
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="personPhone">
                          WhatsApp Phone Number (with Country Code) <span className="required">*</span>
                        </label>
                        <input
                          id="personPhone"
                          type="text"
                          className="form-control"
                          placeholder="e.g. +919876543210"
                          value={personPhone}
                          onChange={(e) => setPersonPhone(e.target.value)}
                          required
                        />
                        <span className="form-help">
                          Include country code without spaces (e.g., +91 for India).
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <button
                        type="submit"
                        className="btn btn-whatsapp"
                        disabled={assignLoading}
                      >
                        {assignLoading ? "Generating Link & Saving..." : "Open WhatsApp with Assignment"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Active Link Box whenever preparedData is available */}
              {preparedData && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "18px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ color: "#166534", fontSize: "18px", fontWeight: "bold" }}>✓</span>
                    <h4 style={{ color: "#166534", margin: 0, fontSize: "16px" }}>
                      Active Status-Update Link for Technician
                    </h4>
                  </div>
                  <p style={{ fontSize: "13px", color: "#15803d", marginBottom: "12px" }}>
                    This unique status link has been saved to the database and is <strong>live and ready</strong>.
                    The technician does not need an account or login.
                  </p>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "12px" }}>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={preparedData.updateLink}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        backgroundColor: "#ffffff",
                        flex: "1",
                        minWidth: "260px",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopyLink(preparedData.updateLink)}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <a
                      href={preparedData.updateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Open / Test Link →
                    </a>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {preparedData.whatsappUrl && (
                      <a
                        href={preparedData.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                      >
                        Resend via WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={handleConfirmAssignment}
                      disabled={assignLoading}
                    >
                      {assignLoading ? "Confirming..." : "Confirm Assignment in System"}
                    </button>
                  </div>
                </div>
              )}

              {problem.status !== "Pending" && (
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--navy-primary)" }}>
                      Current Assignment Status: <StatusChip status={problem.status} />
                    </div>

                    {problem.status === "Assigned" && !showReassignForm && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowReassignForm(true)}
                      >
                        Reassign / Generate New Link
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                        Assigned To
                      </span>
                      <strong>{problem.assignedPersonName}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                        Contact Phone
                      </span>
                      <strong>+{problem.assignedPersonPhone}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                        Assigned On
                      </span>
                      <strong>{formatDate(problem.assignedAt)}</strong>
                    </div>

                    {problem.startedAt && (
                      <div>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                          Work Started
                        </span>
                        <strong>{formatDate(problem.startedAt)}</strong>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "14px" }}>
                    {problem.status === "Assigned" &&
                      "Status will automatically update to 'In Progress' when the assigned person opens their link and clicks 'Start Work'."}
                    {problem.status === "In Progress" &&
                      "Work is underway. The concerned person will upload a completion photo to mark this issue 'Resolved'."}
                  </p>
                </div>
              )}
            </div>

            {/* RESOLUTION SECTION FOR STAFF */}
            {problem.status === "Resolved" && (
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "24px",
                  marginTop: "24px",
                }}
              >
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
                      marginBottom: "10px",
                    }}
                  >
                    <span>✓ Work Completed and Resolved</span>
                    <span style={{ fontSize: "13px", fontWeight: "normal", color: "#15803d" }}>
                      ({formatDate(problem.resolvedAt)})
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#166534", marginBottom: "14px" }}>
                    Verified resolution photo uploaded by {problem.assignedPersonName}:
                  </p>

                  {problem.resolutionImageUrl && (
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
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default StaffProblemDetails;