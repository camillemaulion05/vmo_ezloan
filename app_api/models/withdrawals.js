const mongoose = require('mongoose');

const withdrawalSchema = mongoose.Schema({
    withdrawalNum: String, // Date.now();
    isDeleted: {
        type: Boolean,
        default: false
    },
    amount: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: [
            "Living Cost",
            "Educational",
            "Medical/Hospitalization",
            "Purchasing Appliance",
            "Travel/Vacation",
            "Entertainment",
            "Own Business",
            "Wedding",
            "House Repair",
            "Repayments",
            "Others"
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