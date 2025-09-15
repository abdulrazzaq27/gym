const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// ✅ Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const [totalMembers, activeMembers, inactiveMembers] = await Promise.all([
      Member.countDocuments({ adminId }),
      Member.countDocuments({ adminId, status: 'Active' }),
      Member.countDocuments({ adminId, status: 'Inactive' })
    ]);

    res.json({ totalMembers, activeMembers, inactiveMembers });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// ✅ Recent Members
router.get('/recent-members', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const recentMembers = await Member.find({ adminId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email status createdAt')
      .lean();

    res.json({ recentMembers });
  } catch (err) {
    console.error('Error fetching recent members:', err);
    res.status(500).json({ message: 'Failed to fetch recent members' });
  }
});

// ✅ Expiring Members
router.get('/expiring-members', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringSoon = new Date(today);
    expiringSoon.setDate(today.getDate() + daysAhead);

    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const expiringMembers = await Member.find({
      adminId,
      expiryDate: { $gte: today, $lte: expiringSoon },
      status: 'Active'
    })
      .sort({ expiryDate: 1 })
      .select('name email expiryDate status')
      .lean();

    res.json({ expiringMembers, count: expiringMembers.length });
  } catch (err) {
    console.error('Error fetching expiring members:', err);
    res.status(500).json({ message: 'Failed to fetch expiring members' });
  }
});

// ✅ Revenue Data
router.get('/revenue', async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const [monthlyRevenue, annualRevenue, totalRevenue] = await Promise.all([
      Payment.aggregate([
        { $match: { adminId } },
        {
          $group: {
            _id: { year: { $year: "$date" }, month: { $month: "$date" } },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      Payment.aggregate([
        { $match: { adminId } },
        {
          $group: {
            _id: { $year: "$date" },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": -1 } }
      ]),

      Payment.aggregate([
        { $match: { adminId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      monthlyRevenue,
      annualRevenue,
      totalRevenue: totalRevenue[0] || { total: 0, count: 0 }
    });
  } catch (err) {
    console.error('Error fetching revenue:', err);
    res.status(500).json({ message: 'Failed to fetch revenue data' });
  }
});

// ✅ Member Growth
router.get('/member-growth', async (req, res) => {
  try {
    const adminId = new mongoose.Types.ObjectId(req.user.id);

    const memberGrowth = await Member.aggregate([
      { $match: { adminId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    res.json({ memberGrowth });
  } catch (err) {
    console.error('Error fetching member growth:', err);
    res.status(500).json({ message: 'Failed to fetch member growth data' });
  }
});

module.exports = router;
