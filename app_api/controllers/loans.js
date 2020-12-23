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
    loan.compute(req.body.loanAmount, req.body.monthlyInterestRate, loanTerm);
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
            loan.status = req.body.status;
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

module.exports = {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansDeleteOne
};