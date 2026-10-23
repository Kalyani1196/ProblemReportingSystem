const express = require("express");
const router = express.Router();
const {
  prepareAssignment,
  confirmAssignment,
} = require("../controllers/assignmentController");
const { protect, requireRole } = require("../middleware/auth");

// Staff Assignment Routes
router.post("/prepare", protect, requireRole("Staff"), prepareAssignment);
router.post("/confirm", protect, requireRole("Staff"), confirmAssignment);

module.exports = router;
