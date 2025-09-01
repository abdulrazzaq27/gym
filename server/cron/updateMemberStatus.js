const cron = require('node-cron');
const Member = require('../models/Member');

cron.schedule('*/5 * * * *', async () => {
    const today = new Date();
    
    try {
        await Member.updateMany({expiryDate : {$lt: today}, status: 'Active'}, {status: 'Inactive'});
        await Member.updateMany({expiryDate : {$gte: today}, status: 'Inactive'}, {status: 'Active'});
        console.log("Member Status Updated Successfully!")
    }
    catch (err) {
        console.log("Error updating members status: ", err);
    }
})

cron.schedule('0 0 * * 0', async () => {
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const expiringMembers = await Member.find( {
        expiryDate : {
            $gte : today,
            $lt : next7Days,
        },
        status: 'Active',
    })
})