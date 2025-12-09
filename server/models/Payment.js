const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true,
    },
    plan: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    method: {
        type: String,
        enum: ['UPI', 'Cash', 'Card'],
        required: true,
    }
})

module.exports = mongoose.model('Payment', paymentSchema);