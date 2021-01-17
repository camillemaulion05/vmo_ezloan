const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalNum: String,
    amount: String,
    reason: String,
    serviceFee: String, // 5% of requested amount
    newProceedsAmount: String, // = amount - serviceFee
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower'
    },
    requestedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending" // Cash Release, Approved
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date,
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction' // Transaction of Cash Release
    }
});
//minimum amount 500
withdrawalSchema.methods.compute = function (amount) {
    this.serviceFee = (amount * 0.05).toFixed(2);
    this.newProceedsAmount = (amount - this.serviceFee).toFixed(2);
};

mongoose.model('Withdrawal', withdrawalSchema);