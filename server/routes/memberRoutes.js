const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Payment = require('../models/Payment');

// 🔐 Middleware should already decode JWT and set req.user.id = adminId

// GET all members of logged-in admin (supports pagination, search, sort, filter)
router.get('/', async (req, res) => {
  try {
    const { page, limit, search, status, sortBy, sortOrder } = req.query;
    console.log("DEBUG: GET /api/members", req.query);

    const query = { adminId: req.user.id };

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sorting
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }
    // Secondary sort for stable pagination
    sort._id = -1;

    // Determine pagination
    const isPaginationRequest = page || limit;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10000; 
    const skip = (pageNum - 1) * limitNum;

    const totalMembers = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    console.log(`DEBUG: Found ${members.length} members out of ${totalMembers}`);

    if (isPaginationRequest) {
      res.json({
          members,
          totalMembers,
          totalPages: Math.ceil(totalMembers / limitNum),
          currentPage: pageNum
      });
    } else {
      res.json(members);
    }

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
      joinDate,
      expiryDate,
      renewalDate: joinDate,
      status,
      gender,
      dob,
      notes,
      plan,
      adminId: req.user.id
    });

    const savedMember = await newMember.save();

    const payment = new Payment({
      memberId: savedMember._id,
      amount,
      plan,
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
      adminId: req.user.id,
      plan
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

// EXPORT members as CSV
router.get('/export', async (req, res) => {
  try {
    const members = await Member.find({ adminId: req.user.id })
      .sort({ createdAt: -1 });

    // CSV headers
    const headers = ['Name', 'Email', 'Phone', 'Gender', 'DOB', 'Join Date', 'Expiry Date', 'Renewal Date', 'Status', 'Plan', 'Notes'];
    
    // CSV rows
    const rows = members.map(m => [
      m.name || '',
      m.email || '',
      m.phone || '',
      m.gender || '',
      m.dob ? new Date(m.dob).toLocaleDateString('en-US') : '',
      m.joinDate ? new Date(m.joinDate).toLocaleDateString('en-US') : '',
      m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-US') : '',
      m.renewalDate ? new Date(m.renewalDate).toLocaleDateString('en-US') : '',
      m.status || '',
      m.plan || '',
      m.notes || ''
    ]);

    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=members_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csvContent);
  } catch (err) {
    console.error("Error exporting members:", err);
    res.status(500).json({ message: 'Failed to export members' });
  }
});

module.exports = router;
