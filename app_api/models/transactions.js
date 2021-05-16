const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    transactionNum: String, // Date.now();
    amount: {
        // Repayments (+)
        // Release (-)
        // Withdrawals (-)
        // Contributions (+)
        // Fees (+) Membership Fee
        // Expenses (-)
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
        originalname: String,
        filename: String,
        contentType: String
    },
    postedDate: Date,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
    status: {
        type: String,
        default: "Processing",
        enum: ["Processing", "Posted"]
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