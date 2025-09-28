// server/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// GET /attendance?month=2025-09
router.get("/", async (req, res) => {
  try {
    let { month } = req.query;

    if (!month) {
      const today = new Date();
      month = today.toISOString().slice(0, 7);
    }

    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    const records = await Attendance.find({
      adminId: req.user.id,
      date: { $gte: start, $lte: end }
    }).populate("memberId", "name");

    const daysInMonth = new Date(year, m, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const overview = {};
    records.forEach(r => {
      const day = new Date(r.date).getDate();
      const id = r.memberId._id.toString();
      if (!overview[id]) {
        overview[id] = {
          memberId: id,
          adminId: req.user.id,
          name: r.memberId.name,
          days: {}
        };
      }
      overview[id].days[day] = 1;
    });

    const result = Object.values(overview).map(member => {
      const row = { memberId: member.memberId, name: member.name };
      days.forEach(d => {
        row[d] = member.days[d] ? 1 : 0;
      });
      return row;
    });

    res.json({ days, result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark attendance MANUALLY (button press)
router.post("/mark/:memberId", async (req, res) => {
  const { memberId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const existing = await Attendance.findOne({
      memberId,
      adminId: req.user.id,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      memberId,
      adminId: req.user.id,
      date: today,
      checkInTime: new Date().toLocaleTimeString(),
      markedBy: 'manual' // Added this field
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
      adminId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).populate("memberId", "name") // Get member details
      .select("memberId markedBy checkInTime -_id");

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;