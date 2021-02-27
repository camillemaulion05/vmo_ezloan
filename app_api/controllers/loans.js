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
            .populate('requestedBy')
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

module.exports = {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansDeleteOne,
    loansSchedulesList,
    loansSchedulesUpdate,
    loansSchedulesReadOne,
    loansRepaymentsDue
};