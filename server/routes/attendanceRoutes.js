const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");


// GET /attendance?month=2025-09
router.get("/", async (req, res) => {
  try {
    let { month } = req.query; // YYYY-MM format

    if (!month) {
      const today = new Date();
      month = today.toISOString().slice(0, 7); // "YYYY-MM"
    }

    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    // Fetch records
    const records = await Attendance.find({
      adminId: req.user.id,
      date: { $gte: start, $lte: end }
    }).populate("memberId", "name");

    // Get all days in month
    const daysInMonth = new Date(year, m, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Group by member
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
      overview[id].days[day] = 1; // present
    });

    // Normalize into grid (fill absents with 0)
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
      adminId: req.user.id,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      memberId,
      adminId: req.user.id,
      date: today, // store as proper Date
      checkInTime: new Date().toLocaleTimeString(),
      adminId: req.user.id
    });

    await attendance.save();
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message + 'h' });
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
    }).select("memberId -_id"); // only return memberId

    res.json(records); // e.g. [ { "memberId": "66d3..." }, ... ]
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
