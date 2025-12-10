const mongoose = require('mongoose');
const Member = require('./models/Member');
const Admin = require('./models/Admin');
const Payment = require('./models/Payment');
require('dotenv').config({ path: './server/.env' });

async function verifyMembers() {
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

    const members = await Member.find({ adminId: admin._id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ adminId: admin._id });
    
    console.log(`✅ Found ${members.length} members for ${adminEmail}`);
    console.log(`✅ Found ${payments.length} payments for ${adminEmail}`);
    
    if (members.length > 0) {
        console.log('--- Sample Member ---');
        console.log(members[0]);
        const memberPayment = payments.find(p => p.memberId.toString() === members[0]._id.toString());
        console.log('--- Associated Payment ---');
        console.log(memberPayment || '❌ No payment found for this member');
        console.log('---------------------');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error verifying members:', err);
    process.exit(1);
  }
}

verifyMembers();
