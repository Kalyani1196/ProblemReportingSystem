import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import StudentLogin from "./pages/StudentLogin";
import StaffLogin from "./pages/StaffLogin";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/UserDashboard";
import SubmitProblem from "./pages/user/SubmitProblem";
import MyProblems from "./pages/user/MyProblems";
import ProblemDetails from "./pages/user/ProblemDetails";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ReportedProblems from "./pages/staff/ReportedProblems";
import StaffProblemDetails from "./pages/staff/StaffProblemDetails";
import UpdateProblem from "./pages/update/UpdateProblem";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/" element={<Navigate to="/student-login" replace />} />
        <Route path="/login" element={<Navigate to="/student-login" replace />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Student Protected Routes */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRole="Student">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={<Navigate to="/user/dashboard" replace />}
        />

        <Route
          path="/user/submit-problem"
          element={
            <ProtectedRoute allowedRole="Student">
              <SubmitProblem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/submit-problem"
          element={<Navigate to="/user/submit-problem" replace />}
        />

        <Route
          path="/user/my-problems"
          element={
            <ProtectedRoute allowedRole="Student">
              <MyProblems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-problems"
          element={<Navigate to="/user/my-problems" replace />}
        />

        <Route
          path="/user/problem/:id"
          element={
            <ProtectedRoute allowedRole="Student">
              <ProblemDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/problem/:id"
          element={<Navigate to="/user/problem/:id" replace />}
        />

        {/* Staff Protected Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRole="Staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/problems"
          element={
            <ProtectedRoute allowedRole="Staff">
              <ReportedProblems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/problem/:id"
          element={
            <ProtectedRoute allowedRole="Staff">
              <StaffProblemDetails />
            </ProtectedRoute>
          }
        />

        {/* Public Status Update Route for Assigned Person */}
        <Route path="/update/:id/:token" element={<UpdateProblem />} />
        <Route path="/update/:problemId/:token" element={<UpdateProblem />} />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
