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
    totalInterest: String, // totalAmortization - loanAmount
    totalInterestAccrued: String, // recompute
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
        paymentDate: Date, //input
        paymentAmount: String, //input
        interest: String, //auto
        interestAccrued: String, //recompute
        interestPaid: String, //recompute
        interestBalance: String, //recompute
        monthlyPrincipal: String, //auto
        principalPaid: String, //recompute
        endingBalance: String, //auto
        principalBalance: String, //recompute
        repayments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction' // Transaction of Repayments
        }]
    }],
    status: {
        type: String,
        default: "Pending"
    },
    requestedBy: {
        type: Date,
        default: Date.now
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date,
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction' // Transaction of Cash Release
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' // Borrower
    }
});

loanSchema.methods.compute = function (balance, monthlyRate, terms) {
    balance = parseFloat(balance);
    monthlyRate = parseFloat(monthlyRate / 100.0);

    //Calculate the payment
    const payment = balance * (monthlyRate / (1 - Math.pow(
        1 + monthlyRate, -terms)));

    this.loanTerm = terms;
    this.loanAmount = balance.toFixed(2);
    this.monthlyInterestRate = (monthlyRate * 100).toFixed(2);
    this.serviceFee = (balance * 0.01).toFixed(2);
    this.newProceedsAmount = (balance - this.serviceFee).toFixed(2);
    this.monthlyAmortization = payment.toFixed(2);
    this.totalAmortization = (payment * terms).toFixed(2);
    this.totalInterest = (this.totalAmortization - this.loanAmount).toFixed(2);
    this.loanPaymentSchedule = [];
    for (var count = 0; count < terms; ++count) {
        var data = {};
        var interest = 0;
        var monthlyPrincipal = 0;
        data.scheduleNum = (count + 1);
        interest = balance * monthlyRate;
        data.interest = interest.toFixed(2);
        monthlyPrincipal = payment - interest;
        data.monthlyPrincipal = monthlyPrincipal.toFixed(2);
        balance = balance - monthlyPrincipal;
        data.endingBalance = balance.toFixed(2);
        this.loanPaymentSchedule.push(data);
    }

};

loanSchema.methods.updateDates = function () {
    this.paymentStartDate = Date.now();
    const terms = this.loanPaymentSchedule.length;
    for (let i = 0; i < terms; i++) {
        let d = new Date(this.paymentStartDate);
        d.setFullYear(d.getFullYear(), d.getMonth() + 1 + i, d.getDate());
        this.loanPaymentSchedule[i].dueDate = d;
    }
    this.paymentEndDate = this.loanPaymentSchedule[terms - 1].dueDate;
};

loanSchema.methods.addRepayment = function (date, amount, txnId) {
    const paymentDate = new Date(date);
    const add1Month = new Date(date);
    add1Month.setFullYear(add1Month.getFullYear(), add1Month.getMonth() + 1, add1Month.getDate());
    const newArray = this.loanPaymentSchedule.filter(function (schedule) {
        return paymentDate <= new Date(schedule.dueDate) && add1Month > new Date(schedule.dueDate);
    });
    if (newArray.length >= 1) {
        const repaymentSchedule = newArray[0];
        const i = parseInt(repaymentSchedule.scheduleNum) - 1;
        const ii = parseInt(repaymentSchedule.scheduleNum) - 2;
        this.loanPaymentSchedule[i].paymentAmount = amount;
        this.loanPaymentSchedule[i].paymentDate = paymentDate;
        if (repaymentSchedule.scheduleNum == '1') {
            this.loanPaymentSchedule[i].interestAccrued = ((this.monthlyInterestRate / 100) * this.loanAmount).toFixed(2);
            this.loanPaymentSchedule[i].interestPaid = (Math.min(this.loanPaymentSchedule[i].interestAccrued, this.loanPaymentSchedule[i].paymentAmount)).toFixed(2);
        } else {
            this.loanPaymentSchedule[i].interestAccrued = ((this.monthlyInterestRate / 100) * this.loanPaymentSchedule[ii].principalBalance).toFixed(2);
            this.loanPaymentSchedule[i].interestPaid = (Math.min(this.loanPaymentSchedule[i].interestAccrued + this.loanPaymentSchedule[ii].interestBalance, this.loanPaymentSchedule[i].paymentAmount)).toFixed(2);
        }
        this.loanPaymentSchedule[i].interestBalance = this.loanPaymentSchedule[i].interestAccrued - this.loanPaymentSchedule[i].interestPaid;
        this.loanPaymentSchedule[i].principalPaid = this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid;
        if (repaymentSchedule.scheduleNum == '1') {
            this.loanPaymentSchedule[i].principalBalance = this.loanAmount - this.loanPaymentSchedule[i].principalPaid;
        } else {
            this.loanPaymentSchedule[i].principalBalance = this.loanPaymentSchedule[ii].principalBalance - this.loanPaymentSchedule[i].principalPaid;
        }
        this.loanPaymentSchedule[i].repayments.push(txnId);
    }
};

mongoose.model('Loan', loanSchema);