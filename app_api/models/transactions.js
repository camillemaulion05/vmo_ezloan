const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String, // Date.now();
    amount: String,
    type: String,
    // Loan Repayments, Loan Release 
    // Withdrawals
    // Contributions
    // Membership Fee
    message: String,
    senderNum: String,
    receiverNum: String,
    referenceNo: String,
    proof: {
        filename: String,
        contentType: String,
        file: Buffer
    },
    postedDate: Date,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
    status: {
        type: String,
        default: "Processing" //Posted
    },
    transferredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' //Contributions, Membership Fee
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan' //Loan Repayments, Loan Release
    },
    withdrawalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal' //Withdrawals
    }
}, {
    timestamps: true
});

mongoose.model('Transaction', transactionSchema);