const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('./models/Member');
const Attendance = require('./models/Attendance');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gym');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAttendance = async () => {
    try {
        await connectDB();
        
        const members = await Member.find();
        console.log(`Found ${members.length} members.`);

        if (members.length === 0) {
            console.log('No members found. Run seedMembers.js first.');
            process.exit();
        }

        console.log('Clearing existing attendance...');
        await Attendance.deleteMany({});

        const attendanceRecords = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 60); // Last 60 days

        for (const member of members) {
            if (!member.adminId) {
                console.warn(`Skipping member ${member.name} (ID: ${member._id}) - Missing adminId`);
                continue;
            }

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                if (Math.random() > 0.3) {
                    const hour = Math.floor(Math.random() * (20 - 6 + 1)) + 6;
                    const minute = Math.floor(Math.random() * 60);
                    const checkInTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    
                    const record = {
                        adminId: member.adminId,
                        memberId: member._id,
                        date: new Date(d),
                        checkInTime: checkInTime
                    };
                    attendanceRecords.push(record);
                }
            }
        }

        console.log(`Inserting ${attendanceRecords.length} attendance records...`);
        // Use chunks to avoid too large payload if many records
        const chunkSize = 500;
        for (let i = 0; i < attendanceRecords.length; i += chunkSize) {
            const chunk = attendanceRecords.slice(i, i + chunkSize);
            try {
                await Attendance.insertMany(chunk);
                process.stdout.write('.');
            } catch (e) {
                console.error("\nError inserting chunk:", e.message);
                if (chunk.length > 0) console.error("Sample record:", chunk[0]);
            }
        }

        console.log('\nAttendance seeded successfully!');
        process.exit();

    } catch (err) {
        console.error('\nFatal Error seeding attendance:', err);
        process.exit(1);
    }
};

seedAttendance();
