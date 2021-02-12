const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanNum: String, // Date.now();
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
    paymentStartDate: Date, // Date approved
    paymentEndDate: Date, // Date approved + Loan terms
    totalPayments: {
        type: String,
        default: "0.00"
    }, // recompute
    totalInterestAccrued: {
        type: String,
        default: "0.00"
    }, // recompute
    totalInterestPaid: {
        type: String,
        default: "0.00"
    }, // recompute
    unpaidInterest: {
        type: String,
        default: "0.00"
    }, // recompute
    totalPrincipalPaid: {
        type: String,
        default: "0.00"
    }, // recompute
    principalRemaining: {
        type: String,
        default: "0.00"
    }, // recompute
    loanPaymentSchedule: [{
        scheduleNum: String, //auto
        dueDate: Date, //if approved
        paymentDate: Date, //input
        paymentAmount: {
            type: String,
            default: "0.00"
        }, //input
        amountDue: String, //auto
        interest: String, //auto
        interestAccrued: {
            type: String,
            default: "0.00"
        }, //recompute
        interestPaid: {
            type: String,
            default: "0.00"
        }, //recompute
        interestBalance: {
            type: String,
            default: "0.00"
        }, //recompute
        principal: String, //auto
        principalPaid: {
            type: String,
            default: "0.00"
        }, //recompute
        principalBalance: {
            type: String,
            default: "0.00"
        } //recompute
    }],
    status: {
        type: String,
        default: "Pending" // Loan Release, Fully Paid
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee' // Loan Officer
    },
    reviewedDate: Date,
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrower' // Borrower
    }
}, {
    timestamps: true
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
    this.serviceFee = (balance * 0.01).toFixed(2); //1% service fee
    this.newProceedsAmount = (balance - this.serviceFee).toFixed(2);
    this.monthlyAmortization = payment.toFixed(2);
    this.totalAmortization = (parseFloat(payment) * terms).toFixed(2);
    this.totalInterest = (this.totalAmortization - this.loanAmount).toFixed(2);
    this.loanPaymentSchedule = [];
    for (var count = 0; count < terms; ++count) {
        var data = {};
        var interest = 0;
        var principal = 0;
        data.scheduleNum = (count + 1);
        interest = balance * monthlyRate;
        data.interest = interest.toFixed(2);
        principal = parseFloat(payment) - interest;
        data.principal = principal.toFixed(2);
        balance = balance - principal;
        data.principalBalance = balance.toFixed(2);
        data.amountDue = this.monthlyAmortization;
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

loanSchema.methods.addRepayment = function (date, amount) {
    const paymentDate = new Date(date);
    const add1Month = new Date(date);
    add1Month.setFullYear(add1Month.getFullYear(), add1Month.getMonth() + 1, add1Month.getDate());
    const newArray = this.loanPaymentSchedule.filter(function (schedule) {
        return paymentDate <= new Date(schedule.dueDate) && add1Month > new Date(schedule.dueDate);
    });
    if (newArray.length >= 1) {
        const monthlyRate = parseFloat(this.monthlyInterestRate / 100);
        const repaymentSchedule = newArray[0];
        const scheduleNum = repaymentSchedule.scheduleNum;
        const i = parseInt(scheduleNum) - 1;
        this.loanPaymentSchedule[i].paymentAmount = parseFloat(this.loanPaymentSchedule[i].paymentAmount) + parseFloat(amount);
        this.loanPaymentSchedule[i].paymentDate = paymentDate;
        if (scheduleNum == '1') {
            this.loanPaymentSchedule[i].interestAccrued = (monthlyRate * this.loanAmount).toFixed(2);
            this.loanPaymentSchedule[i].interestPaid = (Math.min(this.loanPaymentSchedule[i].interestAccrued, this.loanPaymentSchedule[i].paymentAmount)).toFixed(2);
        } else {
            this.loanPaymentSchedule[i].interestAccrued = (monthlyRate * this.loanPaymentSchedule[i - 1].principalBalance).toFixed(2);
            this.loanPaymentSchedule[i].interestPaid = (Math.min(parseFloat(this.loanPaymentSchedule[i].interestAccrued) + parseFloat(this.loanPaymentSchedule[i - 1].interestBalance), this.loanPaymentSchedule[i].paymentAmount)).toFixed(2);
        }
        this.loanPaymentSchedule[i].interestBalance = (this.loanPaymentSchedule[i].interestAccrued - this.loanPaymentSchedule[i].interestPaid).toFixed(2);
        this.loanPaymentSchedule[i].principalPaid = (this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid).toFixed(2);
        if (scheduleNum == '1') {
            this.loanPaymentSchedule[i].principalBalance = (this.loanAmount - this.loanPaymentSchedule[i].principalPaid).toFixed(2);
        } else {
            this.loanPaymentSchedule[i].principalBalance = (this.loanPaymentSchedule[i - 1].principalBalance - this.loanPaymentSchedule[i].principalPaid).toFixed(2);
        }
        var sum = function (items, prop) {
            return items.reduce(function (a, b) {
                return parseFloat(a) + parseFloat(b[prop]);
            }, 0);
        };
        this.totalPayments = (sum(this.loanPaymentSchedule, 'paymentAmount')).toFixed(2);
        this.totalInterestAccrued = (sum(this.loanPaymentSchedule, 'interestAccrued')).toFixed(2);
        this.totalInterestPaid = (sum(this.loanPaymentSchedule, 'interestPaid')).toFixed(2);
        this.unpaidInterest = (parseFloat(this.totalInterestAccrued) - parseFloat(this.totalInterestPaid)).toFixed(2);
        this.totalPrincipalPaid = (sum(this.loanPaymentSchedule, 'principalPaid')).toFixed(2);
        this.principalRemaining = (this.loanAmount - this.totalPrincipalPaid).toFixed(2);

        //update subsequent schedule
        for (var c = (i + 1); c < this.loanTerm; c++) {
            if (this.loanPaymentSchedule[c].scheduleNum == this.loanTerm ||
                this.monthlyAmortization > ((1 + monthlyRate) * this.loanPaymentSchedule[c - 1].principalBalance)) {
                this.loanPaymentSchedule[c].amountDue = ((1 + monthlyRate) * this.loanPaymentSchedule[c - 1].principalBalance).toFixed(2);
            } else {
                this.loanPaymentSchedule[c].amountDue = this.monthlyAmortization;
            }
            if (this.loanPaymentSchedule[c].scheduleNum == '1') {
                this.loanPaymentSchedule[c].interest = ((this.monthlyInterestRate / 100) * this.loanAmount).toFixed(2);
                this.loanPaymentSchedule[c].principal = (this.loanPaymentSchedule[c].amountDue - this.loanPaymentSchedule[c].interest).toFixed(2);
                this.loanPaymentSchedule[c].principalBalance = (this.loanAmount - this.loanPaymentSchedule[c].principal).toFixed(2);
            } else {
                this.loanPaymentSchedule[c].interest = (parseFloat(this.loanPaymentSchedule[c - 1].interestBalance) + (this.monthlyInterestRate / 100) * this.loanPaymentSchedule[c - 1].principalBalance).toFixed(2);
                this.loanPaymentSchedule[c].principal = (this.loanPaymentSchedule[c].amountDue - this.loanPaymentSchedule[c].interest).toFixed(2);
                this.loanPaymentSchedule[c].principalBalance = (this.loanPaymentSchedule[c - 1].principalBalance - this.loanPaymentSchedule[c].principal).toFixed(2);
            }
        }

        //update status
        if (this.totalPayments == this.totalAmortization || parseFloat(this.principalRemaining) == 0.00) {
            this.status = "Fully Paid";
        }
    }
};

mongoose.model('Loan', loanSchema);