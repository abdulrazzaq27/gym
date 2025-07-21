const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },
    date: Date,
    time: Date,
})

module.exports = mongoose.model('Attendance', attendanceSchema)