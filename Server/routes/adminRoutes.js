const express = require("express");
const FacultySignup = require("../models/FacultySignup");
const User = require("../models/User");

const router = express.Router();

// Get all pending faculty requests
router.get("/faculty-requests", async (req, res) => {
  try {
    const requests = await FacultySignup.find({ status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

// Approve/reject faculty signup
router.post("/faculty-approve/:id", async (req, res) => {
  try {
    const { approve } = req.body;
    const request = await FacultySignup.findById(req.params.id);
    if (!request) return res.json({ status: false, message: "Request not found" });

    if (approve) {
      const newUser = new User({
        name: request.name,
        email: request.email,
        password: request.password,
        role: "faculty",
      });
      await newUser.save();
      request.status = "approved";
    } else {
      request.status = "rejected";
    }
    await request.save();

    res.json({ status: true, message: `Faculty request ${approve ? "approved" : "rejected"}` });
  } catch (err) {
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
