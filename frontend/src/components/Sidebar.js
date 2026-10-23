import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentRole = role || user?.role || "Student";

  const handleLogout = () => {
    const destination = currentRole === "Staff" ? "/staff-login" : "/student-login";
    logout();
    navigate(destination);
  };

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink
            to={
              currentRole === "Student"
                ? "/user/dashboard"
                : "/staff/dashboard"
            }
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
        </li>

        {currentRole === "Student" && (
          <>
            <li className="sidebar-item">
              <NavLink
                to="/user/submit-problem"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                Submit Problem
              </NavLink>
            </li>

            <li className="sidebar-item">
              <NavLink
                to="/user/my-problems"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                My Problems
              </NavLink>
            </li>
          </>
        )}

        {currentRole === "Staff" && (
          <li className="sidebar-item">
            <NavLink
              to="/staff/problems"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              Reported Problems
            </NavLink>
          </li>
        )}
      </ul>

      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
