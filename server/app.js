// server/app.js
require('dotenv').config(); 
const express = require('express');
require('./cron/updateMemberStatus');
const connectDB = require('./config/db');
const cors = require('cors');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

connectDB();
const app = express();

app.use(cors({
  origin: "*", // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 35 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body Parser
app.use(express.json());

// Prevent Parameter Pollution
app.use(hpp());

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

app.get('/', (req, res) => {
  res.json({ message: 'GYM API is running!!!' });
});

// Admin routes (using adminAuth)
app.use('/api/members', adminAuth, memberRoutes);
app.use('/api/dashboard', adminAuth, dashboardRoutes);
app.use('/api/payments', adminAuth, paymentRoutes);
app.use('/api/attendance', adminAuth, attendanceRoutes);
app.use('/api/settings', adminAuth, settingsRoutes);
app.use('/api/reports', adminAuth, reportRoutes);

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