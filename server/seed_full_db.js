const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const Member = require('./models/Member');
const Payment = require('./models/Payment');
const Attendance = require('./models/Attendance');
require('dotenv').config();

const PLANS = [
  { name: 'Monthly', amount: 1000, months: 1 },
  { name: 'Quarterly', amount: 2700, months: 3 },
  { name: 'Half-Yearly', amount: 5100, months: 6 },
  { name: 'Yearly', amount: 9600, months: 12 }
];

const METHODS = ['UPI', 'Cash', 'Card'];
const GENDERS = ['Male', 'Female', 'Other'];

const STATUSES = ['Active', 'Active', 'Active', 'Inactive']; // Removed 'Expired' as it's not in schema enum

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/gym');
    console.log('MongoDB Connected for Seeding');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const seed = async () => {
    await connectDB();

    console.log("⚠️  Deleting all existing data...");
    await Admin.deleteMany({});
    await Member.deleteMany({});
    await Payment.deleteMany({});
    await Attendance.deleteMany({});

    console.log("✅ Data cleared.");

    // 1. Create Default Admin
    const hashedPassword = await bcrypt.hash('password', 10);
    const admin = new Admin({
        name: "Owner",
        email: "owner@owner.com",
        password: hashedPassword,
        role: "admin",
        gymName: "FitZone Pro",
        gymCode: "FIT001"
    });
    await admin.save();
    console.log(`✅ Admin created: ${admin.email} / password`);

    const members = [];
    const payments = [];
    const attendanceRecords = [];

    // 2. Create 100 Members
    console.log("🌱 Generating 100 members...");

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 4); // Start from 4 months ago

    for (let i = 1; i <= 100; i++) {
        const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
        const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        
        // Random join date within last 4 months
        const joinDate = new Date(startDate.getTime() + Math.random() * (new Date().getTime() - startDate.getTime()));
        
        // Calculate expiry based on plan
        const expiryDate = new Date(joinDate);
        expiryDate.setMonth(expiryDate.getMonth() + plan.months);

        const member = new Member({
            adminId: admin._id,
            name: `Member ${i}`,
            email: `member${i}@test.com`,
            phone: `98765432${String(i).padStart(2, '0')}`,
            gender,
            dob: new Date(1990 + Math.floor(Math.random() * 20), 0, 1),
            joinDate,
            renewalDate: joinDate, // Simplifying: last renewal was join date for now
            expiryDate,
            status: status, 
            plan: plan.name,
            notes: "Seed data member"
        });

        // Ensure status reflects mostly active/expired correctly
        if (member.expiryDate < new Date()) {
            member.status = 'Inactive';
        } else if (status === 'Inactive') {
            member.status = 'Inactive';
        } else {
            member.status = 'Active';
        }

        members.push(member);

        // 3. Create initial payment
        payments.push({
            adminId: admin._id,
            memberId: member._id,
            plan: plan.name,
            amount: plan.amount,
            date: joinDate,
            method: METHODS[Math.floor(Math.random() * METHODS.length)]
        });

        // 4. Generate Attendance
        // If active, generate random attendance from join date to today
        if (member.status === 'Active' || member.status === 'Expired') {
            const daysToGenerate = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
            
            for (let d = 0; d <= daysToGenerate; d++) {
                const currentDate = new Date(joinDate);
                currentDate.setDate(currentDate.getDate() + d);

                // Skip future days
                if (currentDate > new Date()) break;

                // 70% chance to attend
                if (Math.random() > 0.3) {
                    attendanceRecords.push({
                        adminId: admin._id,
                        memberId: member._id,
                        date: currentDate,
                        checkInTime: `${8 + Math.floor(Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                        markedBy: 'manual'
                    });
                }
            }
        }
    }

    await Member.insertMany(members);
    console.log("✅ Members inserted.");

    // Need to map payments to saved member IDs? insertMany preserves _id if generated in code. Mongoose does duplicate check but since we created `new Member()` with `_id` implicitly generated, it should work. Wait, `new Member` generates `_id` immediately. Yes.
    
    await Payment.insertMany(payments);
    console.log("✅ Payments inserted.");

    await Attendance.insertMany(attendanceRecords);
    console.log("✅ Attendance inserted.");

    console.log("🎉 Seeding complete!");
    process.exit();
};

seed();
