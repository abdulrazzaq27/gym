const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const { adminAuth, memberAuth } = require("../middlewares/authMiddleware");

// ---------------------------------------------
// ADMIN: Get monthly attendance overview for all members
// ---------------------------------------------
router.get("/", adminAuth, async (req, res) => {
  try {
    let { month } = req.query;

    if (!month) {
      const today = new Date();
      month = today.toISOString().slice(0, 7); // YYYY-MM
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
      overview[id].days[day] = 1; // present
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

// ---------------------------------------------
// ADMIN: Mark attendance manually
// ---------------------------------------------
router.post("/mark/:memberId", adminAuth, async (req, res) => {
  const { memberId } = req.params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  try {
    const existing = await Attendance.findOne({
      memberId,
      adminId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      memberId,
      adminId: req.user.id,
      date: new Date(),
      checkInTime: new Date().toLocaleTimeString(),
      markedBy: "manual"
    });

    await attendance.save();

    const updated = await Attendance.findById(attendance._id).populate("memberId", "name");

    res.json({
      message: "Attendance marked successfully",
      updatedMember: {
        _id: updated.memberId._id,
        name: updated.memberId.name,
        todayAttendance: true,
        checkInTime: updated.checkInTime
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------
// ADMIN: Get today's marked members
// ---------------------------------------------
router.get("/today", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const records = await Attendance.find({
      adminId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).populate("memberId", "name");

    const formatted = records.map(r => ({
      memberId: r.memberId._id,
      name: r.memberId.name,
      checkInTime: r.checkInTime,
      markedBy: r.markedBy,
      todayAttendance: true
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------
// MEMBER: Get personal attendance with absent days
// ---------------------------------------------
router.get("/:memberId", memberAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { month, year } = req.query;

    // ✅ ensure member only fetches their own data
    if (req.member.id !== memberId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const today = new Date();
    const y = year ? parseInt(year) : today.getFullYear();
    const m = month ? parseInt(month) - 1 : today.getMonth();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0);

    const records = await Attendance.find({
      memberId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    const presentDays = new Set(records.map(r => new Date(r.date).toISOString().split("T")[0]));

    let calendar = [];
    for (let d = 1; d <= endDate.getDate(); d++) {
      const day = new Date(y, m, d);
      const key = day.toISOString().split("T")[0];
      calendar.push({
        date: day,
        present: presentDays.has(key)
      });
    }

    const presentCount = calendar.filter(d => d.present).length;
    const absentCount = calendar.length - presentCount;
    const percentage = ((presentCount / calendar.length) * 100).toFixed(2);

    res.json({ calendar, presentCount, absentCount, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
