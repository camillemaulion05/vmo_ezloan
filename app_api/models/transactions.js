const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionNum: String,
    transactionDate: {
        type: Date,
        default: Date.now
    },
    amount: String,
    type: String, //Loan Repayment, Cash Release, Contributions, Loan Release, Membership Fee
    message: String,
    senderNum: String,
    receiverNum: String,
    referenceNo: String,
    postedDate: Date,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
});

mongoose.model('Transaction', transactionSchema);