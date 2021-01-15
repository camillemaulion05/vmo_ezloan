const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

const loansList = (req, res) => {
    Loan
        .find()
        .exec((err, loans) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
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
        borrowersId
    } = req.body);
    loan.loanNum = Date.now();
    loan.compute(req.body.loanAmount, req.body.monthlyInterestRate, req.body.loanTerm);
    loan.save((err) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(loan);
    });
};

const loansReadOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findById(loanid)
        .exec((err, loan) => {
            if (!loan) {
                return res
                    .status(404)
                    .json({
                        "message": "loan not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(loan);
            }
        });
};

const loansUpdateOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findById(loanid)
        .exec((err, loan) => {
            if (!loan) {
                return res
                    .status(404)
                    .json({
                        "message": "loanid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            loan.loanType = req.body.loanType;
            loan.loanTerm = req.body.loanTerm;
            loan.loanAmount = req.body.loanAmount;
            loan.monthlyInterestRate = req.body.monthlyInterestRate;
            loan.borrowersId = req.body.borrowersId;
            loan.compute(req.body.loanAmount, req.body.monthlyInterestRate, req.body.loanTerm);
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
        });
};

const loansDeleteOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findByIdAndRemove(loanid)
        .exec((err, loan) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            }
            res
                .status(204)
                .json(null);
        });
};

const loansUpdateStatus = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findById(loanid)
        .exec((err, loan) => {
            if (!loan) {
                return res
                    .status(404)
                    .json({
                        "message": "loanid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            loan.status = req.body.status;
            loan.reviewedDate = Date.now();
            loan.reviewedBy = req.body.reviewedBy;
            if ("Release" == req.body.status) {
                loan.transactionId = req.body.transactionId;
                loan.updateDates();
            }
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
        });
};

const loansRepaymentsUpdate = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findById(loanid)
        .exec((err, loan) => {
            if (!loan) {
                return res
                    .status(404)
                    .json({
                        "message": "loanid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            loan.addRepayment(req.body.transactionDate, req.body.transactionAmount, req.body.transactionId);
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
        });
};

const loansRepaymentsList = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    Loan
        .findById(loanid)
        .exec((err, loan) => {
            if (!loan) {
                return res
                    .status(404)
                    .json({
                        "message": "loan not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(loan.loanPaymentSchedule);
            }
        });
};

const loansRepaymentsReadOne = (req, res) => {
    const {
        loanid,
        repaymentid
    } = req.params;
    if (!loanid && !repaymentid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid and repaymentid is required"
            });
    }
    Loan
        .find({
            _id: mongoose.Types.ObjectId(loanid),
            "loanPaymentSchedule._id": mongoose.Types.ObjectId(repaymentid)
        }, {
            "loanPaymentSchedule.$": 1,
            "_id": 0
        })
        .exec((err, loanPaymentSchedule) => {
            if (!loanPaymentSchedule) {
                return res
                    .status(404)
                    .json({
                        "message": "loanPaymentSchedule not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(loanPaymentSchedule);
            }
        });
};

const loansSchedulesReadOne = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        return res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    }
    const dateToday = new Date("2021-05-13T00:56:41.812Z");
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
                return res
                    .status(404)
                    .json({
                        "message": "loan not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(loanPaymentSchedule);
            }
        });
};

module.exports = {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansDeleteOne,
    loansUpdateStatus,
    loansRepaymentsList,
    loansRepaymentsUpdate,
    loansRepaymentsReadOne,
    loansSchedulesReadOne
};