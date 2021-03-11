const mongoose = require('mongoose');

const withdrawalSchema = mongoose.Schema({
    withdrawalNum: String, // Date.now();
    amount: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: [
            "Emergency Claim",
            "Death Claim",
            "Disability Claim",
            "Funeral Claim",
            "Maternity Claim",
            "Retirement Claim",
            "Sickness Claim"
        ]
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower'
    },
    status: {
        type: String,
        default: "Processing",
        enum: ["Processing", "Approved", "Declined", "Cash Release"]
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date
}, {
    timestamps: true
});

mongoose.model('Withdrawal', withdrawalSchema);