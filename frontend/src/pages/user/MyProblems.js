import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import StatusChip from "../../components/StatusChip";
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

function MyProblems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyProblems = async () => {
      try {
        setLoading(true);
        const res = await problemApi.getMyProblems();
        if (res.data.success) {
          setProblems(res.data.problems);
          setFilteredProblems(res.data.problems);
        }
      } catch (err) {
        console.error("Error loading my problems:", err);
        setError("Failed to load your reported problems. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProblems();
  }, []);

  // Multi-criteria filter: Category + Status + Search Query
  useEffect(() => {
    let result = problems;

    // Category filter
    if (categoryFilter !== "All") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Keyword Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.problemId?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    setFilteredProblems(result);
  }, [categoryFilter, statusFilter, searchQuery, problems]);

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

  const resetFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setSearchQuery("");
  };

  const isFiltered =
    categoryFilter !== "All" || statusFilter !== "All" || searchQuery.trim() !== "";

  return (
    <DashboardLayout role="Student">
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
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--navy-primary)" }}>
            My Reported Problems
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Track progress and view resolution photos for all problems you submitted.
          </p>
        </div>

        <Link to="/user/submit-problem" className="btn btn-primary">
          + Report Issue
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Interactive Category Filter Pills */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--navy-primary)", marginBottom: "8px" }}>
          Filter by Category:
        </div>
        <div className="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${categoryFilter === cat ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === "All" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Controls Toolbar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          backgroundColor: "#ffffff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          marginBottom: "24px",
          boxShadow: "var(--shadow-sm)",
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label className="form-label" style={{ fontSize: "12px" }}>
            Category Dropdown
          </label>
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === "All" ? "All Statuses" : st}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
              style={{ width: "100%", height: "42px" }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Summary */}
      {isFiltered && (
        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
          Showing <strong>{filteredProblems.length}</strong> problem(s)
          {categoryFilter !== "All" && (
            <span> in Category: <strong>{categoryFilter}</strong></span>
          )}
          {statusFilter !== "All" && (
            <span> with Status: <strong>{statusFilter}</strong></span>
          )}
          {searchQuery && (
            <span> matching: "<strong>{searchQuery}</strong>"</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-box">Loading your reported problems...</div>
      ) : filteredProblems.length === 0 ? (
        <div className="empty-state">
          <h3>No Problems Found</h3>
          <p>
            {isFiltered
              ? `No problems match category "${categoryFilter}" with status "${statusFilter}".`
              : "You haven't reported any problems yet."}
          </p>
          {isFiltered ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
            >
              Clear Category / Status Filters
            </button>
          ) : (
            <Link to="/user/submit-problem" className="btn btn-primary">
              Submit Your First Problem
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredProblems.map((problem) => {
            const id = problem.problemId || problem._id;
            return (
              <div
                key={id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "box-shadow 0.2s, transform 0.15s",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/user/problem/${id}`)}
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
                      lineHeight: "1.4",
                    }}
                  >
                    {problem.title}
                  </h3>

                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    <strong>Category:</strong>{" "}
                    <span
                      style={{
                        color: "var(--navy-primary)",
                        fontWeight: "600",
                        backgroundColor: "#f1f5f9",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {problem.category}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    <strong>Location:</strong> {problem.location}
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    <strong>Reported:</strong> {formatDate(problem.createdAt)}
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
                      marginBottom: "16px",
                    }}
                  >
                    {problem.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {problem.assignedPersonName ? `Assigned to: ${problem.assignedPersonName}` : "Pending assignment"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/problem/${id}`);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyProblems;