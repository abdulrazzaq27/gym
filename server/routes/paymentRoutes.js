// server/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/history/:id', async (req, res) => {
  try {
    const payments = await Payment.find({ memberId: req.params.id }).sort({ date: -1 });
    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
