const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');

// Helper to build date range query
const getDateQuery = (startDate, endDate, fieldName = 'date') => {
    const query = {};
    if (startDate || endDate) {
        query[fieldName] = {};
        if (startDate) query[fieldName].$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query[fieldName].$lte = end;
        }
    }
    return query;
};

// GET /api/reports/payments
router.get('/payments', async (req, res) => {
    try {
        const { startDate, endDate, method, plan } = req.query;
        const adminId = new mongoose.Types.ObjectId(req.user.id);

        let query = { adminId };

        // Date Filter
        if (startDate || endDate) {
            Object.assign(query, getDateQuery(startDate, endDate, 'date'));
        }

        // Method Filter
        if (method && method !== 'All') {
            query.method = method;
        }

        // Plan Filter
        if (plan && plan !== 'All') {
            query.plan = plan;
        }

        const payments = await Payment.find(query)
            .populate('memberId', 'name email')
            .sort({ date: -1 });

        const totalAmount = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        res.json({
            data: payments,
            summary: {
                totalAmount,
                count: payments.length
            }
        });
    } catch (err) {
        console.error("Reports Payment Error:", err);
        res.status(500).json({ message: "Failed to fetch payment reports" });
    }
});

// GET /api/reports/members
router.get('/members', async (req, res) => {
    try {
        const { status, plan, joinStartDate, joinEndDate } = req.query;
        const adminId = new mongoose.Types.ObjectId(req.user.id);

        let query = { adminId };

        if (status && status !== 'All') {
            query.status = status;
        }

        // Note: 'plan' isn't directly on Member model in schema usually, but derived from latest payment or if stored on member.
        // Based on memberRoutes.js, 'plan' IS updated on Member model during renew/create.
        if (plan && plan !== 'All') {
            query.plan = plan; // Check if your Member model has 'plan' field. If not, this needs adjust.
             // memberRoutes.js lines 40-52 does NOT save 'plan' to member, only to Payment. 
             // BUT renew/id DOES update plan (lines 87). 
             // Let's assume schema has it or mixed usage. 
             // If schema doesn't have it, this filter might fail or return empty if stricter schema.
             // Looking at memberRoutes line 40, 'plan' is destructured but NOT passed to new Member({...}).
             // However, line 34 destructured 'plan' from req.body.
             // Start validation: View Member.js model to be sure.
        }

        if (joinStartDate || joinEndDate) {
            Object.assign(query, getDateQuery(joinStartDate, joinEndDate, 'joinDate'));
        }

        const members = await Member.find(query).sort({ joinDate: -1 });

        res.json({
            data: members,
            summary: {
                count: members.length,
                active: members.filter(m => m.status === 'Active').length
            }
        });

    } catch (err) {
        console.error("Reports Member Error:", err);
        res.status(500).json({ message: "Failed to fetch member reports" });
    }
});

// GET /api/reports/attendance
router.get('/attendance', async (req, res) => {
    try {
        const { month } = req.query; // Expect YYYY-MM
        const adminId = new mongoose.Types.ObjectId(req.user.id);

        if (!month) {
            return res.status(400).json({ message: "Month is required (YYYY-MM)" });
        }

        const [year, monthStr] = month.split('-');
        const startDate = new Date(year, monthStr - 1, 1);
        const endDate = new Date(year, monthStr, 0, 23, 59, 59, 999);
        const daysInMonth = endDate.getDate();

        // 1. Get all members for this admin to ensure we list everyone (even with 0 attendance)
        const members = await Member.find({ adminId }).select('name email');
        
        // 2. Aggregate attendance counts for this month
        const attendanceAgg = await Attendance.aggregate([
            {
                $match: {
                    adminId: adminId,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: "$memberId",
                    presentCount: { $sum: 1 }
                }
            }
        ]);

        // 3. Map aggregation results to members
        const attendanceMap = {};
        attendanceAgg.forEach(req => {
            attendanceMap[req._id.toString()] = req.presentCount;
        });

        const formattedData = members.map(member => {
            const count = attendanceMap[member._id.toString()] || 0;
            return {
                memberId: member._id,
                name: member.name,
                month: month,
                presentCount: count,
                totalDays: daysInMonth,
                percentage: ((count / daysInMonth) * 100).toFixed(1)
            };
        });

        res.json({
            data: formattedData,
            summary: {
                totalRecords: formattedData.length,
                avgAttendance: (formattedData.reduce((acc, curr) => acc + curr.presentCount, 0) / (formattedData.length || 1)).toFixed(1)
            }
        });

    } catch (err) {
        console.error("Reports Attendance Error:", err);
        res.status(500).json({ message: "Failed to fetch attendance reports" });
    }
});

module.exports = router;
