require('dotenv').config(); 
const express = require('express');

require('./cron/updateMemberStatus');

const connectDB = require('./config/db');
const cors = require('cors');

connectDB();
const app = express();

const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

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


app.use('/api/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
