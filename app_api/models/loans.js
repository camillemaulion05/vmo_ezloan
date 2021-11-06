const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    loanNum: String, // Date.now();
    isDeleted: {
        type: Boolean,
        default: false
    },
    purposeOfLoan: {
        type: String,
        // enum: [
        //     "Living Cost",
        //     "Educational",
        //     "Medical or Hospitalization",
        //     "Purchasing Appliance",
        //     "Travel or Vacation",
        //     "Entertainment",
        //     "Own Business",
        //     "Wedding",
        //     "House Repair",
        //     "Repayments",
        //     "Others"
        // ]
    },
    loanTerm: {
        type: String,
        required: true,
        enum: ["6", "12", "18", "24", "30", "36", "42", "48", "54", "60"]
    },
    loanAmount: {
        type: String,
        required: true
    },
    monthlyInterestRate: {
        type: String,
        required: true
    },
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
        default: "Processing",
        // primary, success, danger, info, info, light, warning
        enum: ["Processing", "Approved", "Declined", "Loan Release", "Open", "Fully Paid", "Loan Debt"]
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
    this.status = "Open";
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
    paymentDate.setHours(0);
    paymentDate.setMinutes(0);
    paymentDate.setSeconds(0);
    const schedules = this.loanPaymentSchedule.filter(function (schedule) {
        return paymentDate <= new Date(schedule.dueDate);
    });
    if (schedules.length >= 1) {
        const monthlyRate = parseFloat(this.monthlyInterestRate / 100);
        const repaymentSchedule = schedules[0];
        const scheduleNum = repaymentSchedule.scheduleNum;
        this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentAmount = ROUND(parseFloat(this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentAmount) + amount);
        this.loanPaymentSchedule[parseInt(scheduleNum) - 1].paymentDate = paymentDate;
        this.loanPaymentSchedule[parseInt(scheduleNum) - 1].interestAccrued = this.loanPaymentSchedule[parseInt(scheduleNum) - 1].interest;

        for (let i = (parseInt(scheduleNum) - 1); i < this.loanPaymentSchedule.length; i++) {
            if (this.loanPaymentSchedule[i].scheduleNum == '1') {
                this.loanPaymentSchedule[i].amountDue = (this.loanPaymentSchedule[i].scheduleNum == this.loanTerm || this.monthlyAmortization > ROUND((1 + monthlyRate) * parseFloat(this.loanAmount))) ? ROUND((1 + monthlyRate) * parseFloat(this.loanAmount)) : this.monthlyAmortization;
                this.loanPaymentSchedule[i].interest = ROUND(parseFloat(this.loanAmount) * monthlyRate);
                this.loanPaymentSchedule[i].interestPaid = Math.min(this.loanPaymentSchedule[i].interest, this.loanPaymentSchedule[i].paymentAmount);
                if (this.loanPaymentSchedule[i].scheduleNum == scheduleNum) this.loanPaymentSchedule[i].interestBalance = ROUND(this.loanPaymentSchedule[i].interest - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principalPaid = ROUND(this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principal = ROUND(this.loanPaymentSchedule[i].amountDue - this.loanPaymentSchedule[i].interest);
                this.loanPaymentSchedule[i].principalBalance = (this.loanPaymentSchedule[i].scheduleNum == scheduleNum) ? ROUND(this.loanAmount - this.loanPaymentSchedule[i].principalPaid) : ROUND(this.loanAmount - this.loanPaymentSchedule[i].principal);
            } else {
                this.loanPaymentSchedule[i].amountDue = (parseInt(this.loanPaymentSchedule[i].scheduleNum) >= parseInt(this.loanTerm) || this.monthlyAmortization > ROUND((1 + monthlyRate) * parseFloat(this.loanPaymentSchedule[i - 1].principalBalance))) ? ROUND((1 + monthlyRate) * parseFloat(this.loanPaymentSchedule[i - 1].principalBalance)) : this.monthlyAmortization;
                this.loanPaymentSchedule[i].interest = ROUND(parseFloat(this.loanPaymentSchedule[i - 1].principalBalance) * monthlyRate);
                this.loanPaymentSchedule[i].interestPaid = Math.min(ROUND(parseFloat(this.loanPaymentSchedule[i].interest) + parseFloat(this.loanPaymentSchedule[i - 1].interestBalance)), this.loanPaymentSchedule[i].paymentAmount);
                if (this.loanPaymentSchedule[i].scheduleNum == scheduleNum) this.loanPaymentSchedule[i].interestBalance = ROUND(parseFloat(this.loanPaymentSchedule[i - 1].interestBalance) + parseFloat(this.loanPaymentSchedule[i].interest) - parseFloat(this.loanPaymentSchedule[i].interestPaid));
                this.loanPaymentSchedule[i].principalPaid = ROUND(this.loanPaymentSchedule[i].paymentAmount - this.loanPaymentSchedule[i].interestPaid);
                this.loanPaymentSchedule[i].principal = ROUND(this.loanPaymentSchedule[i].amountDue - this.loanPaymentSchedule[i].interest);
                this.loanPaymentSchedule[i].principalBalance = (this.loanPaymentSchedule[i].scheduleNum == scheduleNum) ? ROUND(this.loanPaymentSchedule[i - 1].principalBalance - this.loanPaymentSchedule[i].principalPaid) : ROUND(this.loanPaymentSchedule[i - 1].principalBalance - this.loanPaymentSchedule[i].principal);
            }
        }

        var sum = function (items, prop) {
            return items.reduce(function (a, b) {
                return ROUND(parseFloat(a) + parseFloat(b[prop]))
            }, 0);
        };
        this.totalPayments = sum(this.loanPaymentSchedule, 'paymentAmount');
        this.totalInterestAccrued = sum(this.loanPaymentSchedule, 'interestAccrued');
        this.totalInterestPaid = sum(this.loanPaymentSchedule, 'interestPaid');
        this.unpaidInterest = ROUND(this.totalInterestAccrued - this.totalInterestPaid);
        this.totalPrincipalPaid = sum(this.loanPaymentSchedule, 'principalPaid');
        this.principalRemaining = ROUND(parseFloat(this.loanAmount) - parseFloat(this.totalPrincipalPaid));

        //update status
        if (this.totalPayments == this.totalAmortization || parseFloat(this.principalRemaining) <= 0.00) {
            this.status = "Fully Paid";
        }
    }
};

loanSchema.methods.validateRepayments = function () {
    function ROUND(num) {
        let newNum = +(Math.round(parseFloat(num) + "e+2") + "e-2");
        return (Number.isNaN(newNum)) ? (num.toFixed(2) == 0) ? 0.00 : num.toFixed(2) : newNum;
    }
    const dateNow = new Date();
    dateNow.setHours(0);
    dateNow.setMinutes(0);
    dateNow.setSeconds(0);
    const schedules = this.loanPaymentSchedule.filter(function (schedule) {
        return dateNow <= new Date(schedule.dueDate);
    });
    if (schedules.length >= 1) {
        const repaymentSchedule = schedules[0];
        for (let i = 0; i < parseInt(repaymentSchedule.scheduleNum); i++) {
            if (parseFloat(this.loanPaymentSchedule[i].paymentAmount) <= 0.00) {
                this.addRepayment(this.loanPaymentSchedule[i].dueDate, this.loanPaymentSchedule[i].paymentAmount);
            }
        }
    } else {
        //check if past maturity date
        if (this.paymentEndDate < dateNow) {
            for (let i = 0; i < parseInt(this.loanTerm); i++) {
                if (parseFloat(this.loanPaymentSchedule[i].paymentAmount) <= 0.00) {
                    this.addRepayment(this.loanPaymentSchedule[i].dueDate, this.loanPaymentSchedule[i].paymentAmount);
                    if (i == (this.loanTerm - 1)) {
                        function monthDiff(d1, d2) {
                            var months;
                            months = (d2.getFullYear() - d1.getFullYear()) * 12;
                            months -= d1.getMonth();
                            months += d2.getMonth();
                            return months <= 0 ? 0 : months;
                        }
                        let lateMonths = 1 + (monthDiff(new Date(this.paymentEndDate), new Date(dateNow)));
                        let monthlyRate = parseFloat(this.monthlyInterestRate) / 100.0;
                        for (let i = 0; i < lateMonths; ++i) {
                            let count = parseInt(this.loanTerm) + i;
                            let data = {};
                            data.scheduleNum = 1 + parseInt(this.loanPaymentSchedule[count - 1].scheduleNum);
                            data.paymentDate = "";
                            data.paymentAmount = "0.00";
                            let d = new Date(this.loanPaymentSchedule[count - 1].dueDate);
                            d.setFullYear(d.getFullYear(), d.getMonth() + 1, d.getDate());
                            data.dueDate = d;
                            data.amountDue = ROUND((1 + monthlyRate) * parseFloat(this.loanPaymentSchedule[count - 1].principalBalance));
                            data.interest = this.loanPaymentSchedule[count - 1].interest;
                            data.interestAccrued = this.loanPaymentSchedule[count - 1].interestAccrued;
                            data.principal = this.loanPaymentSchedule[count - 1].principal;
                            data.principalBalance = this.loanPaymentSchedule[count - 1].principalBalance;
                            data.interestBalance = ROUND(parseFloat(this.loanPaymentSchedule[count - 1].interestBalance) + parseFloat(this.loanPaymentSchedule[count - 1].interestAccrued));
                            this.loanPaymentSchedule.push(data);
                        }
                        var sum = function (items, prop) {
                            return items.reduce(function (a, b) {
                                return ROUND(parseFloat(a) + parseFloat(b[prop]))
                            }, 0);
                        };
                        this.totalPayments = sum(this.loanPaymentSchedule, 'paymentAmount');
                        this.totalInterestAccrued = sum(this.loanPaymentSchedule, 'interestAccrued');
                        this.totalInterestPaid = sum(this.loanPaymentSchedule, 'interestPaid');
                        this.unpaidInterest = ROUND(this.totalInterestAccrued - this.totalInterestPaid);
                        this.totalPrincipalPaid = sum(this.loanPaymentSchedule, 'principalPaid');
                        this.principalRemaining = ROUND(parseFloat(this.loanAmount) - parseFloat(this.totalPrincipalPaid));
                        this.status = "Loan Debt";
                    }
                }
            }
        }
    }
};

mongoose.model('Loan', loanSchema);