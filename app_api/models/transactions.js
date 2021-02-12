const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String, // Date.now();
    amount: String,
    type: String, //Loan Repayment, Withdrawals, Contributions, Loan Release, Membership Fee
    message: String,
    senderNum: String,
    receiverNum: String,
    referenceNo: String,
    postedDate: Date,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
    status: {
        type: String,
        default: "Pending" //Pending, Posted
    },
    transferredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' //Contributions
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan' //Loan Release, Repayments
    },
    withdrawalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal' //Cash Release
    }
}, {
    timestamps: true
});

mongoose.model('Transaction', transactionSchema);