const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  uploadedBy: String,
  filename: String,
  originalname: String,
});

module.exports = mongoose.model("Upload", uploadSchema);
