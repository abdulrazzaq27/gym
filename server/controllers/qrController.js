// server/controllers/qrController.js
const Attendance = require("../models/Attendance");
const Member = require("../models/Member");
const crypto = require('crypto');

// Generate dynamic QR code for gym (admin)
exports.generateQRCode = async (req, res) => {
  try {
    const adminId = req.user.id; // From admin auth
    const timestamp = Date.now();
    const expiryTime = 60 * 1000; // 60 seconds expiry
    
    // Create QR data with expiry
    const qrData = JSON.stringify({
      adminId,
      timestamp,
      expiry: timestamp + expiryTime
    });
    
    res.json({
      qrData: qrData,
      expiry: new Date(timestamp + expiryTime),
      message: 'QR code generated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
};

// Verify and mark attendance via gym QR (member scanning)
exports.scanGymQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const memberId = req.member.id; // From member auth

    const parsedQrData = JSON.parse(qrData);
    const { adminId: qrAdminId, expiry } = parsedQrData;

    if (Date.now() > expiry) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.adminId.toString() !== qrAdminId) {
      return res.status(403).json({ message: 'You are not a member of this gym' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance already marked for today
    const existingAttendance = await Attendance.findOne({
      memberId,
      date: today
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }
    
    // Create attendance record
    const attendance = new Attendance({
      memberId,
      adminId: member.adminId,
      date: today,
      checkInTime: new Date().toLocaleTimeString(),
      markedBy: 'qr_self'
    });
    
    await attendance.save();
    
    res.json({ 
      message: 'Attendance marked successfully via QR',
      attendance 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning QR code', error: error.message });
  }
};

// Get member's personal QR code
exports.getMemberQRCode = async (req, res) => {
  try {
    const memberId = req.member.id;
    
    // Create member QR data (static)
    const qrData = JSON.stringify({
      memberId,
      type: 'member_attendance'
    });
    
    const encodedData = Buffer.from(qrData).toString('base64');
    
    res.json({
      qrCode: encodedData,
      memberId,
      message: 'Member QR code generated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating member QR code', error: error.message });
  }
};

// Verify member QR code (admin scanning)
exports.scanMemberQR = async (req, res) => {
  try {
    const { memberQRData } = req.body;
    const adminId = req.user.id;
    
    // Decode member QR data
    const decodedData = JSON.parse(Buffer.from(memberQRData, 'base64').toString());
    const memberId = decodedData.memberId;
    
    // Verify member exists and belongs to this admin
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.adminId.toString() !== adminId) {
      return res.status(403).json({ message: 'Member does not belong to your gym' });
    }
    
    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      memberId,
      date: today
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }
    
    // Create attendance record
    const attendance = new Attendance({
      memberId,
      adminId,
      date: today,
      checkInTime: new Date().toLocaleTimeString(),
      markedBy: 'qr_admin',
      markedByAdmin: adminId
    });
    
    await attendance.save();
    
    res.json({ 
      message: 'Attendance marked successfully',
      attendance,
      memberName: member.name 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scanning member QR', error: error.message });
  }
};