const Member = require("../models/Member");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// STEP 1: Request OTP
const requestOtp = async (req, res) => {
  try {
    const { email, gymIdentifier } = req.body;

    const admin = await Admin.findOne({
      $or: [{ gymCode: gymIdentifier }, { gymName: gymIdentifier }],
    });
    if (!admin) return res.status(404).json({ msg: "Gym not found" });

    const member = await Member.findOne({ email, adminId: admin._id });
    if (!member) return res.status(404).json({ msg: "Member not found" });

    const otp = crypto.randomInt(100000, 999999).toString();

    member.otp = otp;
    member.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await member.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// STEP 2: Verify OTP (issue temp token for password setup)
const verifyOtp = async (req, res) => {
  try {
    const { email, gymIdentifier, otp } = req.body;

    const admin = await Admin.findOne({
      $or: [{ gymCode: gymIdentifier }, { gymName: gymIdentifier }],
    });
    if (!admin) return res.status(404).json({ msg: "Gym not found" });

    const member = await Member.findOne({ email, adminId: admin._id });
    if (!member) return res.status(404).json({ msg: "Member not found" });

    if (!member.otp || !member.otpExpiry) {
      return res.status(400).json({ msg: "No OTP requested" });
    }
    if (member.otp !== otp || Date.now() > member.otpExpiry) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    member.otp = undefined;
    member.otpExpiry = undefined;
    await member.save();

    // issue temporary token (5 mins)
    const tempToken = jwt.sign(
      { id: member._id, role: "member" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      msg: "OTP verified. Please set your password.",
      token: tempToken,
      memberId: member._id,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// STEP 3: Set Password (requires temp token)
const setPassword = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { password } = req.body;
    const member = await Member.findById(decoded.id);
    if (!member) return res.status(404).json({ msg: "Member not found" });

    const salt = await bcrypt.genSalt(10);
    member.password = await bcrypt.hash(password, salt);
    await member.save();

    res.json({ msg: "Password set successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// STEP 4: Login with Password
const loginWithPassword = async (req, res) => {
  try {
    const { email, password, gymIdentifier } = req.body;

    const admin = await Admin.findOne({
      $or: [{ gymCode: gymIdentifier }, { gymName: gymIdentifier }],
    });
    if (!admin) return res.status(404).json({ msg: "Gym not found" });

    const member = await Member.findOne({ email, adminId: admin._id });
    if (!member || !member.password) {
      return res.status(404).json({ msg: "Member not found or password not set" });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: member._id, role: "member", adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      member: { id: member._id, name: member.name, email: member.email },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { requestOtp, verifyOtp, setPassword, loginWithPassword };
