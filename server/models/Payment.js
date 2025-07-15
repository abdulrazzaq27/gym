const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
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