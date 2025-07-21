const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalMembers, activeMembers, inactiveMembers] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.countDocuments({ status: 'Inactive' })
    ]);

    res.json({
      totalMembers,
      activeMembers,
      inactiveMembers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics' 
    });
  }
});

// Get recent members
router.get('/recent-members', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email status createdAt')
      .lean();

    res.json({ 
      success: true,
      recentMembers 
    });
  } catch (error) {
    console.error('Error fetching recent members:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent members' 
    });
  }
});

// Get members expiring soon
router.get('/expiring-members', async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiringSoon = new Date(today);
    expiringSoon.setDate(today.getDate() + daysAhead);

    const expiringMembers = await Member.find({
      expiryDate: { 
        $gte: today, 
        $lte: expiringSoon 
      },
      status: 'Active'
    })
    .sort({ expiryDate: 1 })
    .select('name email expiryDate status')
    .lean();

    res.json({ 
      success: true,
      expiringMembers,
      count: expiringMembers.length
    });
  } catch (error) {
    console.error('Error fetching expiring members:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch expiring members' 
    });
  }
});

// Get revenue data
router.get('/revenue', async (req, res) => {
  try {
    const [monthlyRevenue, annualRevenue, totalRevenue] = await Promise.all([
      // Monthly revenue for all years and months
      Payment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }
            },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]),
      
      // Annual revenue
      Payment.aggregate([
        {
          $group: {
            _id: { $year: "$date" },
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": -1 }
        }
      ]),
      
      // Total revenue
      Payment.aggregate([
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
      success: true,
      monthlyRevenue,
      annualRevenue,
      totalRevenue: totalRevenue[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch revenue data' 
    });
  }
});

// Get member growth analytics
router.get('/member-growth', async (req, res) => {
  try {
    const memberGrowth = await Member.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $limit: 12 // Last 12 months
      }
    ]);

    res.json({ 
      success: true,
      memberGrowth 
    });
  } catch (error) {
    console.error('Error fetching member growth:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch member growth data' 
    });
  }
});

module.exports = router;
