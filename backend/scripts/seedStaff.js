const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedStaffAccount = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/problem_reporting_db";

    console.log("Connecting to MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    const staffName = process.env.STAFF_NAME || "College Staff Admin";
    const staffEmail = (
      process.env.STAFF_EMAIL || "staff@college.edu"
    ).toLowerCase().trim();
    const staffPassword = process.env.STAFF_INITIAL_PASSWORD || "Staff@12345";

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(staffPassword, salt);

    let staff = await User.findOne({ email: staffEmail });

    if (staff) {
      staff.name = staffName;
      staff.passwordHash = passwordHash;
      staff.role = "Staff";
      await staff.save();
      console.log("\n========================================");
      console.log("[SUCCESS] Existing Staff account updated.");
      console.log(`Email:    ${staffEmail}`);
      console.log(`Password: ${staffPassword}`);
      console.log("Role:     Staff");
      console.log("========================================\n");
    } else {
      staff = await User.create({
        name: staffName,
        email: staffEmail,
        passwordHash,
        role: "Staff",
      });
      console.log("\n========================================");
      console.log("[SUCCESS] New Staff account created.");
      console.log(`Email:    ${staffEmail}`);
      console.log(`Password: ${staffPassword}`);
      console.log("Role:     Staff");
      console.log("========================================\n");
    }

    await mongoose.disconnect();
    console.log("Database disconnected. Staff setup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating staff account:", error);
    process.exit(1);
  }
};

seedStaffAccount();
