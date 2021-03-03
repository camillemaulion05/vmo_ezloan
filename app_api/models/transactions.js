const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String, // Date.now();
    amount: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            "Repayments",
            "Release",
            "Withdrawals",
            "Contributions",
            "Fees",
            "Expenses"
        ]
    },
    message: String,
    senderNum: String,
    receiverNum: String,
    referenceNo: {
        type: String,
        required: true
    },
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
        default: "Processing",
        enum: ["Processing, Posted"]
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