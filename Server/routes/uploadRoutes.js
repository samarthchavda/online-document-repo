const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Upload = require("../models/Upload");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Multer setup
const uploadsDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload file
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.json({ status: false, message: "No file uploaded" });

    const newUpload = new Upload({
      uploadedBy: req.user.email,
      filename: req.file.filename,
      originalname: req.file.originalname,
    });

    await newUpload.save();
    res.json({ status: true, message: "File uploaded successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Delete file
router.delete("/delete/:id", async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) return res.status(404).json({ status: false, message: "File not found" });

    const filePath = path.join(uploadsDir, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Upload.findByIdAndDelete(req.params.id);

    res.json({ status: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get uploads by user
router.get("/user/:email", verifyToken, async (req, res) => {
  try {
    const uploads = await Upload.find({ uploadedBy: req.params.email });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
