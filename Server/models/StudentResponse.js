const mongoose = require("mongoose");

const studentResponseSchema = new mongoose.Schema({
  taskId: String,
  studentEmail: String,
  facultyName: String,
  facultyEmail: String,
  filename: String,
  originalname: String,
  status: { type: String, default: "pending" },
});

module.exports = mongoose.model("StudentResponse", studentResponseSchema);
