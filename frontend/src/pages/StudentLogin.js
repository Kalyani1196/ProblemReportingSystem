import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      // Strictly enforce expectedRole: "Student" on backend
      const user = await login(email.trim(), password, "Student");

      if (user.role !== "Student") {
        setError(
          `Access denied. This account is registered as ${user.role}. Please use the Staff Login page.`
        );
        return;
      }

      navigate("/user/dashboard");
    } catch (err) {
      console.error("Student login failed:", err);
      const message =
        err.response?.data?.message ||
        "Invalid email or password. Please verify your student credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Portal Switcher Tabs */}
        <div className="auth-tabs">
          <Link to="/student-login" className="auth-tab active">
            Student Portal
          </Link>
          <Link to="/staff-login" className="auth-tab">
            Staff Portal
          </Link>
        </div>

        <div className="auth-header">
          <div className="auth-logo-badge student-badge">S</div>
          <h1 className="auth-title">Student Login</h1>
          <p className="auth-subtitle">
            Sign in to report campus maintenance issues and track resolution progress
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <div>{error}</div>
            {error.includes("Staff") && (
              <div style={{ marginTop: "8px" }}>
                <Link to="/staff-login" className="btn btn-secondary btn-sm">
                  Go to Staff Login →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="student-email">
              Student Email <span className="required">*</span>
            </label>
            <input
              id="student-email"
              type="email"
              className="form-control"
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="student-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="student-password"
              type="password"
              className="form-control"
              placeholder="Enter your student account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login as Student"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account yet?{" "}
          <Link to="/register">Create a Student Account</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
