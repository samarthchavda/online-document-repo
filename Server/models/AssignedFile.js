const mongoose = require("mongoose");

const assignedFileSchema = new mongoose.Schema({
  facultyEmail: String,
  facultyName: String,
  studentEmail: String,
  taskText: String,
  filename: String,
  originalname: String,
});

module.exports = mongoose.model("AssignedFile", assignedFileSchema);
