const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

function validYear(year) {
    const text = /^[0-9]+$/;
    if (year != 0) {
        if ((year != "") && (!text.test(year))) {
            return false;
        }
        if (year.length != 4) {
            return false;
        }
        var current_year = new Date().getFullYear();
        if ((year < 1920) || (year > current_year)) {
            return false;
        }
        return true;
    }
}

const loansList = (req, res) => {
    Loan
        .find()
        .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit')
        .exec((err, loans) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                loans.forEach(loan => {
                    loan.validateRepayments();
                    loan.save();
                });
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
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit userId')
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
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
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
                        if (req.body.loanAmount != loan.loanAmount || req.body.loanTerm != loan.loanTerm || req.body.monthlyInterestRate != loan.monthlyInterestRate) {
                            loan.loanTerm = (req.body.loanTerm) ? req.body.loanTerm : loan.loanTerm;
                            loan.loanAmount = (req.body.loanAmount) ? req.body.loanAmount : loan.loanAmount;
                            loan.monthlyInterestRate = (req.body.monthlyInterestRate) ? req.body.monthlyInterestRate : loan.monthlyInterestRate;
                            loan.compute(loan.loanAmount, loan.monthlyInterestRate, loan.loanTerm);
                        }
                    }
                    loan.status = (req.body.status) ? req.body.status : loan.status;
                    if (req.body.status && "Loan Release" == req.body.status) loan.updateDates();
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

const loansSoftDeleteOne = (req, res) => {
    const {
        loanid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
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
                    loan.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : loan.isDeleted;
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
                                .status(204)
                                .json(null);
                        }
                    });
                }
            });
    }
};

const loansSchedulesUpdate = (req, res) => {
    const {
        loanid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
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
                    if (loan.status == "Open" || loan.status == "Fully Paid" || loan.status == "Loan Debt") {
                        loan.validateRepayments();
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
                    } else {
                        res
                            .status(404)
                            .json({
                                "message": "Cannot add new repayment. Loan status must updated."
                            });
                    }

                }
            });
    }
};

const loansSchedulesList = (req, res) => {
    const {
        loanid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit userId')
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
    const isValidloanid = mongoose.Types.ObjectId.isValid(loanid);
    const isValidscheduleid = mongoose.Types.ObjectId.isValid(scheduleid);
    if (!loanid && !scheduleid || !isValidloanid || !isValidscheduleid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid or scheduleid."
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
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit userId')
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
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit userId')
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
                    if ("Borrower" == req.payload.type && loan.requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    if (loan.status == "Open" || loan.status == "Loan Debt") {
                        loan.validateRepayments();
                        loan.save((err) => {
                            if (err) {
                                console.log(err);
                                res
                                    .status(404)
                                    .json({
                                        "message": err._message
                                    });
                            } else {
                                let dateNow = new Date();
                                dateNow.setHours(0);
                                dateNow.setMinutes(0);
                                dateNow.setSeconds(0);
                                let schedules = loan.loanPaymentSchedule.filter(function (schedule) {
                                    return dateNow <= new Date(schedule.dueDate);
                                });
                                if (schedules.length >= 1) {
                                    res
                                        .status(200)
                                        .json(schedules[0]);
                                } else {
                                    res
                                        .status(200)
                                        .json({
                                            "message": "No current due"
                                        });
                                }
                            }
                        });
                    } else {
                        res
                            .status(200)
                            .json({
                                "message": "No current due"
                            });
                    }
                }
            });
    }
};

const loansPastDueListByLoan = (req, res) => {
    const {
        loanid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Loan
            .findById(loanid)
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit userId')
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
                    if ("Borrower" == req.payload.type && loan.requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    if (loan.status == "Open" || loan.status == "Fully Paid" || loan.status == "Loan Debt") {
                        loan.validateRepayments();
                        loan.save((err) => {
                            if (err) {
                                console.log(err);
                                res
                                    .status(404)
                                    .json({
                                        "message": err._message
                                    });
                            } else {
                                let dateNow = new Date();
                                dateNow.setHours(0);
                                dateNow.setMinutes(0);
                                dateNow.setSeconds(0);
                                let dateLastMonth = new Date(dateNow);
                                dateLastMonth.setMonth(dateNow.getMonth() - 1);
                                let schedules = loan.loanPaymentSchedule.filter(function (schedule) {
                                    return dateLastMonth < new Date(schedule.dueDate) && dateNow > new Date(schedule.dueDate);
                                });
                                if (schedules.length >= 1) {
                                    res
                                        .status(200)
                                        .json(schedules[0]);
                                } else {
                                    res
                                        .status(200)
                                        .json({
                                            "message": "No past due"
                                        });
                                }
                            }
                        });
                    } else {
                        res
                            .status(200)
                            .json({
                                "message": "No past due"
                            });
                    }
                }
            });
    }
};

