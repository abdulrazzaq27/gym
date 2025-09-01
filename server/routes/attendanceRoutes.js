const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// ✅ Mark attendance
router.post("/mark/:memberId", async (req, res) => {
  const { memberId } = req.params;

  // set date to start of today (midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // check if already marked today
    const existing = await Attendance.findOne({
      memberId,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      memberId,
      date: today, // store as proper Date
      checkInTime: new Date().toLocaleTimeString()
    });

    await attendance.save();
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all marked members for today
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).select("memberId -_id"); // only return memberId

    res.json(records); // e.g. [ { "memberId": "66d3..." }, ... ]
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
