const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const API_BASE = "http://localhost:5000/api";

const runTests = async () => {
  console.log("=== STARTING FULL BACKEND INTEGRATION TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === "healthy", "Server health check returns healthy");

    // 2. Register Student with role: "Student"
    const testStudentEmail = `student_${Date.now()}@college.edu`;
    const regStudentRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Aakash Sharma",
        email: testStudentEmail,
        password: "Password@123",
        role: "Student",
      }),
    });
    const regStudentData = await regStudentRes.json();
    assert(regStudentData.success === true, "Student registration succeeds");
    assert(regStudentData.user.role === "Student", "Registered user role correctly set to Student");
    const studentToken = regStudentData.token;

    // 3. Register Staff with role: "Staff" (Unrestricted self-registration)
    const testStaffEmail = `staff_${Date.now()}@college.edu`;
    const regStaffRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Prof. Priya Verma",
        email: testStaffEmail,
        password: "Password@123",
        role: "Staff",
      }),
    });
    const regStaffData = await regStaffRes.json();
    assert(regStaffData.success === true, "Staff self-registration succeeds without approval/invite codes");
    assert(regStaffData.user.role === "Staff", "Registered user role correctly set to Staff in MongoDB");

    // 4. Role-mismatch login rejection tests
    // Test 4A: Student attempts to log in on Staff portal (expectedRole: "Staff")
    const mismatchStaffLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testStudentEmail,
        password: "Password@123",
        expectedRole: "Staff",
      }),
    });
    const mismatchStaffData = await mismatchStaffLoginRes.json();
    assert(
      mismatchStaffLoginRes.status === 403 && mismatchStaffData.message.includes("Student"),
      "Student login attempt on Staff portal rejected with 403 Forbidden"
    );

    // Test 4B: Staff attempts to log in on Student portal (expectedRole: "Student")
    const mismatchStudentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testStaffEmail,
        password: "Password@123",
        expectedRole: "Student",
      }),
    });
    const mismatchStudentData = await mismatchStudentLoginRes.json();
    assert(
      mismatchStudentLoginRes.status === 403 && mismatchStudentData.message.includes("Staff"),
      "Staff login attempt on Student portal rejected with 403 Forbidden"
    );

    // 5. Successful Role-Matched Logins
    // Student Login
    const validStudentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testStudentEmail,
        password: "Password@123",
        expectedRole: "Student",
      }),
    });
    const validStudentData = await validStudentLoginRes.json();
    assert(validStudentData.success && validStudentData.user.role === "Student", "Student login on Student portal succeeds");

    // Staff Login
    const validStaffLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testStaffEmail,
        password: "Password@123",
        expectedRole: "Staff",
      }),
    });
    const validStaffData = await validStaffLoginRes.json();
    assert(validStaffData.success && validStaffData.user.role === "Staff", "Staff login on Staff portal succeeds");
    const staffToken = validStaffData.token;

    // 6. Security Check: Student attempting to access Staff-only API directly
    const studentAccessStaffApiRes = await fetch(`${API_BASE}/problems/staff`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessStaffApiRes.status === 403, "Student blocked from accessing Staff-only API endpoints (403 Forbidden)");

    // 7. Problem Reporting Workflow: Student submits issue
    const submitRes = await fetch(`${API_BASE}/problems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: "Broken Fan in Seminar Hall 2",
        category: "Electrical",
        location: "Main Academic Block - 3rd Floor",
        description: "Ceiling fan number 3 makes a grinding noise and stopped rotating.",
      }),
    });
    const submitData = await submitRes.json();
    assert(submitData.success === true, "Problem submitted successfully by student");
    assert(submitData.problem.status === "Pending", "Initial problem status is Pending");
    const problemId = submitData.problem.problemId;

    // 8. Staff Prepares Assignment & WhatsApp URL
    const prepareRes = await fetch(`${API_BASE}/assignment/prepare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        problemId: problemId,
        assignedPersonName: "Kailash Electrician",
        assignedPersonPhone: "+919876543210",
      }),
    });
    const prepareData = await prepareRes.json();
    assert(prepareData.success === true, "Staff prepared assignment and generated WhatsApp link");
    const { rawToken, tokenHash, whatsappUrl, updateLink } = prepareData.data;
    assert(rawToken && tokenHash, "Generated unpredictable token and SHA-256 token hash");

    // 9. Staff confirms assignment in database
    const confirmRes = await fetch(`${API_BASE}/assignment/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        problemId: problemId,
        assignedPersonName: "Kailash Electrician",
        assignedPersonPhone: "+919876543210",
        tokenHash: tokenHash,
      }),
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.problem.status === "Assigned", "Problem status transitioned to Assigned");

    // 10. Public update link access without login
    const publicDetailsRes = await fetch(`${API_BASE}/public/update/${problemId}/${rawToken}`);
    const publicDetailsData = await publicDetailsRes.json();
    assert(publicDetailsData.success === true, "Technician can access update portal via token without login");
    assert(publicDetailsData.problem.statusTokenHash === undefined, "Security: statusTokenHash is never exposed in response");

    // 11. Technician starts work
    const startRes = await fetch(`${API_BASE}/public/update/${problemId}/${rawToken}/start`, {
      method: "POST",
    });
    const startData = await startRes.json();
    assert(startData.problem.status === "In Progress", "Status transitioned to In Progress");

    // 12. Upload resolution image and mark completed
    const testImageBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xda, 0x00,
      0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x80, 0xff, 0xd9,
    ]);

    const formData = new FormData();
    const imageBlob = new Blob([testImageBuffer], { type: "image/jpeg" });
    formData.append("resolutionImage", imageBlob, "fixed_fan.jpg");

    const resolveRes = await fetch(`${API_BASE}/public/update/${problemId}/${rawToken}/resolve`, {
      method: "POST",
      body: formData,
    });
    const resolveData = await resolveRes.json();
    assert(resolveData.problem.status === "Resolved", "Problem marked as Resolved with proof image");
    // 13. Category Filtering Tests
    // Submit a second problem with Plumbing category
    const submitPlumbingRes = await fetch(`${API_BASE}/problems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: "Leaking Pipe in Lab 3",
        category: "Plumbing",
        location: "Mechanical Block - 1st Floor",
        description: "Water tap is dripping continuously causing leakage.",
      }),
    });
    const submitPlumbingData = await submitPlumbingRes.json();
    assert(submitPlumbingData.success === true, "Submitted second problem with Plumbing category");

    // Test 13A: Filter student problems by category=Electrical
    const studentElectricalRes = await fetch(`${API_BASE}/problems/my?category=Electrical`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentElectricalData = await studentElectricalRes.json();
    const allElectricalStudent = studentElectricalData.problems.every(p => p.category === "Electrical");
    assert(
      studentElectricalData.success && studentElectricalData.problems.length > 0 && allElectricalStudent,
      `Student category filter (?category=Electrical) returns only Electrical problems (found: ${studentElectricalData.problems.length})`
    );

    // Test 13B: Filter student problems by category=Plumbing
    const studentPlumbingRes = await fetch(`${API_BASE}/problems/my?category=Plumbing`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentPlumbingData = await studentPlumbingRes.json();
    const allPlumbingStudent = studentPlumbingData.problems.every(p => p.category === "Plumbing");
    assert(
      studentPlumbingData.success && studentPlumbingData.problems.length > 0 && allPlumbingStudent,
      `Student category filter (?category=Plumbing) returns only Plumbing problems (found: ${studentPlumbingData.problems.length})`
    );

    // Test 13C: Filter staff problems by category=Electrical
    const staffElectricalRes = await fetch(`${API_BASE}/problems/staff?category=Electrical`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const staffElectricalData = await staffElectricalRes.json();
    const allElectricalStaff = staffElectricalData.problems.every(p => p.category === "Electrical");
    assert(
      staffElectricalData.success && staffElectricalData.problems.length > 0 && allElectricalStaff,
      `Staff category filter (?category=Electrical) returns only Electrical problems (found: ${staffElectricalData.problems.length})`
    );

    // Test 13D: Filter staff problems by category=Plumbing
    const staffPlumbingRes = await fetch(`${API_BASE}/problems/staff?category=Plumbing`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const staffPlumbingData = await staffPlumbingRes.json();
    const allPlumbingStaff = staffPlumbingData.problems.every(p => p.category === "Plumbing");
    assert(
      staffPlumbingData.success && staffPlumbingData.problems.length > 0 && allPlumbingStaff,
      `Staff category filter (?category=Plumbing) returns only Plumbing problems (found: ${staffPlumbingData.problems.length})`
    );

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed === 0) {
      console.log("ALL VERIFICATION SUITE TESTS PASSED!");
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test suite error:", error);
    process.exit(1);
  }
};

runTests();
