const mongoose = require("mongoose");

const facultySignupSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  facultyIdPhoto: String,
  erNumber: String,
  status: { type: String, default: "pending" },
});

module.exports = mongoose.model("FacultySignup", facultySignupSchema);
