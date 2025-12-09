const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Member = require('./models/Member');
require('dotenv').config({ path: './server/.env' });

async function checkOrphanedAttendance() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    const records = await Attendance.find().populate('memberId');
    let orphanedCount = 0;

    records.forEach(r => {
      if (!r.memberId) {
        orphanedCount++;
        console.log(`❌ Orphaned record found: ID ${r._id}, Date: ${r.date}`);
      }
    });

    console.log(`Total orphaned records: ${orphanedCount}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkOrphanedAttendance();
