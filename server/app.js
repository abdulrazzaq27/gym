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
const authRoutes = require("./routes/authRoutes");
const { adminAuth } = require("./middlewares/authMiddleware"); // Fixed import
const memberAuthRoutes = require("./routes/memberAuthRoutes");
const qrRoutes = require('./routes/qrRoutes');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'GYM API is running!!!' });
});

// Admin routes (using adminAuth)
app.use('/api/members', adminAuth, memberRoutes);
app.use('/api/dashboard', adminAuth, dashboardRoutes);
app.use('/api/payments', adminAuth, paymentRoutes);
app.use('/api/attendance', adminAuth, attendanceRoutes);

// Auth routes (no auth middleware needed as they handle login)
app.use("/api/auth", authRoutes);
app.use("/api/member-auth", memberAuthRoutes);

// QR routes - FIXED PATH
app.use("/api/qr", qrRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});