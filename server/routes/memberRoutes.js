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
  const {
    name, email, phone, plan, joinDate, expiryDate, status,
    gender, dob, notes,
    amount, paymentMethod
  } = req.body;

  try {
    // Create and save the member
    const newMember = new Member({
      name,
      email,
      phone,
      plan,
      joinDate,
      expiryDate,
      renewalDate: joinDate, // You missed this earlier
      status,
      gender,
      dob,
      notes,
    });

    const savedMember = await newMember.save();

    // Create and save payment
    const payment = new Payment({
      memberId: savedMember._id,
      amount,
      method: paymentMethod,
    });

    await payment.save();

    // Respond once
    res.status(201).json({ message: 'Member created with payment' });
  } catch (err) {
    console.error("Create member error:", err);
    res.status(500).json({ message: err.message || 'Failed to create member' });
  }
});

router.put('/renew/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const { joinDate, expiryDate, status, plan, amount, paymentMethod } = req.body;

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      {
        joinDate,
        expiryDate,
        status: 'Active',
        plan,
        amount,
        paymentMethod
      },
      { new: true } // returns the updated document
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }

    return res.status(200).json({ message: 'Membership renewed successfully', member: updatedMember });
  } catch (e) {
    console.error("Error Renewing Member:", e);
    return res.status(500).json({ message: 'Internal server error', error: e.message });
  }
});
 


// router.post('/seed', async (req, res) => {
//   await Member.insertMany(dummyData);
//   res.send("Seeded!");
// });


module.exports = router;
