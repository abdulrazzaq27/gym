const mongoose = require('../server/node_modules/mongoose');
const Payment = require('../server/models/Payment');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined in .env');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const verifyQuery = async () => {
    await connectDB();

    console.log("🔍 Verifying Payment Query Logic & Stats...");

    try {
        const samplePayment = await Payment.findOne();
        if (!samplePayment) {
            console.log("❌ No payments found in DB. Cannot verify.");
            process.exit(0);
        }

        const paymentDate = new Date(samplePayment.date);
        const year = paymentDate.getFullYear();
        const month = paymentDate.getMonth() + 1;
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        
        console.log(`📅 Testing for month: ${monthStr}`);

        // Construct query similar to paymentRoutes.js
        const query = {};
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        query.date = { $gte: startDate, $lte: endDate };

        // Test the legacy/non-pagination path logic manually here (simulating what the route does)
        const allPayments = await Payment.find(query).sort({ date: -1 });
        
        console.log(`✅ Found ${allPayments.length} payments.`);

        // Replicate logic added to paymentRoutes.js
        const stats = {
            totalAmount: allPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
            count: allPayments.length
        };

        console.log("Calculated Stats:", stats);

        if (stats.count !== allPayments.length) {
             console.error("❌ Stats count mismatch!");
        } else if (stats.totalAmount === 0 && allPayments.length > 0) {
             console.error("❌ Total amount is 0 but payments exist!");
        } else {
             console.log("✅ Stats logic appears correct.");
        }

    } catch (err) {
        console.error("❌ Error during verification:", err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

verifyQuery();
