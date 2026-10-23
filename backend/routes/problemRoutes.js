const express = require("express");
const router = express.Router();
const {
  submitProblem,
  getMyProblems,
  getMyStats,
  getStudentProblemDetails,
  getAllProblemsForStaff,
  getStaffStats,
  getStaffProblemDetails,
} = require("../controllers/problemController");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Student Routes
router.post(
  "/",
  protect,
  requireRole("Student"),
  upload.single("evidenceImage"),
  submitProblem
);
router.get("/my", protect, requireRole("Student"), getMyProblems);
router.get("/my/stats", protect, requireRole("Student"), getMyStats);
router.get("/my/:id", protect, requireRole("Student"), getStudentProblemDetails);

// Staff Routes
router.get("/staff", protect, requireRole("Staff"), getAllProblemsForStaff);
router.get("/staff/stats", protect, requireRole("Staff"), getStaffStats);
router.get("/staff/:id", protect, requireRole("Staff"), getStaffProblemDetails);

module.exports = router;
