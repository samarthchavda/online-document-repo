const express = require("express");
const AssignedFile = require("../models/AssignedFile");
const StudentResponse = require("../models/StudentResponse");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Get assigned files
router.get("/assigned-files/:studentEmail", async (req, res) => {
  try {
    const files = await AssignedFile.find({ studentEmail: req.params.studentEmail });
    res.json(files);
  } catch (err) {
    console.error("Error fetching student tasks:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Submit task
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
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get student responses
router.get("/responses/:email", async (req, res) => {
  try {
    const responses = await StudentResponse.find({ studentEmail: req.params.email });
    res.json(responses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Delete student response
router.delete("/delete-response/:id", async (req, res) => {
  try {
    const response = await StudentResponse.findById(req.params.id);
    if (!response) return res.json({ status: false, message: "Response not found" });

    const filePath = path.join(__dirname, "..", "uploads", response.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await StudentResponse.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: "Response deleted successfully" });
  } catch (err) {
    console.error("Delete response error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
