const express = require('express');
const router = express.Router();

const Attendance = require('../models/Attendance');

router.get('/', (req, res) => {
    res.send("Attendance router is working");
})

module.exports = router;