const loansDueRepaymentsList = (req, res) => {
    Loan
        .find({
            "status": "Open"
        })
        .exec((err, loans) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                loans.forEach(loan => {
                    loan.validateRepayments();
                    loan.save();
                });
                Loan
                    .find({
                        "status": "Open"
                    })
                    .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit')
                    .exec((err, updatedLoans) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            function filterDues(array) {
                                let dateNow = new Date();
                                dateNow.setHours(0);
                                dateNow.setMinutes(0);
                                dateNow.setSeconds(0);
                                for (let i = 0; i < array.length; i++) {
                                    let loanPaymentSchedule = array[i].loanPaymentSchedule.filter(function (schedule) {
                                        return dateNow <= new Date(schedule.dueDate);
                                    });
                                    if (loanPaymentSchedule.length >= 1) {
                                        array[i].loanPaymentSchedule = loanPaymentSchedule[0];
                                    } else {
                                        array[i].loanPaymentSchedule = [];
                                    }
                                }
                                return array;
                            }
                            res
                                .status(200)
                                .json(filterDues(updatedLoans));
                        }
                    });
            }
        });
};

const loansPastMaturityRepaymentsList = (req, res) => {
    const dateToday = new Date();
    Loan
        .find({
            paymentEndDate: {
                $lt: dateToday
            },
            $expr: {
                $gt: [{
                    $toDouble: "$principalRemaining"
                }, 0]
            }
        })
        .exec((err, loans) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                loans.forEach(loan => {
                    loan.validateRepayments();
                    loan.save();
                });
                Loan
                    .find({
                        "status": "Loan Debt"
                    })
                    .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email totalCreditLimit')
                    .exec((err, updatedLoans) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            function filterDues(array) {
                                let dateNow = new Date();
                                dateNow.setHours(0);
                                dateNow.setMinutes(0);
                                dateNow.setSeconds(0);
                                for (let i = 0; i < array.length; i++) {
                                    let loanPaymentSchedule = array[i].loanPaymentSchedule.filter(function (schedule) {
                                        return dateNow <= new Date(schedule.dueDate);
                                    });
                                    if (loanPaymentSchedule.length >= 1) {
                                        array[i].loanPaymentSchedule = loanPaymentSchedule[0];
                                    } else {
                                        array[i].loanPaymentSchedule = [];
                                    }
                                }
                                return array;
                            }
                            res
                                .status(200)
                                .json(filterDues(updatedLoans));
                        }
                    });
            }
        });
};

const loansListByUser = (req, res) => {
    const {
        userid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(userid);
    if (!userid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
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
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid borrowerid."
            });
    } else {
        Loan
            .find({
                "requestedBy": mongoose.Types.ObjectId(borrowerid)
            }, {
                "loanPaymentSchedule": 0,
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

const loansSoftDeleteManyByBorrower = (req, res) => {
    const {
        borrowerid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid borrowerid."
            });
    } else {
        Loan
            .updateMany({
                "requestedBy": mongoose.Types.ObjectId(borrowerid)
            }, {
                $set: {
                    "isDeleted": req.body.isDeleted
                }
            })
            .exec((err, loans) => {
                if (!loans) {
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

const loansSummary = (req, res) => {
    const {
        year
    } = req.params;
    const isValid = validYear(year);
    if (!year || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid year."
            });
    } else {
        let date1 = new Date('2020-12-31');
        date1.setFullYear(parseInt(year) - 1);
        let date2 = new Date(date1);
        date2.setFullYear(parseInt(year));
        Loan
            .aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ])
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
    }
};

const loansTypeSummary = (req, res) => {
    const {
        year
    } = req.params;
    const isValid = validYear(year);
    if (!year || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid year."
            });
    } else {
        let date1 = new Date('2020-12-31');
        date1.setFullYear(parseInt(year) - 1);
        let date2 = new Date(date1);
        date2.setFullYear(parseInt(year));
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
                }
            ])
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
    }
};

const loansInterestReport = (req, res) => {
    const {
        year
    } = req.params;
    const isValid = validYear(year);
    if (!year || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid year."
            });
    } else {
        let date1 = new Date('2020-12-31');
        date1.setFullYear(parseInt(year) - 1);
        let date2 = new Date(date1);
        date2.setFullYear(parseInt(year));
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
    }
};

module.exports = {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansSoftDeleteOne,
    loansSchedulesList,
    loansSchedulesUpdate,
    loansSchedulesReadOne,
    loansDueListByLoan,
    loansPastDueListByLoan,
    loansDueRepaymentsList,
    loansPastMaturityRepaymentsList,
    loansListByUser,
    loansListByBorrower,
    loansSoftDeleteManyByBorrower,
    loansSummary,
    loansTypeSummary,
    loansInterestReport
};