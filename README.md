# Problem Reporting and Tracking System (MERN Stack)

A complete, full-stack web application designed for educational institutions and campus environments to report infrastructure, equipment, electrical, and facility problems, assign technicians via WhatsApp Click-to-Chat, and track resolutions with mandatory photographic proof.

Designed and implemented as a BTech CSE academic project using clean, beginner-friendly MERN architecture without external UI libraries or unnecessary complexity.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [End-to-End Problem Status Workflow](#5-end-to-end-problem-status-workflow)
6. [Unique Secure Status-Update Link System](#6-unique-secure-status-update-link-system)
7. [WhatsApp Click-to-Chat Integration](#7-whatsapp-click-to-chat-integration)
8. [Folder Structure](#8-folder-structure)
9. [Prerequisites](#9-prerequisites)
10. [Step-by-Step Local Setup](#10-step-by-step-local-setup)
11. [Environment Variables Configuration](#11-environment-variables-configuration)
12. [Database and Cloudinary Configuration](#12-database-and-cloudinary-configuration)
13. [Initial Staff Account Setup](#13-initial-staff-account-setup)
14. [Running the Application (Windows Commands)](#14-running-the-application-windows-commands)
15. [Automated and Manual Testing Instructions](#15-testing-instructions)
16. [Known Limitations](#16-known-limitations)

---

## 1. Project Overview

Campuses frequently encounter maintenance issues such as broken lab equipment, electrical faults, plumbing leaks, and Wi-Fi disruptions. Traditional paper-based complaint registers or informal messaging often lead to delayed fixes and untracked complaints.

The **Problem Reporting and Tracking System** resolves this by providing:
- A self-service portal for **Students** to submit and monitor maintenance issues.
- An administrative dashboard for **Staff** to review, search, and assign issues to technicians.
- **WhatsApp Click-to-Chat dispatching** with a unique, unguessable status-update link sent directly to the technician.
- A **login-free, secure status update portal** for technicians to update progress and upload completion photos.
- **Live dashboards** for both students and staff that reflect current progress in real time.

---

## 2. Key Features

- **JWT Authentication & bcrypt Password Hashing**: Secure authentication with role-based access control.
- **Unrestricted Self-Registration**: Registration allows selecting **Student** or **Staff** via an Account Type dropdown.
- **Separate Dedicated Login Portals**: Distinct **Student Login** (`/student-login`) and **Staff Login** (`/staff-login`) portals with backend-enforced role-mismatch rejection.
- **Role Separation & Route Protection**: Dedicated dashboards and APIs with strict backend authorization. Students cannot access Staff APIs or other students' reports.
- **Modern Color Theme**: Deep navy blue headers and navigation, teal interactive buttons, amber/orange pending badges, blue assigned/in-progress badges, green resolved badges, red error banners, and light blue-gray backgrounds.
- **Strict 4-Stage Lifecycle**: `Pending` → `Assigned` → `In Progress` → `Resolved`.
- **WhatsApp Click-to-Chat**: Generates prefilled WhatsApp messages for technicians with a single click.
- **SHA-256 Token Protection**: Each issue has a unique cryptographic token for the technician; raw tokens are never saved in MongoDB, and token hashes are never exposed in API responses.
- **Mandatory Photo Verification**: A problem cannot be marked `Resolved` without uploading a resolution image.
- **Cloudinary Image Upload with Local Fallback**: Real backend image streaming via Cloudinary SDK, with automatic local fallback if Cloudinary API keys are omitted during initial setup.
- **Pure Standard CSS**: Cohesive, responsive design built with 100% pure CSS (no Tailwind CSS, Bootstrap, or Material UI).
- **Search and Filter**: Real-time multi-field search and categorization on the Staff dashboard.

---

## 3. Technology Stack

### Frontend
- **React.js (v19)**: User interface components and reactive state.
- **JavaScript (ES6+)**: Functional programming, hooks, and clean client logic.
- **React Router DOM (v7)**: Client-side routing with role-guarded routes.
- **Pure Standard CSS**: Custom responsive styling, status badges, dashboard cards, and navigation.
- **Axios**: HTTP client with request/response interceptors for JWT tokens and error handling.

### Backend
- **Node.js (v24)**: Server runtime environment.
- **Express.js (v4)**: Modular RESTful routing, middleware, controllers, and error handling.
- **MongoDB & Mongoose (v8)**: Document database and schema modeling with indexing.
- **JSON Web Tokens (jsonwebtoken)**: Stateless token-based authentication.
- **bcryptjs**: Password hashing with salt rounds.
- **Multer**: In-memory file buffer processing for image uploads.
- **Cloudinary SDK**: Cloud image storage for evidence and resolution photographs.
- **Node Crypto**: SHA-256 cryptographic hashing and timing-safe token verification.

---

## 4. User Roles and Permissions

| Role | Access Level | Description |
|---|---|---|
| **Student** | Registered Account | Can report campus issues, view own submitted reports, track status progress, and inspect final resolution images. Accesses the portal via `/student-login`. |
| **Staff** | Registered or Seeded Account | Self-registers via `/register` (or initialized via `seed:staff`). Accesses administrative dashboard via `/staff-login` to search/filter reports and assign technicians via WhatsApp. |
| **Concerned Person (Technician)** | No Account Needed | Receives a unique link via WhatsApp. Can access only the assigned problem report, transition status to `In Progress` ("Start Work"), upload completion proof, and mark `Resolved`. |

---

## 5. End-to-End Problem Status Workflow

The system strictly enforces the following 4-step sequence:

```
[Pending] ──(Staff assigns via WhatsApp)──> [Assigned] ──(Technician clicks 'Start Work')──> [In Progress] ──(Technician uploads photo & completes)──> [Resolved]
```

### Stage 1: Pending
1. Student registers or logs in.
2. Fills out the report form with Title, Category, Location, Description, and an optional Evidence photo.
3. System assigns an ID (e.g., `PRB-481920`) and records status as `Pending`.

### Stage 2: Assigned
1. Staff opens the problem details page on the Staff Dashboard.
2. Staff enters the technician's name and WhatsApp number (with country code).
3. Clicking **Open WhatsApp with Assignment**:
   - Backend generates a secure random 24-byte token (`rawToken`).
   - Computes a SHA-256 hash (`tokenHash`) and pre-saves it in MongoDB.
   - Pre-fills a WhatsApp Click-to-Chat message with the problem details and unique update URL.
4. Staff sends the message on WhatsApp, returns to the web app, and clicks **Confirm Assignment in System**.
5. Problem status becomes `Assigned`.

### Stage 3: In Progress
1. Technician opens the unique link received on WhatsApp (`http://localhost:3000/update/PROBLEM_ID/TOKEN`).
2. The page loads without login, showing the issue details and an evidence photo.
3. When ready, the technician clicks **Start Work**.
4. The backend validates the token and updates the status to `In Progress` with a timestamp (`startedAt`).

### Stage 4: Resolved
1. After completing the physical repair, the technician selects a resolution image.
2. The page displays an instant client preview of the proof photo.
3. The technician clicks **Mark Completed**.
4. The backend verifies the image, streams it to Cloudinary, stores the image URL, and records `resolvedAt`.
5. The update page turns into a read-only confirmation.
6. The Student and Staff dashboards immediately reflect `Resolved` along with the resolution photo.

---

## 6. Unique Secure Status-Update Link System

Each assigned problem produces a distinct link:
```
http://localhost:3000/update/PRB-XXXXXX/a1b2c3d4e5f6...
```

### Security Measures:
- **Unguessable Tokens**: Generated with `crypto.randomBytes(24).toString('hex')`.
- **Hashed in Database**: MongoDB stores only the SHA-256 hash of the token (`statusTokenHash`). If the database were leaked, raw tokens cannot be recovered.
- **Hidden from API Responses**: Schema explicitly marks `statusTokenHash: { select: false }` to prevent leakage.
- **Constant-Time Verification**: Uses `crypto.timingSafeEqual()` to protect against timing attacks.
- **Single-Issue Scope**: Each token updates strictly its designated problem.
- **Strict Transition Guards**: The technician cannot transition `Assigned` directly to `Resolved`, and cannot complete without a resolution photo.

---

## 7. WhatsApp Click-to-Chat Integration

The project uses the standard WhatsApp Click-to-Chat protocol (`https://wa.me/<phone>?text=<encoded_message>`).

- **No Paid APIs**: Does not require WhatsApp Business API, Facebook Developer accounts, or webhooks.
- **Manual Confirmation**: Staff maintains full control over message dispatching and manually confirms the assignment inside the portal.
- **Automatic Phone Cleaning**: Strips dashes, spaces, and plus signs, defaulting to Indian country code (`91`) if a 10-digit number is provided.

---

## 8. Folder Structure

```
ProblemReportingSystem/
├── .gitignore                     # Root gitignore for node_modules, env, and uploads
├── README.md                      # Comprehensive project manual
│
├── backend/                       # Express & Node.js Backend
│   ├── .env                       # Local environment variables
│   ├── .env.example               # Example template for environment secrets
│   ├── package.json               # Backend dependencies and scripts
│   ├── server.js                  # Main entry point and Express application setup
│   ├── config/
│   │   ├── db.js                  # MongoDB Mongoose connection
│   │   └── cloudinary.js          # Cloudinary SDK config & buffer streaming
│   ├── controllers/
│   │   ├── authController.js      # Student registration, login, and profile
│   │   ├── problemController.js   # Problem submission, student & staff APIs
│   │   ├── assignmentController.js# WhatsApp token prep and assignment confirmation
│   │   └── publicUpdateController.js# Token validation, start work, image upload & completion
│   ├── middleware/
│   │   ├── auth.js                # JWT Bearer token protection & role guards
│   │   ├── upload.js              # Multer memory storage and image filters
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── models/
│   │   ├── User.js                # User schema (Student, Staff) with bcrypt methods
│   │   └── Problem.js             # Problem schema with lifecycle fields and hidden token hash
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── problemRoutes.js       # /api/problems
│   │   ├── assignmentRoutes.js    # /api/assignment
│   │   └── publicUpdateRoutes.js  # /api/public/update
│   ├── scripts/
│   │   ├── seedStaff.js           # CLI script to create initial Staff account
│   │   └── testWorkflow.js        # Automated 28-assertion integration test suite
│   └── uploads/                   # Local image storage folder (fallback mode)
│
└── frontend/                      # React.js Frontend
    ├── .env                       # Frontend environment variables
    ├── .env.example               # Frontend example env template
    ├── package.json               # Frontend dependencies (React, Router, Axios)
    ├── public/                    # Static assets and index.html
    └── src/
        ├── App.js                 # Route definitions and role guards
        ├── App.css                # Global pure CSS styling, variables, badges & buttons
        ├── index.js               # React root rendering with AuthProvider
        ├── components/
        │   ├── DashboardLayout.js # Reusable dashboard shell with Navbar and Sidebar
        │   ├── DashboardLayout.css
        │   ├── Navbar.js          # Top header with user profile & role badge
        │   ├── Navbar.css
        │   ├── Sidebar.js         # Navigation sidebar with active page links & logout
        │   ├── Sidebar.css
        │   ├── ProblemTable.js    # Reusable table of problem reports
        │   ├── ProblemTable.css
        │   ├── ProblemCard.js     # Responsive problem report card
        │   ├── StatusChip.js      # Status badge component with color dot
        │   └── ProtectedRoute.js  # Authentication and role navigation guard
        ├── context/
        │   └── AuthContext.js     # Session state, login, register, logout
        ├── services/
        │   └── api.js             # Axios instance and API endpoint callers
        ├── utils/
        │   └── statusUtils.js     # Status constants and sequence helpers
        └── pages/
            ├── Auth.css           # Styling for Login and Register pages
            ├── Login.js           # Login page for Student & Staff
            ├── Register.js        # Student registration page
            ├── NotFound.js        # 404 page
            ├── user/
            │   ├── UserDashboard.js   # Student dashboard with 5 metric cards & recent list
            │   ├── SubmitProblem.js   # Problem submission form with image preview
            │   ├── MyProblems.js      # Student's submitted problems with status filters
            │   └── ProblemDetails.js  # Student view of details, evidence, & resolution proof
            ├── staff/
            │   ├── StaffDashboard.js  # Staff dashboard with stats, search & filters
            │   ├── ReportedProblems.js# Full management table for staff
            │   └── StaffProblemDetails.js # WhatsApp assignment & resolution inspection
            └── update/
                └── UpdateProblem.js   # Public status update page for technician
```

---

## 9. Prerequisites

Ensure your system has the following installed:
1. **Node.js**: Version 18.x or newer (Tested on v24.13.1).
2. **MongoDB**: Local MongoDB Server running as a service OR a MongoDB Atlas connection string.

---

## 10. Step-by-Step Local Setup

### Step 1: Open Terminal in Project Root
```powershell
cd c:\Users\kalya\OneDrive\Desktop\ProblemReportingSystem
```

### Step 2: Install Backend Dependencies
```powershell
cd backend
npm.cmd install
```

### Step 3: Install Frontend Dependencies
```powershell
cd ..\frontend
npm.cmd install
```

---

## 11. Environment Variables Configuration

### Backend (`backend/.env`)
Create or edit `backend/.env` with your settings:

```env
# Server Port
PORT=5000

# MongoDB Connection String (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/problem_reporting_db

# JWT Configuration
JWT_SECRET=btech_cse_problem_tracker_jwt_secret_key_2026
JWT_EXPIRES_IN=7d

# Cloudinary Credentials (Optional: if blank, system automatically uses local uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend Base URL (Used for building WhatsApp update links)
FRONTEND_URL=http://localhost:3000

# Initial Staff Account (Used by seed script)
STAFF_NAME=College Administrator
STAFF_EMAIL=staff@college.edu
STAFF_INITIAL_PASSWORD=Staff@12345
```

### Frontend (`frontend/.env`)
Create or edit `frontend/.env`:

```env
# API Base URL pointing to the Express server
REACT_APP_API_URL=http://localhost:5000/api

# Disable source map overhead for fast compilation
GENERATE_SOURCEMAP=false

# Prevent opening new browser tab automatically on npm start
BROWSER=none
PORT=3000
```

---

## 12. Database and Cloudinary Configuration

### MongoDB Setup
- **Local MongoDB**: The system defaults to `mongodb://127.0.0.1:27017/problem_reporting_db`. Ensure your local MongoDB Windows service is running.
- **MongoDB Atlas**: Replace `MONGODB_URI` in `backend/.env` with your Atlas connection URI:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/problem_reporting_db?retryWrites=true&w=majority
  ```

### Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Console Dashboard.
3. Paste them into `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   CLOUDINARY_API_KEY=your_actual_api_key
   CLOUDINARY_API_SECRET=your_actual_api_secret
   ```
4. **Development Fallback Mode**: If Cloudinary credentials are omitted or left blank, the application automatically saves images to `backend/uploads/` and serves them statically at `http://localhost:5000/uploads/...`. The app will function locally without needing an online account.

---

## 13. Initial Staff Account Setup

Public registration only creates **Student** accounts. To initialize the administrative **Staff** account:

In a terminal, run:
```powershell
cd backend
npm.cmd run seed:staff
```
Or directly:
```powershell
node scripts/seedStaff.js
```

**Default Staff Credentials Created:**
- **Email**: `staff@college.edu`
- **Password**: `Staff@12345`
- **Role**: `Staff`

You can change these credentials anytime by modifying `STAFF_EMAIL` and `STAFF_INITIAL_PASSWORD` in `backend/.env` and re-running the script.

---

## 14. Running the Application (Windows Commands)

Open two separate PowerShell or Command Prompt terminal windows.

> **Tip for Windows users**: If PowerShell script execution policies prevent running `npm`, use `npm.cmd`.

### Terminal 1: Backend Server
```powershell
cd c:\Users\kalya\OneDrive\Desktop\ProblemReportingSystem\backend
npm.cmd start
```
*The server will start on `http://localhost:5000` and display `MongoDB Connected: 127.0.0.1/problem_reporting_db`.*

### Terminal 2: Frontend Client
```powershell
cd c:\Users\kalya\OneDrive\Desktop\ProblemReportingSystem\frontend
npm.cmd start
```
*The React client will launch at `http://localhost:3000`.*

---

## 15. Testing Instructions

### Automated Integration Test Suite
To verify all backend APIs, cryptographic tokens, status transitions, and Cloudinary upload logic with a single command:

```powershell
cd backend
node scripts/testWorkflow.js
```

This automated test checks:
1. Server health check.
2. Student registration.
3. Strict denial of public Staff registration.
4. Student authentication.
5. Problem report submission.
6. Generation of human-readable problem ID (`PRB-XXXXXX`).
7. Appearance in student's My Problems list.
8. Staff authentication.
9. Assignment preparation & WhatsApp URL formatting.
10. Unpredictable token generation and SHA-256 hashing.
11. Assignment confirmation in database (`Assigned`).
12. Rejection of invalid/forged security tokens.
13. Token protection (hash is never exposed in response).
14. Prevention of premature completion without starting work.
15. "Start Work" status transition (`In Progress`).
16. Prevention of completion without resolution proof photo.
17. Uploading resolution image and marking completed (`Resolved`).
18. Real-time update of Student and Staff dashboard statistics.

### Manual Verification Walkthrough

1. **Register as Student**:
   - Go to `http://localhost:3000/register`.
   - Create a student account with your name, college email, and password.
   - You are automatically logged in and redirected to the Student Dashboard.

2. **Submit a Problem**:
   - Click **+ Report New Problem**.
   - Enter a title (e.g., "Fluorescent Tube Flickering"), select category "Electrical", specify location ("Room 302, Block A"), describe the issue, and optionally upload a photo.
   - Click **Submit Problem Report**. Note the reference ID generated (e.g., `PRB-104928`).

3. **Check Student View**:
   - Navigate to **My Problems**.
   - Notice the report appears with `Pending` status badge.
   - Click **View Details** to inspect the report and evidence photo.

4. **Log in as Staff**:
   - Log out from the sidebar.
   - Sign in at `http://localhost:3000/login` with `staff@college.edu` and `Staff@12345`.
   - On the Staff Dashboard, see the newly submitted problem in the table.

5. **Assign Technician via WhatsApp**:
   - Click the problem to view **Staff Problem Details**.
   - Under **Staff WhatsApp Assignment**, enter:
     - Name: `Ramesh Electrician`
     - Phone: `+919876543210`
   - Click **Open WhatsApp with Assignment**.
   - A new browser tab opens WhatsApp Web prefilled with the problem title, location, and the unique status-update link.
   - Return to the web app and click **Confirm Assignment in System**.
   - The status updates to `Assigned`.

6. **Concerned Person Workflow (No Login)**:
   - Copy the generated update URL (or open it from the confirmation card):
     `http://localhost:3000/update/PRB-XXXXXX/<token>`
   - Open this URL in an Incognito window.
   - Verify that the page loads without requesting any credentials.
   - Click **Start Work**. The status instantly switches to `In Progress`.
   - Select a resolution photo showing the repaired equipment.
   - Click **Mark Completed**. The problem switches to `Resolved`.

7. **Verify Dashboards**:
   - Refresh the Staff Dashboard: the problem shows as `Resolved` and displays the resolution photo.
   - Sign back in as the Student: the Student Dashboard and Problem Details page reflect `Resolved` along with the completion proof.

---

## 16. Known Limitations

- **WhatsApp Web Opening**: Click-to-Chat opens WhatsApp Web or the WhatsApp desktop/mobile app. It does not automatically press the "Send" button; the staff member manually sends the message and confirms assignment in the system.
- **Single Assignee per Problem**: Each problem is assigned to one primary technician.
- **Local Development**: Built specifically for local execution on Windows/macOS/Linux. Production cloud deployment (e.g. AWS, Render, Vercel) is deliberately excluded per project guidelines.
