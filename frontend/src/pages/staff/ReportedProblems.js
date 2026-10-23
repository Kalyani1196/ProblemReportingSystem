import React, { useEffect, useState } from "react";
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

function ReportedProblems() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category !== "All") params.category = category;
      if (status !== "All") params.status = status;

      const res = await problemApi.getStaffProblems(params);
      if (res.data.success) {
        setProblems(res.data.problems);
      }
    } catch (err) {
      console.error("Error fetching reported problems:", err);
      setError("Failed to load problem reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProblems, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status]);

  return (
    <DashboardLayout role="Staff">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
          All Reported Problems
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Full repository of maintenance requests across all campus departments.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {/* Interactive Category Filter Pills */}
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

        {/* Search & Filter Toolbar */}
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
              Search
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, location, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "12px" }}>
              Category
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
              Status
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

        {loading ? (
          <div className="loading-box">Loading problem reports...</div>
        ) : (
          <ProblemTable problems={problems} basePath="/staff/problem" />
        )}
      </div>
    </DashboardLayout>
  );
}

export default ReportedProblems;