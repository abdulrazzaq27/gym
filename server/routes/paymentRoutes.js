const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Member = require('../models/Member');

router.get("/", async (req, res) => {
  try {
    const { page, limit, search, status } = req.query;
    console.log("DEBUG: GET /api/payments", req.query);

    const query = { adminId: req.user.id };

    // Search by member name
    if (search) {
      const matchingMembers = await Member.find({
        adminId: req.user.id,
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const memberIds = matchingMembers.map(m => m._id);
      query.memberId = { $in: memberIds };
    }

    // Filter by Month (YYYY-MM)
    if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by status (if needed in future)
    if (status && status !== 'all') {
      query.status = status;
    }

    // Determine pagination
    const isPaginationRequest = page || limit;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 15;
    const skip = (pageNum - 1) * limitNum;

    // Get total count and stats for the filtered query
    const totalPayments = await Payment.countDocuments(query);
    console.log(`DEBUG: Total payments count: ${totalPayments}`);
    console.log(`DEBUG: Query:`, JSON.stringify(query));
    
    // Calculate total amount for stats (for the entire filtered dataset)
    // Use manual calculation as it's more reliable with complex queries
    let stats = { totalAmount: 0, count: 0 };
    
    const allPayments = await Payment.find(query).select('amount');
    console.log(`DEBUG: Found ${allPayments.length} payments for stats calculation`);
    
    stats = {
      totalAmount: allPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      count: allPayments.length
    };
    
    console.log(`DEBUG: Stats calculated:`, stats);

    // Fetch paginated payments
    const payments = await Payment.find(query)
      .populate("memberId", "name")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    console.log(`DEBUG: Found ${payments.length} payments out of ${totalPayments}`);

    if (isPaginationRequest) {
      res.json({
        success: true,
        data: payments,
        pagination: {
          total: totalPayments,
          pages: Math.ceil(totalPayments / limitNum),
          currentPage: pageNum
        },
        stats
      });
    } else {
      // Return all payments matching the query (including month filter)
      const allPayments = await Payment.find(query)
        .populate("memberId", "name")
        .sort({ date: -1 });

      const stats = {
        totalAmount: allPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        count: allPayments.length
      };

      res.json({ success: true, data: allPayments, stats });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: `Server error : ${err}` });
  }
})

const { mongoIdParamValidation } = require('../middlewares/validationMiddleware');

router.get('/history/:id', mongoIdParamValidation, async (req, res) => {
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

// EXPORT payments as CSV
router.get('/export', async (req, res) => {
  try {
    const payments = await Payment.find({ adminId: req.user.id })
      .populate("memberId", "name")
      .sort({ date: -1 });

    // CSV headers
    const headers = ['Member Name', 'Amount', 'Plan', 'Payment Method', 'Date'];
    
    // CSV rows
    const rows = payments.map(p => [
      p.memberId?.name || 'N/A',
      p.amount || 0,
      p.plan || '',
      p.method || '',
      p.date ? new Date(p.date).toLocaleDateString('en-US') : ''
    ]);

    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csvContent);
  } catch (err) {
    console.error("Error exporting payments:", err);
    res.status(500).json({ message: 'Failed to export payments' });
  }
});

module.exports = router;
