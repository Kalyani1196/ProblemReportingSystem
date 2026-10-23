const crypto = require("crypto");
const Problem = require("../models/Problem");
const { uploadImageBuffer } = require("../config/cloudinary");

/**
 * Validate status token and retrieve problem
 */
const validateTokenAndGetProblem = async (problemId, token) => {
  if (!problemId || !token) {
    return null;
  }

  const cleanProblemId = String(problemId).trim();
  const cleanToken = String(token).trim();

  // Hash the incoming raw token using SHA-256
  const incomingHash = crypto.createHash("sha256").update(cleanToken).digest("hex");

  const query = cleanProblemId.startsWith("PRB-") ? { problemId: cleanProblemId } : { _id: cleanProblemId };

  // Explicitly select statusTokenHash for verification
  const problem = await Problem.findOne(query).select("+statusTokenHash");

  if (!problem || !problem.statusTokenHash) {
    return null;
  }

  try {
    const storedBuf = Buffer.from(problem.statusTokenHash, "hex");
    const incomingBuf = Buffer.from(incomingHash, "hex");

    if (storedBuf.length !== incomingBuf.length || storedBuf.length === 0) {
      return null;
    }

    const isMatch = crypto.timingSafeEqual(storedBuf, incomingBuf);
    if (!isMatch) {
      return null;
    }

    return problem;
  } catch (err) {
    console.error("Token verification error:", err);
    return null;
  }
};

/**
 * @desc   Fetch problem details for public status update page
 * @route  GET /api/public/update/:problemId/:token
 * @access Public (Token protected)
 */
const getPublicProblemDetails = async (req, res, next) => {
  try {
    const { problemId, token } = req.params;

    const problem = await validateTokenAndGetProblem(problemId, token);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Invalid, unauthorized, or expired status-update link.",
      });
    }

    // Return only necessary details, excluding token hash and internal reporter IDs
    res.status(200).json({
      success: true,
      problem: {
        problemId: problem.problemId,
        title: problem.title,
        category: problem.category,
        location: problem.location,
        description: problem.description,
        evidenceImageUrl: problem.evidenceImageUrl,
        resolutionImageUrl: problem.resolutionImageUrl,
        status: problem.status,
        assignedPersonName: problem.assignedPersonName,
        assignedAt: problem.assignedAt,
        startedAt: problem.startedAt,
        resolvedAt: problem.resolvedAt,
        createdAt: problem.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Transition status from Assigned to In Progress
 * @route  POST /api/public/update/:problemId/:token/start
 * @access Public (Token protected)
 */
const startWork = async (req, res, next) => {
  try {
    const { problemId, token } = req.params;

    const problem = await validateTokenAndGetProblem(problemId, token);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Invalid, unauthorized, or expired status-update link.",
      });
    }

    if (problem.status !== "Assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot start work. Current problem status is '${problem.status}'. Work can only be started when status is 'Assigned'.`,
      });
    }

    problem.status = "In Progress";
    problem.startedAt = new Date();
    await problem.save();

    res.status(200).json({
      success: true,
      message: "Work has been marked as In Progress.",
      problem: {
        problemId: problem.problemId,
        status: problem.status,
        startedAt: problem.startedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Upload resolution image and transition status from In Progress to Resolved
 * @route  POST /api/public/update/:problemId/:token/resolve
 * @access Public (Token protected)
 */
const resolveProblem = async (req, res, next) => {
  try {
    const { problemId, token } = req.params;

    const problem = await validateTokenAndGetProblem(problemId, token);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Invalid, unauthorized, or expired status-update link.",
      });
    }

    if (problem.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete problem. Current problem status is '${problem.status}'. Work must be 'In Progress' before marking completed.`,
      });
    }

    // Strictly enforce resolution image requirement
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A resolution image is strictly required before marking the problem as completed.",
      });
    }

    // Upload to Cloudinary (or fallback)
    let uploadResult;
    try {
      uploadResult = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "resolution",
        req
      );
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: `Failed to upload resolution image: ${uploadError.message}`,
      });
    }

    problem.status = "Resolved";
    problem.resolutionImageUrl = uploadResult.url;
    problem.resolutionImagePublicId = uploadResult.publicId;
    problem.resolvedAt = new Date();

    await problem.save();

    res.status(200).json({
      success: true,
      message: "Problem has been successfully marked as Resolved.",
      problem: {
        problemId: problem.problemId,
        status: problem.status,
        resolutionImageUrl: problem.resolutionImageUrl,
        resolvedAt: problem.resolvedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicProblemDetails,
  startWork,
  resolveProblem,
};
