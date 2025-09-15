const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');

// 🔐 Middleware should already decode JWT and set req.user.id = adminId

// GET all members of logged-in admin
router.get('/', async (req, res) => {
  try {
    const members = await Member.find({ adminId: req.user.id });
    res.json(members);
  } catch (err) {
    console.error("Error retrieving Members:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET one member (only if belongs to this admin)
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    console.error("Error fetching Member:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE new member (auto-assign to logged-in admin)
router.post('/', async (req, res) => {
  const {
    name, email, phone, plan, joinDate, expiryDate, status,
    gender, dob, notes,
    amount, paymentMethod
  } = req.body;

  try {
    const newMember = new Member({
      name,
      email,
      phone,
      plan,
      joinDate,
      expiryDate,
      renewalDate: joinDate,
      status,
      gender,
      dob,
      notes,
      adminId: req.user.id
    });

    const savedMember = await newMember.save();

    const payment = new Payment({
      memberId: savedMember._id,
      amount,
      method: paymentMethod,
      adminId: req.user.id
    });

    await payment.save();

    res.status(201).json({ message: 'Member created with payment', member: savedMember, payment });
  } catch (err) {
    console.error("Create member error:", err);
    res.status(500).json({ message: err.message || 'Failed to create member' });
  }
});

// RENEW membership (only admin’s member)
router.put('/renew/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { renewalDate, expiryDate, status, plan, amount, paymentMethod } = req.body;

    // ✅ Ensure the member belongs to this admin
    const updatedMember = await Member.findOneAndUpdate(
      { _id: id, adminId: req.user.id },
      {
        renewalDate,
        expiryDate,
        status: 'Active',
        plan
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found or not yours' });
    }

    const updatedPayment = new Payment({
      memberId: id,
      amount,
      date: renewalDate,
      method: paymentMethod,
      adminId: req.user.id
    });

    await updatedPayment.save();

    return res.status(200).json({
      message: 'Membership renewed successfully',
      member: updatedMember,
      payment: updatedPayment
    });

  } catch (e) {
    console.error("Error Renewing Member:", e);
    return res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});

module.exports = router;
