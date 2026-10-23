const express = require("express");
const router = express.Router();
const {
  getPublicProblemDetails,
  startWork,
  resolveProblem,
} = require("../controllers/publicUpdateController");
const upload = require("../middleware/upload");

// Public Status Update Routes (No account needed; secured with unique token)
router.get("/:problemId/:token", getPublicProblemDetails);
router.post("/:problemId/:token/start", startWork);
router.post(
  "/:problemId/:token/resolve",
  upload.single("resolutionImage"),
  resolveProblem
);

module.exports = router;
