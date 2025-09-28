const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get("/", async (req, res) => {
  try {

    // const id = req.params.id;
    // const payments = await Payment.find({ adminId: req.user.id }).sort({ date: -1 });
    const payments = await Payment.find({ adminId: req.user.id })
      .populate("memberId", "name")  // only get member name
      .sort({ date: -1 });


    res.json({ success: true, data: payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Server error : ${err}` });
  }
})

router.get('/history/:id', async (req, res) => {
  try {
    // const payments = await Payment.find({ memberId: req.params.id }).sort({ date: -1 });
    const payments = await Payment.find({ memberId: req.params.id })
      .populate("memberId", "name")
      .sort({ date: -1 });

    res.status(200).json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
