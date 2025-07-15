const express = require('express');
const router = express.Router();
const dummyData = require('../data/dummy');
const Member = require('../models/Member')
const Payment = require('../models/Payment')

router.get('/', async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  }
  catch (err) {
    console.log("Error retreiving Members", err);
  }
});

// GET /api/members/:id
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  const { name, plan, joinDate, expiryDate, status,
    gender, dob, notes,
    amount, paymentMethod } = req.body;
  try {
    const newMember = new Member(name, plan, joinDate, expiryDate, status,
    gender, dob, notes,
    amount, paymentMethod);
    const savedMember = await newMember.save();
    res.status(201).json(newMember);

    const payment = new Payment({
      memberId: savedMember._id,
      amount,
      method: paymentMethod
    })

    await payment.save();
   res.status(201).json({ message: 'Member created with payment' });
  } catch (err) {
    console.error("Create member error:", err);
    res.status(500).json({ message: 'Failed to create member' });
  }
});


// router.post('/seed', async (req, res) => {
//   await Member.insertMany(dummyData);
//   res.send("Seeded!");
// });


module.exports = router;
