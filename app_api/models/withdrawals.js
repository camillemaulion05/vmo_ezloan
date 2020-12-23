const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalNum: String,
    amount: String,
    reason: String,
    serviceFee: String, // 1% of requested amount
    newProceedsAmount: String, // = amount - serviceFee
    requestBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower'
    },
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

withdrawalSchema.methods.compute = function (amount) {
    this.serviceFee = (amount * 0.01).toFixed(2);
    this.newProceedsAmount = (amount - this.serviceFee).toFixed(2);
};

mongoose.model('Withdrawal', withdrawalSchema);