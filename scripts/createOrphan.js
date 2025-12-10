const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Admin = require('./models/Admin');
require('dotenv').config({ path: './server/.env' });

async function createOrphan() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    const adminEmail = 'owner@owner.com';
    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      console.error(`❌ Admin with email ${adminEmail} not found.`);
      process.exit(1);
    }

    // Create an attendance record with a random (non-existent) member ID
    const orphan = new Attendance({
      adminId: admin._id,
      memberId: new mongoose.Types.ObjectId(), // Random ID
      date: new Date(),
      checkInTime: '10:00 AM'
    });

    await orphan.save();
    console.log(`✅ Created orphaned attendance record: ${orphan._id}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

createOrphan();
