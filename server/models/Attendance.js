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
  },
  markedBy: {
    type: String,
    enum: ['manual', 'qr_self', 'qr_admin'],
    default: 'manual'
  },
  markedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  qrData: {
    type: String // Store the QR data that was scanned (optional)
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);