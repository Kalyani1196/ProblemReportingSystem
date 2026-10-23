import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-page)",
        padding: "24px",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "500px",
          textAlign: "center",
          padding: "48px 32px",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            fontWeight: "900",
            color: "var(--primary)",
            lineHeight: "1",
            marginBottom: "16px",
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          The page or resource you are looking for does not exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home / Login
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
