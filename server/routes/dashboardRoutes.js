const express = require('express');
const router = express.Router();

// Example: dummy stats response
router.get('/stats', (req, res) => {
  res.json({
    totalMembers: 25,
    activeMembers: 20,
    expiredMembers: 5,
  });
});

const Member = require('../models/Member');

router.get('/recent-members', async (req, res) => {
  try {
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ recentMembers });
  } catch (err) {
    console.error('Error fetching recent members:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/expiring-members', async (req, res) => {
  try {
    const today = new Date();
    const expiringSoon = new Date();
    expiringSoon.setDate(today.getDate() + 7); // next 7 days

    const expiringMembers = await Member.find({
      expiryDate: { $gte: today, $lte: expiringSoon }
    }).sort({ expiryDate: 1 });

    res.json({ expiringMembers });
  } catch (err) {
    console.error('Error fetching expiring members:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;
