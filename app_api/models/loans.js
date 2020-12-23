const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanNum: String,
    loanType: String,
    //Appliance (Max 2yrs)
    //Auto Loan
    //Car Repair (Max 2yrs)
    //Educational (Max 2yrs)
    //Gadget Loan (Max 2yrs)
    //Hospitalization-Wellness (Max 2yrs)
    //Housing
    //House Repair (Max 2yrs)
    //Multi Purpose
    //Petty Cash (Max 1yr)
    //Productive
    //Providential (Max 2yrs)
    //Special Emergency (Max 2yrs)
    //Travel (Max 2yrs)
    //Wedding (Max 2yrs)
    loanTerm: String,
    loanAmount: String,
    monthlyInterestRate: String,
    serviceFee: String, // 1% of requested amount
    newProceedsAmount: String, // = amount - serviceFee
    monthlyAmortization: String, // loanAmount * (monthlyInterestRate/(1-Math.pow(1+monthlyInterestRate, -loanTerm)));
    totalAmortization: String, // monthlyAmortization  * 12
    totalInterestAccrued: String, // totalAmortization - loanAmount
    paymentStartDate: Date, // Date approved
    paymentEndDate: Date, // Date approved + Loan terms
    totalPayments: String,
    totalInterestPaid: String,
    unpaidInterest: String,
    totalPrincipalPaid: String,
    principalRemaining: String,
    loanPaymentSchedule: [{
        scheduleNum: String, //auto
        dueDate: Date, //if approved
        paymentDate: String, //input
        paymentAmount: String, //input
        interestAccrued: String, //auto
        interestPaid: String, //recompute
        interestBalance: String, //recompute
        monthlyPrincipal: String, //auto
        principalPaid: String, //recompute
        endingBalance: String, //auto
        principalBalance: String //recompute
    }],
    status: {
        type: String,
        default: "Pending"
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    approvedDate: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction' // Transaction of Cash Release
    },
    borrowersId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' // Borrower
    },
});

loanSchema.methods.compute = function (balance, monthlyRate, terms) {
    balance = parseFloat(balance);
    monthlyRate = parseFloat(monthlyRate / 100.0);

    //Calculate the payment
    var payment = balance * (monthlyRate / (1 - Math.pow(
        1 + monthlyRate, -terms)));

    this.loanTerm = terms;
    this.loanAmount = balance.toFixed(2);
    this.monthlyInterestRate = (monthlyRate * 100).toFixed(2);
    this.serviceFee = (balance * 0.01).toFixed(2);
    this.newProceedsAmount = (balance - this.serviceFee).toFixed(2);
    this.monthlyAmortization = payment.toFixed(2);
    this.totalAmortization = (payment * terms).toFixed(2);
    this.totalInterestAccrued = (this.totalAmortization - this.loanAmount).toFixed(2);
    this.loanPaymentSchedule = [];
    for (var count = 0; count < terms; ++count) {
        var data = {};
        var interest = 0;
        var monthlyPrincipal = 0;
        data.scheduleNum = (count + 1);
        interest = balance * monthlyRate;
        data.interestAccrued = interest.toFixed(2);
        monthlyPrincipal = payment - interest;
        data.monthlyPrincipal = monthlyPrincipal.toFixed(2);
        balance = balance - monthlyPrincipal;
        data.endingBalance = balance.toFixed(2);
        this.loanPaymentSchedule.push(data);
    }

};

mongoose.model('Loan', loanSchema);