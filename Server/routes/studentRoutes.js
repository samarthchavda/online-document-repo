const express = require("express");
const multer = require("multer");
const path = require("path");
const AssignedFile = require("../models/AssignedFile");
const StudentResponse = require("../models/StudentResponse");

const router = express.Router();

// Multer setup
const uploadsDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get assigned files for student
router.get("/assigned-files/:studentEmail", async (req, res) => {
  try {
    const files = await AssignedFile.find({ studentEmail: req.params.studentEmail });
    res.json(files);
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Submit student task response
router.post("/submit-task", upload.single("file"), async (req, res) => {
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
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get student responses
router.get("/responses/:email", async (req, res) => {
  try {
    const responses = await StudentResponse.find({ studentEmail: req.params.email });
    res.json(responses);
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
