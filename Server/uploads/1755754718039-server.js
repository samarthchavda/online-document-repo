
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 2000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// ===== MongoDB Connection =====
mongoose
  .connect("mongodb://127.0.0.1:27017/taskdb")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// ===== Schemas =====
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "student" } // student | faculty | admin
});
const User = mongoose.model("User", userSchema);

const facultySignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  facultyIdPhoto: String,
  erNumber: String,
  status: { type: String, default: "pending" },
});
const FacultySignup = mongoose.model("FacultySignup", facultySignupSchema);

const assignedFileSchema = new mongoose.Schema({
  facultyEmail: String,
  facultyName: String,
  studentEmail: String,
  taskText: String,
  filename: String,
  originalname: String,
});
const AssignedFile = mongoose.model("AssignedFile", assignedFileSchema);

const uploadSchema = new mongoose.Schema({
  uploadedBy: String,
  filename: String,
  originalname: String,
});
const Upload = mongoose.model("Upload", uploadSchema);

const studentResponseSchema = new mongoose.Schema({
  taskId: String,
  studentEmail: String,
  facultyName: String,
  facultyEmail: String,
  filename: String,
  originalname: String,
  status: { type: String, default: "pending" },
});
const StudentResponse = mongoose.model("StudentResponse", studentResponseSchema);

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===== JWT Middleware (not enforced on routes yet, but ready) =====
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ status: false, message: "No token" });

  jwt.verify(token, "secret", (err, decoded) => {
    if (err) return res.status(401).json({ status: false, message: "Invalid token" });
    req.user = decoded; // { email }
    next();
  });
}

// ===== Routes =====

// Normal user signup
app.post("/users/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ status: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.json({ status: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    res.json({ status: true, message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Faculty signup request
app.post("/faculty/signup-request", upload.single("facultyIdPhoto"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || !req.file) {
      return res.json({ status: false, message: "All fields are required" });
    }

    const existing = await FacultySignup.findOne({ email });
    if (existing)
      return res.json({ status: false, message: "Faculty signup request already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newFaculty = new FacultySignup({
      name,
      email,
      password: hashed,
      facultyIdPhoto: req.file.filename,
      status: "pending",
    });

    await newFaculty.save();
    res.json({ status: true, message: "Signup request submitted. We will update in 24 hours." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Admin: Get all pending faculty requests
app.get("/admin/faculty-requests", async (req, res) => {
  try {
    const requests = await FacultySignup.find({ status: "pending" });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Admin: Approve/reject faculty signup
app.post("/admin/faculty-approve/:id", async (req, res) => {
  try {
    const { approve } = req.body;
    const request = await FacultySignup.findById(req.params.id);
    if (!request) return res.json({ status: false, message: "Request not found" });

    if (approve) {
      const newUser = new User({
        name: request.name,
        email: request.email,
        password: request.password,
        role: "faculty",
      });
      await newUser.save();
      request.status = "approved";
    } else {
      request.status = "rejected";
    }
    await request.save();

    res.json({ status: true, message: `Faculty request ${approve ? "approved" : "rejected"}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Login for all users
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ status: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign({ email: user.email }, "secret", { expiresIn: "1h" });

    res.json({
      status: true,
      message: "Login successful",
      token,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get all users
app.get("/users/data", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Delete user
app.delete("/users/delete/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.json({ status: false, message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// ===== Assign files, upload, responses =====

// Assign task/file to student
app.post("/faculty/assign-file", upload.single("file"), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { facultyEmail, facultyName, studentEmail, task } = data;

    if (!facultyEmail || !facultyName || !studentEmail)
      return res.json({ status: false, message: "Missing required fields" });

    const newAssignedFile = new AssignedFile({
      facultyEmail,
      facultyName,
      studentEmail,
      taskText: task || "",
      filename: req.file ? req.file.filename : "",
      originalname: req.file ? req.file.originalname : "",
    });

    await newAssignedFile.save();
    res.json({ status: true, message: "Task assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get assigned files for student
app.get("/student/assigned-files/:studentEmail", async (req, res) => {
  try {
    const files = await AssignedFile.find({ studentEmail: req.params.studentEmail });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Submit student task response
app.post("/student/submit-task", upload.single("file"), async (req, res) => {
  try {
    const { taskId, studentEmail, facultyName, facultyEmail } = req.body;
    if (!req.file) return res.json({ status: false, message: "No file uploaded" });

    const response = new StudentResponse({
      taskId,
      studentEmail,
      facultyName,
      facultyEmail,
      filename: req.file.filename,
      originalname: req.file.originalname,
    });
    await response.save();

    res.json({ status: true, message: "Response submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get student responses
app.get("/student/responses/:email", async (req, res) => {
  try {
    const responses = await StudentResponse.find({ studentEmail: req.params.email });
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Approve/reject student submission
app.post("/faculty/grade-submission/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status))
      return res.json({ status: false, message: "Invalid status value" });

    const updated = await StudentResponse.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.json({ status: false, message: "Submission not found" });

    res.json({ status: true, message: `Submission marked as ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// ====== MISSING ROUTES ADDED FOR YOUR FACULTY.jsx ======

// ✅ Get all students (uses User collection where role === 'student')
app.get("/faculty/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }, { name: 1, email: 1 });
    res.json({ status: true, students });
  } catch (err) {
    console.error("Failed to fetch students:", err);
    res.json({ status: false, message: "Error fetching students" });
  }
});

// ✅ Fetch submissions for a specific faculty (by name)
app.get("/faculty/responses/:facultyName", async (req, res) => {
  try {
    const { facultyName } = req.params;
    const submissions = await StudentResponse.find({ facultyName });
    res.json(submissions);
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    res.json([]);
  }
});

// ===== Start server =====
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
