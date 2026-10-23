import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

function DashboardLayout({ role, children }) {
  return (
    <div className="dashboard-layout">
      <Navbar role={role} />
      <Sidebar role={role} />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}

export default DashboardLayout;
