const crypto = require("crypto");
const Problem = require("../models/Problem");

/**
 * Clean and format phone number for WhatsApp
 * Strips non-digit characters (+, -, spaces)
 */
const sanitizePhoneNumber = (phone) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  // Default to 91 (India) if 10 digits entered without country code
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
};

/**
 * @desc   Prepare assignment: generate secure token and WhatsApp Click-to-Chat payload
 * @route  POST /api/assignment/prepare
 * @access Private (Staff)
 */
const prepareAssignment = async (req, res, next) => {
  try {
    const { problemId, assignedPersonName, assignedPersonPhone } = req.body;

    if (!problemId || !assignedPersonName || !assignedPersonPhone) {
      return res.status(400).json({
        success: false,
        message: "Problem ID, concerned person name, and phone number are required.",
      });
    }

    const cleanPhone = sanitizePhoneNumber(assignedPersonPhone);
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number with country code (e.g., +919876543210).",
      });
    }

    const query = problemId.startsWith("PRB-") ? { problemId } : { _id: problemId };
    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found.",
      });
    }

    if (problem.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Cannot reassign a problem that has already been resolved.",
      });
    }

    // Generate secure unpredictable random token
    const rawToken = crypto.randomBytes(24).toString("hex");

    // Compute SHA-256 hash to be stored in MongoDB
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Immediately persist token hash and assignment in database
    // This guarantees that the link sent via WhatsApp is active and valid immediately!
    problem.status = "Assigned";
    problem.assignedPersonName = assignedPersonName.trim();
    problem.assignedPersonPhone = cleanPhone;
    problem.statusTokenHash = tokenHash;
    problem.assignedAt = new Date();
    await problem.save();

    // Frontend URL configured in environment
    const frontendBaseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const updateLink = `${frontendBaseUrl}/update/${problem.problemId}/${rawToken}`;

    // Format WhatsApp message
    const message =
      `*Problem Assignment Notification*\n\n` +
      `Hello ${assignedPersonName.trim()},\n\n` +
      `You have been assigned to resolve a reported problem:\n\n` +
      `*Problem ID:* ${problem.problemId}\n` +
      `*Title:* ${problem.title}\n` +
      `*Category:* ${problem.category}\n` +
      `*Location:* ${problem.location}\n` +
      `*Description:* ${problem.description}\n\n` +
      `Please use your unique status-update link to start work and submit resolution proof upon completion:\n` +
      `${updateLink}\n\n` +
      `_No login is required. Keep this link confidential._`;

    // WhatsApp Click-to-Chat URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    res.status(200).json({
      success: true,
      message: `Problem ${problem.problemId} assigned and update link generated.`,
      data: {
        problemId: problem.problemId,
        assignedPersonName: assignedPersonName.trim(),
        assignedPersonPhone: cleanPhone,
        rawToken,
        tokenHash,
        updateLink,
        whatsappUrl,
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Confirm problem assignment in database after staff sends message
 * @route  POST /api/assignment/confirm
 * @access Private (Staff)
 */
const confirmAssignment = async (req, res, next) => {
  try {
    const { problemId, assignedPersonName, assignedPersonPhone, tokenHash } = req.body;

    if (!problemId || !assignedPersonName || !assignedPersonPhone || !tokenHash) {
      return res.status(400).json({
        success: false,
        message: "Missing required assignment confirmation data.",
      });
    }

    const cleanPhone = sanitizePhoneNumber(assignedPersonPhone);

    const query = problemId.startsWith("PRB-") ? { problemId } : { _id: problemId };
    const problem = await Problem.findOne(query);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found.",
      });
    }

    if (problem.status === "Resolved") {
      return res.status(400).json({
        success: false,
        message: "This problem has already been resolved.",
      });
    }

    // Transition status to Assigned and save token hash
    problem.status = "Assigned";
    problem.assignedPersonName = assignedPersonName.trim();
    problem.assignedPersonPhone = cleanPhone;
    problem.statusTokenHash = tokenHash;
    problem.assignedAt = new Date();

    await problem.save();

    res.status(200).json({
      success: true,
      message: `Problem ${problem.problemId} successfully assigned to ${assignedPersonName}.`,
      problem: {
        problemId: problem.problemId,
        title: problem.title,
        status: problem.status,
        assignedPersonName: problem.assignedPersonName,
        assignedPersonPhone: problem.assignedPersonPhone,
        assignedAt: problem.assignedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  prepareAssignment,
  confirmAssignment,
  sanitizePhoneNumber,
};
