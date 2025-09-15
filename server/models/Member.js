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
  },
  phone: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
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
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;
