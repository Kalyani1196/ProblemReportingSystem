const Problem = require("../models/Problem");
const { uploadImageBuffer } = require("../config/cloudinary");

/**
 * Generate a unique readable problem ID
 * e.g., PRB-481920
 */
const generateUniqueProblemId = async () => {
  let isUnique = false;
  let candidateId = "";

  while (!isUnique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    candidateId = `PRB-${randomDigits}`;
    const existing = await Problem.findOne({ problemId: candidateId });
    if (!existing) {
      isUnique = true;
    }
  }

  return candidateId;
};

/**
 * @desc   Submit a new problem
 * @route  POST /api/problems
 * @access Private (Student)
 */
const submitProblem = async (req, res, next) => {
  try {
    const { title, category, location, description } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (title, category, location, description).",
      });
    }

    const validCategories = [
      "Electrical",
      "Plumbing",
      "Cleaning",
      "Infrastructure",
      "Equipment",
      "Internet/Networking",
      "Other",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    let evidenceImageUrl = null;
    let evidenceImagePublicId = null;

    // Process image upload if provided
    if (req.file) {
      try {
        const uploadResult = await uploadImageBuffer(
          req.file.buffer,
          req.file.originalname,
          "evidence",
          req
        );
        evidenceImageUrl = uploadResult.url;
        evidenceImagePublicId = uploadResult.publicId;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: `Failed to upload evidence image: ${uploadError.message}`,
        });
      }
    }

    const problemId = await generateUniqueProblemId();

    const newProblem = await Problem.create({
      problemId,
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      evidenceImageUrl,
      evidenceImagePublicId,
      reportedBy: req.user._id,
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Problem reported successfully.",
      problem: newProblem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current logged-in student's problems
 * @route  GET /api/problems/my
 * @access Private (Student)
 */
const getMyProblems = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = { reportedBy: req.user._id };

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { problemId: searchRegex },
        { description: searchRegex },
      ];
    }

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get student problem stats
 * @route  GET /api/problems/my/stats
 * @access Private (Student)
 */
const getMyStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, pending, assigned, inProgress, resolved] = await Promise.all([
      Problem.countDocuments({ reportedBy: userId }),
      Problem.countDocuments({ reportedBy: userId, status: "Pending" }),
      Problem.countDocuments({ reportedBy: userId, status: "Assigned" }),
      Problem.countDocuments({ reportedBy: userId, status: "In Progress" }),
      Problem.countDocuments({ reportedBy: userId, status: "Resolved" }),
    ]);

    const recent = await Problem.find({ reportedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
      },
      recent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a specific problem by ID for Student (strictly protected)
 * @route  GET /api/problems/my/:id
 * @access Private (Student)
 */
const getStudentProblemDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Search by problemId or MongoDB _id
    const query = id.startsWith("PRB-") ? { problemId: id } : { _id: id };
    const problem = await Problem.findOne(query).populate("reportedBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found.",
      });
    }

    // Ensure student only accesses their own reports
    if (problem.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: You can only view your own problem reports.",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all problems for Staff with search and filter
 * @route  GET /api/problems/staff
 * @access Private (Staff)
 */
const getAllProblemsForStaff = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { problemId: searchRegex },
        { description: searchRegex },
        { assignedPersonName: searchRegex },
      ];
    }

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email");

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get staff dashboard stats
 * @route  GET /api/problems/staff/stats
 * @access Private (Staff)
 */
const getStaffStats = async (req, res, next) => {
  try {
    const [total, pending, assigned, inProgress, resolved] = await Promise.all([
      Problem.countDocuments(),
      Problem.countDocuments({ status: "Pending" }),
      Problem.countDocuments({ status: "Assigned" }),
      Problem.countDocuments({ status: "In Progress" }),
      Problem.countDocuments({ status: "Resolved" }),
    ]);

    const recent = await Problem.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("reportedBy", "name email");

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
      },
      recent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get specific problem details for Staff
 * @route  GET /api/problems/staff/:id
 * @access Private (Staff)
 */
const getStaffProblemDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.startsWith("PRB-") ? { problemId: id } : { _id: id };
    const problem = await Problem.findOne(query).populate("reportedBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found.",
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitProblem,
  getMyProblems,
  getMyStats,
  getStudentProblemDetails,
  getAllProblemsForStaff,
  getStaffStats,
  getStaffProblemDetails,
};
