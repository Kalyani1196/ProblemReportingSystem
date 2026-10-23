import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function StaffLogin() {
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
      // Strictly enforce expectedRole: "Staff" on backend
      const user = await login(email.trim(), password, "Staff");

      if (user.role !== "Staff") {
        setError(
          `Access denied. This account is registered as ${user.role}. Please use the Student Login page.`
        );
        return;
      }

      navigate("/staff/dashboard");
    } catch (err) {
      console.error("Staff login failed:", err);
      const message =
        err.response?.data?.message ||
        "Invalid email or password. Please verify your staff credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card staff-card-accent">
        {/* Portal Switcher Tabs */}
        <div className="auth-tabs">
          <Link to="/student-login" className="auth-tab">
            Student Portal
          </Link>
          <Link to="/staff-login" className="auth-tab active staff-tab">
            Staff Portal
          </Link>
        </div>

        <div className="auth-header">
          <div className="auth-logo-badge staff-badge">M</div>
          <h1 className="auth-title">Staff Administration Login</h1>
          <p className="auth-subtitle">
            Sign in to review complaints, dispatch technicians via WhatsApp, and verify work
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <div>{error}</div>
            {error.includes("Student") && (
              <div style={{ marginTop: "8px" }}>
                <Link to="/student-login" className="btn btn-secondary btn-sm">
                  Go to Student Login →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="staff-email">
              Staff Email <span className="required">*</span>
            </label>
            <input
              id="staff-email"
              type="email"
              className="form-control"
              placeholder="e.g. staff@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="staff-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="staff-password"
              type="password"
              className="form-control"
              placeholder="Enter your staff account password"
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
            {loading ? "Signing in..." : "Login as Staff"}
          </button>
        </form>

        <div className="auth-footer">
          Need an account?{" "}
          <Link to="/register">Register as Staff</Link>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;
