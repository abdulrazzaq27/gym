const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Member = require('./models/Member');
const Admin = require('./models/Admin');
const Payment = require('./models/Payment');
const Attendance = require('./models/Attendance');
require('dotenv').config({ path: './server/.env' });

async function seedMembers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Find the admin
    const adminEmail = 'owner@owner.com';
    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      console.error(`❌ Admin with email ${adminEmail} not found.`);
      process.exit(1);
    }

    console.log(`✅ Found Admin: ${admin.name} (${admin._id})`);

    // Clear existing data for this admin to ensure consistency
    await Member.deleteMany({ adminId: admin._id });
    await Payment.deleteMany({ adminId: admin._id });
    await Attendance.deleteMany({ adminId: admin._id });
    console.log(`🧹 Cleared existing members, payments, and attendance for ${adminEmail}`);

    const members = [];
    const payments = [];
    const numberOfMembers = 50;

    const planOptions = [
        { name: 'Monthly', price: 1000, months: 1 },
        { name: 'Quarterly', price: 2500, months: 3 },
        { name: 'Half-Yearly', price: 5000, months: 6 },
        { name: 'Yearly', price: 9000, months: 12 }
    ];

    for (let i = 0; i < numberOfMembers; i++) {
      const joinDate = faker.date.recent({ days: 90 }); // Last 3 months
      
      // Select a random plan
      const selectedPlan = faker.helpers.arrayElement(planOptions);
      
      // Calculate dates based on plan
      const renewalDate = new Date(joinDate);
      renewalDate.setMonth(renewalDate.getMonth() + selectedPlan.months);
      
      const expiryDate = new Date(renewalDate); 

      const status = faker.helpers.arrayElement(['Active', 'Inactive']);

      const memberId = new mongoose.Types.ObjectId();

      members.push({
        _id: memberId,
        adminId: admin._id,
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        dob: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
        joinDate: joinDate,
        renewalDate: renewalDate,
        expiryDate: expiryDate,
        status: status,
        notes: faker.lorem.sentence(),
      });

      // Create associated payment
      payments.push({
          adminId: admin._id,
          memberId: memberId,
          plan: selectedPlan.name,
          amount: selectedPlan.price,
          date: joinDate, // Payment date same as join date
          method: faker.helpers.arrayElement(['UPI', 'Cash', 'Card']),
      });
    }

    // Insert into database
    await Member.insertMany(members);
    await Payment.insertMany(payments);
    
    console.log(`✅ Successfully added ${numberOfMembers} fake members and payments for ${adminEmail}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding members:', err);
    process.exit(1);
  }
}

seedMembers();
