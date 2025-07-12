const express = require('express');

const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); 

connectDB();
const app = express();

app.get('/', (req, res) => {
    res.json({ message: 'GYM API is running!!!' });
  });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
