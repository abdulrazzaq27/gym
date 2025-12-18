const mongoose = require('../server/node_modules/mongoose');
const bcrypt = require('../server/node_modules/bcryptjs');
const Admin = require('../server/models/Admin');
const Member = require('../server/models/Member');
const Payment = require('../server/models/Payment');
const Attendance = require('../server/models/Attendance');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

// SAFETY CHECK: Prevent running in production
if (process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL: Cannot run seed script in production environment!');
  process.exit(1);
}

const PLANS = [
  { name: 'Monthly', amount: 1000, months: 1 },
  { name: 'Quarterly', amount: 2700, months: 3 },
  { name: 'Half-Yearly', amount: 5100, months: 6 },
  { name: 'Yearly', amount: 9600, months: 12 }
];

const METHODS = ['UPI', 'Cash', 'Card'];
const GENDERS = ['Male', 'Female', 'Other'];

// 75% active members: 3 Active for every 1 Inactive
const STATUSES = ['Active', 'Active', 'Active', 'Inactive'];

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined in .env');
    }
    await mongoose.connect(process.env.MONGO_URI);
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
    const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'password', 10);
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@admin.com';
    
    const admin = new Admin({
        name: "Owner",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        gymName: "FitZone Pro",
        gymCode: "FIT001"
    });
    await admin.save();
    console.log(`✅ Admin created: ${admin.email}`);

    const members = [];
    const payments = [];
    const attendanceRecords = [];

    // 2. Create 100 Members
    console.log("🌱 Generating 500 members...");

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 4); // Start from 4 months ago

    // Create array with exactly 75 Active and 25 Inactive, then shuffle
    const memberStatuses = [
        ...Array(375).fill('Active'),
        ...Array(125).fill('Inactive')
    ].sort(() => Math.random() - 0.5); // Shuffle randomly

    for (let i = 1; i <= 500; i++) {
        const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
        const gender = GENDERS[Math.floor(Math.random() * GENDERS.length)];
        
        // Get status from shuffled array
        const status = memberStatuses[i - 1];
        
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

        // Keep the status as assigned (Active for first 75, Inactive for rest)
        // No need to check expiry date since we want exactly 75 active

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

        // 4. Generate Attendance with tiered patterns
        // If active, generate random attendance from join date to today
        if (member.status === 'Active' || member.status === 'Expired') {
            const daysToGenerate = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
            
            // Determine attendance tier based on member index
            // First 30 active members: High attendance (5+ days/week = ~71%)
            // Next 25 active members: Medium attendance (3-4 days/week = ~50%)
            // Remaining active members: Low attendance (1-3 days/week = ~29%)
            let attendanceRate;
            const activeMemberIndex = members.filter(m => m.status === 'Active').length;
            
            if (activeMemberIndex <= 30) {
                attendanceRate = 0.71; // ~5 days per week
            } else if (activeMemberIndex <= 55) {
                attendanceRate = 0.50; // ~3.5 days per week
            } else {
                attendanceRate = 0.29; // ~2 days per week
            }
            
            for (let d = 0; d <= daysToGenerate; d++) {
                const currentDate = new Date(joinDate);
                currentDate.setDate(currentDate.getDate() + d);

                // Skip future days
                if (currentDate > new Date()) break;

                // Apply tiered attendance rate
                if (Math.random() < attendanceRate) {
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
