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
    function ROUND(num) {
        let newNum = +(Math.round(parseFloat(num) + "e+2") + "e-2");
        return (Number.isNaN(newNum)) ? (num.toFixed(2) == 0) ? 0.00 : num.toFixed(2) : newNum;
    }
    balance = parseFloat(balance);
    monthlyRate = monthlyRate / 100.0;

    let payment = ROUND(balance * (monthlyRate / (1 - Math.pow(
        1 + monthlyRate, -terms))));

    this.loanTerm = terms;
    this.loanAmount = ROUND(balance);
    this.principalRemaining = this.loanAmount;
    this.monthlyInterestRate = ROUND(monthlyRate * 100);
    this.serviceFee = ROUND(balance * 0.01); //1% service fee
    this.newProceedsAmount = ROUND(balance - this.serviceFee);
    this.monthlyAmortization = payment;
    this.totalAmortization = 0;
    this.totalInterest = 0;
    this.loanPaymentSchedule = [];
    for (let count = 0; count < terms; ++count) {
        let data = {};
        data.scheduleNum = count + 1;
        if (count < 1) {
            data.amountDue = (data.scheduleNum == terms || payment > ROUND((1 + monthlyRate) * this.loanAmount)) ? ROUND((1 + monthlyRate) * this.loanAmount) : payment;
        } else {
            data.amountDue = (data.scheduleNum == terms || payment > ROUND((1 + monthlyRate) * this.loanPaymentSchedule[count - 1].principalBalance)) ? ROUND((1 + monthlyRate) * this.loanPaymentSchedule[count - 1].principalBalance) : payment;
        }
        this.totalAmortization = ROUND(parseFloat(this.totalAmortization) + data.amountDue);
        data.interest = ROUND(balance * monthlyRate);
        this.totalInterest = ROUND(parseFloat(this.totalInterest) + data.interest);
        data.principal = ROUND(data.amountDue - data.interest);
        balance = balance - data.principal;
        data.principalBalance = ROUND(balance);
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
    function ROUND(num) {
        let newNum = +(Math.round(parseFloat(num) + "e+2") + "e-2");
        return (Number.isNaN(newNum)) ? (num.toFixed(2) == 0) ? 0.00 : num.toFixed(2) : newNum;
    }
    amount = parseFloat(amount);
    const paymentDate = new Date(date);
    const add1Month = new Date(date);
    add1Month.setFullYear(add1Month.getFullYear(), add1Month.getMonth() + 1, add1Month.getDate());
    const schedules = this.loanPaymentSchedule.filter(function (schedule) {
        return paymentDate <= new Date(schedule.dueDate) && add1Month > new Date(schedule.dueDate);
    });
    if (schedules.length >= 1) {
        const monthlyRate = parseFloat(this.monthlyInterestRate / 100);
        const repaymentSchedule = schedules[0];
        const scheduleNum = repaymentSchedule.scheduleNum;

        this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentAmount = ROUND(parseFloat(this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentAmount) + amount);
        this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentDate = paymentDate;

        for (let i = (parseInt(scheduleNum) - 1); i < this.loanTerm; i++) {
            if (this.loanPaymentSchedule[i].scheduleNum == '1') {
                this.loanPaymentSchedule[i].amountDue = (this.loanPaymentSchedule[i].scheduleNum == this.loanTerm || this.monthlyAmortization > ROUND((1 + monthlyRate) * parseFloat(this.loanAmount))) ? ROUND((1 + monthlyRate) * parseFloat(this.loanAmount)) : this.monthlyAmortization;
                this.loanPaymentSchedule[i].interest = ROUND(parseFloat(this.loanAmount) * monthlyRate);
                this.loanPaymentSchedule[i].interestPaid = Math.min(this.loanPaymentSchedule[i].interest, this.loanPaymentSchedule[i].paymentAmount);
                if (this.loanPaymentSchedule[i].paymentAmount > 0) this.loanPaymentSchedule[i].interestBalance = ROUND(this.loanPaymentSchedule[i].interest - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principalPaid = ROUND(this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principal = ROUND(this.loanPaymentSchedule[i].amountDue - this.loanPaymentSchedule[i].interest);
                this.loanPaymentSchedule[i].principalBalance = (this.loanPaymentSchedule[i].paymentAmount > 0) ? ROUND(this.loanAmount - this.loanPaymentSchedule[i].principalPaid) : ROUND(this.loanAmount - this.loanPaymentSchedule[i].principal);

            } else {
                this.loanPaymentSchedule[i].amountDue = (this.loanPaymentSchedule[i].scheduleNum == this.loanTerm || this.monthlyAmortization > ROUND((1 + monthlyRate) * parseFloat(this.loanPaymentSchedule[i - 1].principalBalance))) ? ROUND((1 + monthlyRate) * parseFloat(this.loanPaymentSchedule[i - 1].principalBalance)) : this.monthlyAmortization;
                this.loanPaymentSchedule[i].interest = ROUND(parseFloat(this.loanPaymentSchedule[i - 1].principalBalance) * monthlyRate);
                this.loanPaymentSchedule[i].interestPaid = Math.min(ROUND(parseFloat(this.loanPaymentSchedule[i].interest) + parseFloat(this.loanPaymentSchedule[i - 1].interestBalance)), this.loanPaymentSchedule[i].paymentAmount);
                if (this.loanPaymentSchedule[i].paymentAmount > 0) this.loanPaymentSchedule[i].interestBalance = ROUND(parseFloat(this.loanPaymentSchedule[i - 1].interestBalance) + parseFloat(this.loanPaymentSchedule[i].interest) - parseFloat(this.loanPaymentSchedule[i].interestPaid));
                this.loanPaymentSchedule[i].principalPaid = ROUND(this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principal = ROUND(this.loanPaymentSchedule[i].amountDue - this.loanPaymentSchedule[i].interest);
                this.loanPaymentSchedule[i].principalBalance = (this.loanPaymentSchedule[i].paymentAmount > 0) ? ROUND(this.loanPaymentSchedule[i - 1].principalBalance - this.loanPaymentSchedule[i].principalPaid) : ROUND(this.loanPaymentSchedule[i - 1].principalBalance - this.loanPaymentSchedule[i].principal);
            }
        }

        var sum = function (items, prop) {
            return items.reduce(function (a, b) {
                if (b['paymentAmount'] > 0) {
                    return ROUND(parseFloat(a) + parseFloat(b[prop]))
                } else {
                    return ROUND(parseFloat(a));
                }
            }, 0);
        };
        this.totalPayments = sum(this.loanPaymentSchedule, 'paymentAmount');
        this.totalInterestAccrued = sum(this.loanPaymentSchedule, 'interest');
        this.totalInterestPaid = sum(this.loanPaymentSchedule, 'interestPaid');
        this.unpaidInterest = ROUND(this.totalInterestAccrued - this.totalInterestPaid);
        this.totalPrincipalPaid = sum(this.loanPaymentSchedule, 'principalPaid');
        this.principalRemaining = ROUND(parseFloat(this.loanAmount) - parseFloat(this.totalPrincipalPaid));

        //update status
        if (this.totalPayments == this.totalAmortization || parseFloat(this.principalRemaining) == 0.00) {
            this.status = "Fully Paid";
        }
    }
};

mongoose.model('Loan', loanSchema);