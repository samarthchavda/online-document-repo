const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.json({ status: false, message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.json({ status: false, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    res.json({ status: true, message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ status: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

    res.json({ status: true, message: "Login successful", token, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Get all users
router.get("/data", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// Delete user
router.delete("/delete/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.json({ status: false, message: "User not found" });

  await User.findByIdAndDelete(req.params.id);
  res.json({ status: true, message: "User deleted successfully" });
});

module.exports = router;
