import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar({ role }) {
  const { user } = useAuth();
  const currentRole = role || user?.role || "User";

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="navbar-brand-icon">P</div>
        <span className="navbar-brand-title">
          Problem Reporting & Tracking System
        </span>
      </div>

      <div className="navbar-user-info">
        {user?.name && <span className="navbar-user-name">{user.name}</span>}
        <span
          className={`navbar-role-pill ${
            currentRole === "Staff" ? "staff" : ""
          }`}
        >
          {currentRole}
        </span>
      </div>
    </header>
  );
}

export default Navbar;
