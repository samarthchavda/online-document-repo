const express = require("express");
const multer = require("multer");
const path = require("path");
const AssignedFile = require("../models/AssignedFile");
const StudentResponse = require("../models/StudentResponse");
const User = require("../models/User");

const router = express.Router();

// Multer setup
const uploadsDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Assign task/file to student
router.post("/assign-file", upload.single("file"), async (req, res) => {
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
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get all students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }, { name: 1, email: 1 });
    res.json({ status: true, students });
  } catch (err) {
    res.json({ status: false, message: "Error fetching students" });
  }
});

// Get submissions for a specific faculty
router.get("/responses/:facultyName", async (req, res) => {
  try {
    const submissions = await StudentResponse.find({ facultyName: req.params.facultyName });
    res.json(submissions);
  } catch (err) {
    res.json([]);
  }
});

// Approve/reject student submission
router.post("/grade-submission/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status))
      return res.json({ status: false, message: "Invalid status value" });

    const updated = await StudentResponse.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.json({ status: false, message: "Submission not found" });

    res.json({ status: true, message: `Submission marked as ${status}` });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
