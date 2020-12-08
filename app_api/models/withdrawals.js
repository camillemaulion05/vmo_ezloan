const mongoose = require('mongoose');

const withdrawalsSchema = new mongoose.Schema({
    withdrawalNum: String,
    amount: {
        type: String,
        default: 0
    },
    reason: String,
    serviceFee: String, // 1% of requested amount
    newProceedsAmount: String, // = amount - serviceFee
    requestDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending"
    },
    approvedDate: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction' // Transaction of Cash Release
    }
});

withdrawalsSchema.methods.compute = function (amount) {
    this.serviceFee = (Number(amount * 0.01)).toFixed(2);
    this.newProceedsAmount = (Number(amount - (amount * 0.01))).toFixed(2);
};

mongoose.model('Withdrawal', withdrawalsSchema);