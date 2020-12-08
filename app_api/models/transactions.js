const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String,
    transactiondate: {
        type: Date,
        default: Date.now
    },
    amount: String,
    type: String, //Repayments of Loan, Cash Release, Contributions, Withdrawals, Membership Fee
    message: String,
    senderString: String,
    receiverString: String,
    referenceNo: String,
    postDate: Date,
    postBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
});

mongoose.model('Transaction', transactionSchema);