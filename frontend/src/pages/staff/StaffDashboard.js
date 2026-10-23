import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ProblemTable from "../../components/ProblemTable";
import { problemApi } from "../../services/api";

const CATEGORIES = [
  "All",
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Infrastructure",
  "Equipment",
  "Internet/Networking",
  "Other",
];

const STATUSES = ["All", "Pending", "Assigned", "In Progress", "Resolved"];

function StaffDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch summary stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await problemApi.getStaffStats();
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Error loading staff stats:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch problems list whenever search/filters change
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setTableLoading(true);
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== "All") params.category = category;
        if (status !== "All") params.status = status;

        const res = await problemApi.getStaffProblems(params);
        if (res.data.success) {
          setProblems(res.data.problems);
        }
      } catch (err) {
        console.error("Error fetching staff problems:", err);
      } finally {
        setTableLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(fetchProblems, 250);
    return () => clearTimeout(timer);
  }, [search, category, status]);

  return (
    <DashboardLayout role="Staff">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
          Staff Administration Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Review reported issues, assign personnel via WhatsApp, and track resolution proofs.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-box">Loading dashboard statistics...</div>
      ) : (
        <>
          {/* 5 Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card-label">Total Problems</span>
              <span className="stat-card-value">{stats.total}</span>
            </div>

            <div className="stat-card stat-card-pending">
              <span className="stat-card-label">Pending Assignment</span>
              <span className="stat-card-value" style={{ color: "var(--status-pending-text)" }}>
                {stats.pending}
              </span>
            </div>

            <div className="stat-card stat-card-assigned">
              <span className="stat-card-label">Assigned</span>
              <span className="stat-card-value" style={{ color: "var(--status-assigned-text)" }}>
                {stats.assigned}
              </span>
            </div>

            <div className="stat-card stat-card-progress">
              <span className="stat-card-label">In Progress</span>
              <span className="stat-card-value" style={{ color: "var(--status-progress-text)" }}>
                {stats.inProgress}
              </span>
            </div>

            <div className="stat-card stat-card-resolved">
              <span className="stat-card-label">Resolved</span>
              <span className="stat-card-value" style={{ color: "var(--status-resolved-text)" }}>
                {stats.resolved}
              </span>
            </div>
          </div>

          {/* Search, Filter & Problems Table */}
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 className="card-title">Reported Campus Problems</h2>
                <p className="card-subtitle">
                  Click on any problem to view details and assign a concerned person
                </p>
              </div>

              <Link to="/staff/problems" className="btn btn-secondary btn-sm">
                View Full Management Table
              </Link>
            </div>

            {/* Quick Category Filter Pills */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "var(--navy-primary)",
                  marginBottom: "8px",
                }}
              >
                Filter by Category:
              </div>
              <div className="category-filter-bar">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`category-pill ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c === "All" ? "All Categories" : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter controls */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  Search by Keyword
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search title, location, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  Filter by Category
                </label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  Filter by Status
                </label>
                <select
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Statuses" : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tableLoading ? (
              <div className="loading-box">Filtering problem reports...</div>
            ) : (
              <ProblemTable problems={problems} basePath="/staff/problem" />
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default StaffDashboard;