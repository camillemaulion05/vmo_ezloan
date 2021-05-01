const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

const loansList = (req, res) => {
    Loan
        .find({}, {
            "loanPaymentSchedule": 0,
            "reviewedDate": 0,
            "updatedAt": 0,
            "__v": 0
        })
        .populate('requestedBy', 'profile.firstName profile.lastName type totalCreditLimit')
        .exec((err, loans) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                res
                    .status(200)
                    .json(loans);
            }
        });
};

const loansCreate = (req, res) => {
    const loan = new Loan({
        purposeOfLoan,
        loanTerm,
        loanAmount,
        monthlyInterestRate,
        requestedBy,
        status,
        reviewedBy
    } = req.body);
    loan.loanNum = Date.now();
    loan.compute(req.body.loanAmount, req.body.monthlyInterestRate, req.body.loanTerm);
    if ("Loan Release" == req.body.status) loan.updateDates();
    if (req.body.reviewedBy) loan.reviewedDate = Date.now();
    loan.save((err) => {
        if (err) {
            console.log(err);
            res
                .status(400)
                .json({
                    "message": err._message
                });
        } else {
            res
                .status(201)
                .json({
                    "message": "Created successfully."
                });
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
            .populate('requestedBy', 'profile.firstName profile.lastName type userId borrowerNum account.number')
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && loan.requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (req.body.loanAmount && req.body.monthlyInterestRate && req.body.loanTerm && loan.status == 'Processing') {
                        loan.purposeOfLoan = (req.body.purposeOfLoan) ? req.body.purposeOfLoan : loan.purposeOfLoan;
                        if (req.body.loanAmount != loan.loanAmount || req.body.loanTerm != loan.loanTerm || req.body.monthlyInterestRate != loan.monthlyInterestRate) {
                            loan.loanTerm = (req.body.loanTerm) ? req.body.loanTerm : loan.loanTerm;
                            loan.loanAmount = (req.body.loanAmount) ? req.body.loanAmount : loan.loanAmount;
                            loan.monthlyInterestRate = (req.body.monthlyInterestRate) ? req.body.monthlyInterestRate : loan.monthlyInterestRate;
                            loan.compute(loan.loanAmount, loan.monthlyInterestRate, loan.loanTerm);
                        }
                    }
                    if (req.body.status && req.body.status != loan.status && "Loan Release" == req.body.status) loan.updateDates();
                    loan.status = (req.body.status) ? req.body.status : loan.status;
                    loan.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : loan.reviewedBy;
                    loan.reviewedDate = (req.body.reviewedBy) ? Date.now() : loan.reviewedDate;
                    loan.save((err) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            res
                                .status(200)
                                .json({
                                    "message": "Updated successfully."
                                });
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
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
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
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    loan.addRepayment(req.body.transactionDate, req.body.transactionAmount);
                    loan.save((err) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            res
                                .status(200)
                                .json({
                                    "message": "Updated successfully."
                                });
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
            .populate('requestedBy', 'profile.firstName profile.lastName type userId borrowerNum account.number')
            .exec((err, loan) => {
                if (!loan) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan Schedules not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && loan.requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
            .populate('requestedBy', 'profile.firstName profile.lastName type userId')
            .exec((err, loanPaymentSchedule) => {
                if (!loanPaymentSchedule) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan Schedules not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (loanPaymentSchedule.length > 0 && "Borrower" == req.payload.type && loanPaymentSchedule[0].requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(loanPaymentSchedule);
                }
            });
    }
};

const loansDueListByLoan = (req, res) => {
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
        const dateToday = new Date();
        Loan.find({
                _id: mongoose.Types.ObjectId(loanid),
                "loanPaymentSchedule.dueDate": {
                    $gte: dateToday
                }
            }, {
                "loanPaymentSchedule.$": 1,
                "_id": 0,
                "requestedBy": 1
            })
            .populate('requestedBy', 'profile.firstName profile.lastName type userId')
            .exec((err, loanPaymentSchedule) => {
                if (!loanPaymentSchedule) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (loanPaymentSchedule.length > 0 && "Borrower" == req.payload.type && loanPaymentSchedule[0].requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(loanPaymentSchedule);
                }
            });
    }
};

const loansPastDueListByLoan = (req, res) => {
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
        const dateToday = new Date();
        const dateLastMonth = new Date(dateToday);
        dateLastMonth.setMonth(dateLastMonth.getMonth() - 1);
        Loan.find({
                _id: mongoose.Types.dObjectId(loanid),
                "loanPaymentSchedule.dueDate": {
                    $gte: dateLastMonth
                }
            }, {
                "loanPaymentSchedule.$": 1,
                "_id": 0
            })
            .populate('requestedBy', 'profile.firstName profile.lastName type userId')
            .exec((err, loanPaymentSchedule) => {
                if (!loanPaymentSchedule) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (loanPaymentSchedule.length > 0 && "Borrower" == req.payload.type && loanPaymentSchedule[0].requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(loanPaymentSchedule);
                }
            });
    }
};

const loansDueRepaymentsList = (req, res) => {
    const dateToday = new Date();
    Loan.find({
            "loanPaymentSchedule.dueDate": {
                $gte: dateToday
            }
        }, {
            "loanPaymentSchedule.$": 1,
            "_id": 0
        })
        .populate('requestedBy', 'profile.firstName profile.lastName type')
        .exec((err, loanPaymentSchedule) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                res
                    .status(200)
                    .json(loanPaymentSchedule);
            }
        });
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
                        paymentStartDate: {
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
                    $project: {
                        _id: 1,
                        'borrower.type': 1,
                        loanAmount: 1,
                        totalPrincipalPaid: 1,
                        principalRemaining: 1,
                        totalInterestPaid: 1,
                        unpaidInterest: 1,
                        totalPayments: 1,
                        serviceFee: 1,
                        count: 1
                    }
                }
            ])
            .exec((err, transactions) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
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
                        paymentStartDate: {
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
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    res
                        .status(200)
                        .json(transactions);
                }
            });
    }
};

const loansListByUser = (req, res) => {
    const {
        userid
    } = req.params;
    if (!userid) {
        res
            .status(404)
            .json({
                "message": "Not found, userid is required"
            });
    } else {
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
                    'borrower.userId': mongoose.Types.ObjectId(userid),
                }
            }, {
                $project: {
                    borrower: 0,
                    loanPaymentSchedule: 0
                }
            }])
            .exec((err, loans) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(loans);
                }
            });
    }
};

const loansListByBorrower = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    } else {
        Loan
            .find({
                "requestedBy": mongoose.Types.ObjectId(borrowerid)
            }, {
                "loanPaymentSchedule": 0,
                "reviewedDate": 0,
                "updatedAt": 0,
                "__v": 0
            })
            .exec((err, loans) => {
                if (!loans) {
                    res
                        .status(404)
                        .json({
                            "message": "Borrower not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    res
                        .status(200)
                        .json(loans);
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
    loansDueListByLoan,
    loansPastDueListByLoan,
    loansDueRepaymentsList,
    loansSummary,
    loansInterestReport,
    loansListByUser,
    loansListByBorrower
};