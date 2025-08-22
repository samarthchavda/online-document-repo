const express = require("express");
const Upload = require("../models/Upload");
const multer = require("multer");
const verifyToken = require("../middleware/verifyToken");
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

// Upload a file
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ status: false, message: "No file uploaded" });
    }

    const uploaderEmail = req.user.email;

    const existingFile = await Upload.findOne({
      uploadedBy: uploaderEmail,
      originalname: req.file.originalname
    });

    if (existingFile) {
      const uploadedPath = path.join(__dirname, "..", "uploads", req.file.filename);
      if (fs.existsSync(uploadedPath)) {
        fs.unlinkSync(uploadedPath);
      }
      return res.json({ status: false, message: "File already exists" });
    }

    const newUpload = new Upload({
      uploadedBy: uploaderEmail,
      filename: req.file.filename,
      originalname: req.file.originalname,
    });

    await newUpload.save();
    res.json({ status: true, message: "File uploaded successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get files by user
router.get("/user/:email", async (req, res) => {
  try {
    const files = await Upload.find({ uploadedBy: req.params.email });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Delete a file
router.delete("/delete/:id", async (req, res) => {
  try {
    const file = await Upload.findById(req.params.id);
    if (!file) return res.json({ status: false, message: "File not found" });

    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Upload.findByIdAndDelete(req.params.id);
    res.json({ status: true, message: "File deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
