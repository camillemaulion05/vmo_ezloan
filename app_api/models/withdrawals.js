const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    withdrawalNum: String, // Date.now();
    amount: String,
    reason: String,
    //Appliance
    //Auto Loan
    //Car Repair
    //Educational
    //Gadget Loan
    //Hospitalization-Wellness
    //Housing
    //House Repair
    //Multi Purpose
    //Petty Cash
    //Productive
    //Providential
    //Special Emergency
    //Travel
    //Wedding
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower'
    },
    status: {
        type: String,
        default: "Processing" // Cash Release, Declined, Approved
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