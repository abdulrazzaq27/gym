// server/app.js
require('dotenv').config(); 
const express = require('express');
require('./cron/updateMemberStatus');
const connectDB = require('./config/db');
const cors = require('cors');

connectDB();
const app = express();

const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const settingsRoutes = require('./routes/settingsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require("./routes/authRoutes");
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const qrRoutes = require('./routes/qrRoutes');
const { adminAuth, memberAuth } = require("./middlewares/authMiddleware"); // include memberAuth

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'GYM API is running!!!' });
});


app.use('/api/members',auth, memberRoutes);
app.use('/api/dashboard',auth, dashboardRoutes);

app.use('/api/payments',auth, paymentRoutes);
app.use('/api/attendance',auth, attendanceRoutes);
app.use('/api/settings', auth, settingsRoutes);
app.use('/api/reports', auth, reportRoutes);

// Auth routes (no auth middleware needed as they handle login)
app.use("/api/auth", authRoutes);
app.use("/api/member-auth", memberAuthRoutes);

// QR routes - FIXED PATH
app.use("/api/qr", qrRoutes);
const Attendance = require("./models/Attendance");
app.get("/api/member/attendance", memberAuth, async (req, res) => {
  try {
    const records = await Attendance.find({ memberId: req.member.id })
      .sort({ date: -1 })
      .select("date checkInTime markedBy");

    // Format for frontend
    const formatted = records.map(r => ({
      _id: r._id,
      date: r.date,
      present: true,
      checkInTime: r.checkInTime,
      markedBy: r.markedBy
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});