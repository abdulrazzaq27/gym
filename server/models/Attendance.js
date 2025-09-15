const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);