const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalNum: String, // Date.now();
    amount: String,
    reason: String,
    serviceFee: String, // 1% of requested amount
    newProceedsAmount: String, // = amount - serviceFee
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower'
    },
    status: {
        type: String,
        default: "Pending" // Cash Release, Approved, Revoked
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date
}, {
    timestamps: true
});
//minimum amount 500
withdrawalSchema.methods.compute = function (amount) {
    this.serviceFee = (amount * 0.01).toFixed(2);
    this.newProceedsAmount = (amount - this.serviceFee).toFixed(2);
};

mongoose.model('Withdrawal', withdrawalSchema);