const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

const loansList = (req, res) => {
    Loan
        .find({}, {
            "loanPaymentSchedule": 0,
            "reviewedBy": 0,
            "reviewedDate": 0,
            "updatedAt": 0,
            "__v": 0
        })
        .populate('requestedBy', 'profile.firstName profile.lastName type')
        .exec((err, loans) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(loans);
            }
        });
};

const loansCreate = (req, res) => {
    const loan = new Loan({
        loanType,
        loanTerm,
        loanAmount,
        monthlyInterestRate,
        requestedBy
    } = req.body);
    loan.loanNum = Date.now();
    loan.compute(req.body.loanAmount, req.body.monthlyInterestRate, req.body.loanTerm);
    loan.save((err) => {
        if (err) {
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(loan);
        }
    });
};

const loansReadOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy', 'profile.firstName profile.lastName type')
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "loan not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(loan);
                }
            });
    }
};

const loansUpdateOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy', 'profile.firstName profile.lastName type')
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "loanid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    loan.loanType = (req.body.loanType) ? req.body.loanType : loan.loanType;
                    loan.loanTerm = (req.body.loanTerm) ? req.body.loanTerm : loan.loanTerm;
                    loan.loanAmount = (req.body.loanAmount) ? req.body.loanAmount : loan.loanAmount;
                    loan.monthlyInterestRate = (req.body.monthlyInterestRate) ? req.body.monthlyInterestRate : loan.monthlyInterestRate;
                    loan.requestedBy = (req.body.requestedBy) ? req.body.requestedBy : loan.requestedBy;
                    loan.compute(loan.loanAmount, loan.monthlyInterestRate, loan.loanTerm);
                    loan.status = (req.body.status) ? req.body.status : loan.status;
                    loan.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : loan.reviewedBy;
                    loan.reviewedDate = (!req.body.reviewedBy || loan.reviewedDate) ? loan.reviewedDate : Date.now();
                    if ("Loan Release" == req.body.status) loan.updateDates();
                    loan.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json(err);
                        } else {
                            res
                                .status(200)
                                .json(loan);
                        }
                    });
                }
            });
    }
};

const loansDeleteOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Loan
            .findByIdAndRemove(loanid)
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "loan not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(204)
                        .json(null);
                }
            });
    }
};

const loansSchedulesUpdate = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy', 'profile.firstName profile.lastName type')
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "loanid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    loan.addRepayment(req.body.transactionDate, req.body.transactionAmount);
                    loan.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json(err);
                        } else {
                            res
                                .status(200)
                                .json(loan);
                        }
                    });
                }
            });
    }
};

const loansSchedulesList = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Loan
            .findById(loanid)
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "loan not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(loan.loanPaymentSchedule);
                }
            });
    }
};

const loansSchedulesReadOne = (req, res) => {
    const {
        loanid,
        scheduleid
    } = req.params;
    if (!loanid && !scheduleid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid and scheduleid is required"
            });
    } else {
        Loan
            .find({
                _id: mongoose.Types.ObjectId(loanid),
                "loanPaymentSchedule._id": mongoose.Types.ObjectId(scheduleid)
            }, {
                "loanPaymentSchedule.$": 1,
                "_id": 0
            })
            .exec((err, loanPaymentSchedule) => {
                if (!loanPaymentSchedule) {
                    res
                        .status(404)
                        .json({
                            "message": "loanPaymentSchedule not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(loanPaymentSchedule);
                }
            });
    }
};

const loansRepaymentsDue = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        // const dateToday = new Date("2021-05-13T00:56:41.812Z");
        const dateToday = new Date();
        Loan.find({
                _id: mongoose.Types.ObjectId(loanid),
                "loanPaymentSchedule.dueDate": {
                    $gte: dateToday
                }
            }, {
                "loanPaymentSchedule.$": 1,
                "_id": 0
            })
            .populate('requestedBy', 'profile.firstName profile.lastName type')
            .exec((err, loanPaymentSchedule) => {
                if (!loanPaymentSchedule) {
                    res
                        .status(404)
                        .json({
                            "message": "loan not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(loanPaymentSchedule);
                }
            });
    }
};

const loansSummary = (req, res) => {
    const {
        year
    } = req.params;
    if (!year) {
        res
            .status(404)
            .json({
                "message": "Not found, year is required"
            });
    } else {
        let date1 = new Date('2020-01-01');
        date1.setFullYear(year);
        let date2 = new Date(date1);
        date2.setFullYear(year + 1);
        Loan
            .aggregate([{
                    $match: {
                        'paymentStartDate': {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'borrowers',
                        localField: 'requestedBy',
                        foreignField: '_id',
                        as: 'borrower'
                    }
                },
                {
                    $group: {
                        _id: '$borrower.type',
                        loanAmount: {
                            $sum: {
                                $toDecimal: '$loanAmount'
                            }
                        },
                        totalPrincipalPaid: {
                            $sum: {
                                $toDecimal: '$totalPrincipalPaid'
                            }
                        },
                        principalRemaining: {
                            $sum: {
                                $toDecimal: '$principalRemaining'
                            }
                        },
                        totalInterestPaid: {
                            $sum: {
                                $toDecimal: '$totalInterestPaid'
                            }
                        },
                        unpaidInterest: {
                            $sum: {
                                $toDecimal: '$unpaidInterest'
                            }
                        },
                        totalPayments: {
                            $sum: {
                                $toDecimal: '$totalPayments'
                            }
                        },
                        serviceFee: {
                            $sum: {
                                $toDecimal: '$serviceFee'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    "$project": {
                        "_id": 1,
                        "borrower.type": 1,
                        "loanAmount": 1,
                        "totalPrincipalPaid": 1,
                        "principalRemaining": 1,
                        "totalInterestPaid": 1,
                        "unpaidInterest": 1,
                        "totalPayments": 1,
                        "serviceFee": 1,
                        "count": 1
                    }
                }
            ])
            .exec((err, transactions) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(transactions);
                }
            });
    }
};

const loansInterestReport = (req, res) => {
    const {
        year
    } = req.params;
    if (!year) {
        res
            .status(404)
            .json({
                "message": "Not found, year is required"
            });
    } else {
        let date1 = new Date('2020-01-01');
        date1.setFullYear(year);
        let date2 = new Date(date1);
        date2.setFullYear(year + 1);
        Loan
            .aggregate([{
                    $lookup: {
                        from: 'borrowers',
                        localField: 'requestedBy',
                        foreignField: '_id',
                        as: 'borrower'
                    }
                }, {
                    $match: {
                        'paymentStartDate': {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        },
                        'borrower.type': "Member"
                    }
                },
                {
                    $group: {
                        _id: '$requestedBy',
                        totalInterestPaid: {
                            $sum: {
                                $toDecimal: '$totalInterestPaid'
                            }
                        }
                    }
                }
            ])
            .exec((err, transactions) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(transactions);
                }
            });
    }
};

module.exports = {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansDeleteOne,
    loansSchedulesList,
    loansSchedulesUpdate,
    loansSchedulesReadOne,
    loansRepaymentsDue,
    loansSummary,
    loansInterestReport
};