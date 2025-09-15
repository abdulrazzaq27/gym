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
const auth = require("./middlewares/authMiddleware");

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json()); // to parse JSON body

// app.use((req, res, next) => {
//   if (req.user) {
//     req.adminId = req.user.id;
//     console.log(req.adminId);
//   }
//   next();
// });


app.get('/', (req, res) => {
  res.json({ message: 'GYM API is running!!!' });
});


app.use('/api/members',auth, memberRoutes);
app.use('/api/dashboard',auth, dashboardRoutes);

app.use('/api/payments',auth, paymentRoutes);
app.use('/api/attendance',auth, attendanceRoutes);

app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
