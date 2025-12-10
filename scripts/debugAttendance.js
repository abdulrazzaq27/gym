const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
const Admin = require('./models/Admin');
const Member = require('./models/Member');
require('dotenv').config({ path: './server/.env' });

async function debugAttendance() {
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
    console.log(`✅ Found Admin: ${admin.name} (${admin._id})`);

    // Simulate request parameters
    const month = "2025-12";
    const [year, m] = month.split("-");
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59);

    console.log(`Querying from ${start.toISOString()} to ${end.toISOString()}`);

    // Fetch records
    const records = await Attendance.find({
      adminId: admin._id,
      date: { $gte: start, $lte: end }
    }).populate("memberId", "name");

    console.log(`Found ${records.length} records`);

    // Group by member
    const overview = {};
    records.forEach(r => {
      if (!r.memberId) {
          console.log(`⚠️ Orphaned record found: ${r._id}`);
          return; 
      }

      const day = new Date(r.date).getDate();
      const id = r.memberId._id.toString();
      if (!overview[id]) {
        overview[id] = {
          memberId: id,
          adminId: admin._id,
          name: r.memberId.name,
          days: {}
        };
      }
      overview[id].days[day] = 1; // present
    });

    console.log('✅ Processing completed successfully');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error in logic:', err);
    process.exit(1);
  }
}

debugAttendance();
