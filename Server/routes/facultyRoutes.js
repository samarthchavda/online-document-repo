const express = require("express");
const AssignedFile = require("../models/AssignedFile");
const StudentResponse = require("../models/StudentResponse");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Get all students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" }, { name: 1, email: 1 });
    res.json({ status: true, students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get assigned files
router.get("/assigned-files/:facultyEmail", async (req, res) => {
  try {
    const files = await AssignedFile.find({ facultyEmail: req.params.facultyEmail });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get student submissions
router.get("/responses/:facultyNameOrEmail", async (req, res) => {
  try {
    const facultyIdentifier = req.params.facultyNameOrEmail;
    const submissions = await StudentResponse.find({
      $or: [
        { facultyName: facultyIdentifier },
        { facultyEmail: facultyIdentifier }
      ]
    });
    res.json(submissions);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Assign task/file
router.post("/assign-file", upload.single("file"), async (req, res) => {
  try {
    const data = JSON.parse(req.body.data);
    const { facultyEmail, facultyName, studentEmail, task } = data;

    if (!facultyEmail || !facultyName || !studentEmail) {
      return res.json({ status: false, message: "Missing required fields" });
    }

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

// Grade submission
router.post("/grade-submission/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.json({ status: false, message: "Invalid status value" });
    }

    const updated = await StudentResponse.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.json({ status: false, message: "Submission not found" });
    }

    res.json({ status: true, message: `Submission marked as ${status}` });
  } catch (err) {
    console.error("Grade submission error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
