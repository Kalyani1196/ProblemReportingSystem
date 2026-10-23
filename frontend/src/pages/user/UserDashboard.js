import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import ProblemTable from "../../components/ProblemTable";
import { problemApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentProblems, setRecentProblems] = useState([]);
  const [displayedProblems, setDisplayedProblems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await problemApi.getMyStats();
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentProblems(res.data.recent || []);
          setDisplayedProblems(res.data.recent || []);
        }
      } catch (err) {
        console.error("Error loading student dashboard:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleCategoryChange = async () => {
      if (selectedCategory === "All") {
        setDisplayedProblems(recentProblems);
        return;
      }
      try {
        setCategoryLoading(true);
        const res = await problemApi.getMyProblems({ category: selectedCategory });
        if (res.data.success) {
          setDisplayedProblems(res.data.problems || []);
        }
      } catch (err) {
        console.error("Error fetching category problems:", err);
      } finally {
        setCategoryLoading(false);
      }
    };

    if (!loading) {
      handleCategoryChange();
    }
  }, [selectedCategory, recentProblems, loading]);

  return (
    <DashboardLayout role="Student">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy-primary)" }}>
            Student Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Welcome back, {user?.name || "Student"}! Track and report campus maintenance issues.
          </p>
        </div>
        <Link to="/user/submit-problem" className="btn btn-primary">
          + Report New Problem
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-box">Loading your problem statistics...</div>
      ) : (
        <>
          {/* 5 Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-card-label">Total Submitted</span>
              <span className="stat-card-value">{stats.total}</span>
            </div>

            <div className="stat-card stat-card-pending">
              <span className="stat-card-label">Pending Review</span>
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

          {/* Recent Problems Section with Category Filter */}
          <div className="card">
            <div
              className="card-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h2 className="card-title">Recently Submitted Problems</h2>
                <p className="card-subtitle">
                  Your latest reported issues and their current resolution status
                </p>
              </div>
              <Link to="/user/my-problems" className="btn btn-secondary btn-sm">
                View All My Problems
              </Link>
            </div>

            {/* Category Filter Pills & Dropdown on Dashboard */}
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "var(--navy-primary)",
                  }}
                >
                  Filter by Category:
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label htmlFor="user-dash-cat" style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                    Category:
                  </label>
                  <select
                    id="user-dash-cat"
                    className="form-control"
                    style={{ width: "auto", minWidth: "160px", padding: "6px 12px", height: "36px", fontSize: "13px" }}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="category-filter-bar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory !== "All" && (
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>
                Showing <strong>{displayedProblems.length}</strong> problem(s) in category:{" "}
                <span style={{ color: "var(--navy-primary)", fontWeight: "700", backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "4px" }}>
                  {selectedCategory}
                </span>
                <button
                  type="button"
                  style={{
                    marginLeft: "12px",
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                  onClick={() => setSelectedCategory("All")}
                >
                  Clear Category Filter
                </button>
              </div>
            )}

            {categoryLoading ? (
              <div className="loading-box" style={{ padding: "24px" }}>
                Filtering {selectedCategory} problems...
              </div>
            ) : (
              <ProblemTable problems={displayedProblems} basePath="/user/problem" />
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default UserDashboard;