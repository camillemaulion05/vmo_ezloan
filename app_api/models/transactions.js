const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String, // Date.now();
    amount: String,
    type: String,
    // Repayments - credit
    // Release - debit
    // Withdrawals - debit
    // Contributions - credit
    // Fees - credit
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
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' //Contributions, Fees
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan' //Repayments, Release
    },
    withdrawalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal' //Withdrawals
    }
}, {
    timestamps: true
});

mongoose.model('Transaction', transactionSchema);