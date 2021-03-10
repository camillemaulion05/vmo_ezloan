import {
    Schema,
    model
} from 'mongoose';

const transactionSchema = new Schema({
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
        type: Schema.Types.ObjectId,
        ref: 'Employee' //Loan Processor
    },
    status: {
        type: String,
        default: "Processing",
        enum: ["Processing, Posted"]
    },
    borrowerId: {
        type: Schema.Types.ObjectId,
        ref: 'Borrower' //Contributions, Fees
    },
    loanId: {
        type: Schema.Types.ObjectId,
        ref: 'Loan' //Repayments, Release
    },
    withdrawalId: {
        type: Schema.Types.ObjectId,
        ref: 'Withdrawal' //Withdrawals
    }
}, {
    timestamps: true
});

model('Transaction', transactionSchema);