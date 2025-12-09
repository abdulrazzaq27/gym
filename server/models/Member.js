const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,   // make required so OTP login always has email
  },
  password: { 
    type: String,
    required: false ,
  },

  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  dob: Date,
  joinDate: {
    type: Date,
    required: true,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
  },
  plan: {
    type: String
  },
  notes: {
    type: String,
    trim: true,
  },

  // 🔑 new fields for OTP login
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
}, 
{ timestamps: true });

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;
