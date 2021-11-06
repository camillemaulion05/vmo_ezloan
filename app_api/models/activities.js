const mongoose = require('mongoose');

const activityLogSchema = mongoose.Schema({
    activityNum: String, // Date.now();
    isDeleted: {
        type: Boolean,
        default: false
    },
    description: String,
    tableAffected: {
        type: String,
        enum: ["Activity", "Admin", "Borrower", "Employee", "Inquiry", "Loan", "Transaction", "User", "Withdrawal"]
    },
    recordIdAffected: String,
    createdByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    lastUpdatedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

mongoose.model('ActivityLog', activityLogSchema);