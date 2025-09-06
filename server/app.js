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


// app.use(cors());

// *****************  INSERTING DUMMY DATA **********************
// const Member = require('./models/Member'); // Your Mongoose model
// const members = require('./data/dummy.js');


// Member.insertMany(members)
//   .then(() => console.log('Members inserted!'))
//   .catch(err => console.error(err));
// ----------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({ message: 'GYM API is running!!!' });
});


app.use('/api/members',auth, memberRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use("/api/auth", authRoutes);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
