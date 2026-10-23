import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontSize: "16px", color: "var(--text-muted)" }}>
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginTarget = allowedRole === "Staff" ? "/staff-login" : "/student-login";
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to appropriate dashboard based on actual role
    const targetDashboard = user?.role === "Staff" ? "/staff/dashboard" : "/user/dashboard";
    return <Navigate to={targetDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
