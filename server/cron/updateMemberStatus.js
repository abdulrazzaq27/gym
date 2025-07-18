const cron = require('node-cron');
const Member = require('../models/Member');

cron.schedule('0 0 * * *', async () => {
    const today = new Date();
    console.log("Member Status Update Running...")
    
    try {
        await Member.updateMany({expiryDate : {$lt: today}, status: 'Active'}, {status: 'Inactive'});
        await Member.updateMany({expiryDate : {$gte: today}, status: 'Inactive'}, {status: 'Active'});
        console.log("Member Status Updated Successfully!")
    }
    catch (err) {
        console.log("Error updating members status: ", err);
    }
})