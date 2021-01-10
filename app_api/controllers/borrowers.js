const mongoose = require('mongoose');
const Borrower = mongoose.model('Borrower');

const borrowersList = (req, res) => {
    Borrower
        .find()
        .exec((err, borrowers) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(borrowers);
            }
        });
};

const borrowersCreate = (req, res) => {
    const borrower = new Borrower({
        profile,
        workBusinessInfo,
        gcashAccount,
        documents,
        beneficiaries,
        employeeNum,
        userId
    } = req.body);
    borrower.borrowerNum = Date.now();
    borrower.save((err) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(borrower);
    });
};

const borrowersReadOne = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findById(borrowerid)
        .exec((err, borrower) => {
            if (!borrower) {
                return res
                    .status(404)
                    .json({
                        "message": "borrower not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(borrower);
            }
        });
};

const borrowersUpdateOne = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findById(borrowerid)
        .exec((err, borrower) => {
            if (!borrower) {
                return res
                    .status(404)
                    .json({
                        "message": "borrowerid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            borrower.type = req.body.type;
            borrower.status = req.body.status;
            borrower.profile = req.body.profile;
            borrower.workBusinessInfo = req.body.workBusinessInfo;
            borrower.gcashAccount = req.body.gcashAccount;
            borrower.documents = req.body.documents;
            borrower.beneficiaries = req.body.beneficiaries;
            borrower.employeeNum = req.body.employeeNum;
            borrower.userId = req.body.userId;
            borrower.save((err) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(borrower);
                }
            });
        });
};

const borrowersDeleteOne = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findByIdAndRemove(borrowerid)
        .exec((err, borrower) => {
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

const borrowersUpdateStatus = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findById(borrowerid)
        .exec((err, borrower) => {
            if (!borrower) {
                return res
                    .status(404)
                    .json({
                        "message": "borrowerid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            borrower.status = req.body.status;
            if ("Verified" == req.body.status) {
                borrower.maxLoanAmount = req.body.maxLoanAmount;
                borrower.loanableAmount = req.body.maxLoanAmount;
            }
            borrower.reviewedBy = req.body.reviewedBy;
            borrower.reviewedDate = Date.now();
            borrower.save((err) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(borrower);
                }
            });
        });
};

const borrowersAddContributions = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findById(borrowerid)
        .exec((err, borrower) => {
            if (!borrower) {
                return res
                    .status(404)
                    .json({
                        "message": "borrowerid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            borrower.addContributions(req.body);
            borrower.save((err) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(borrower);
                }
            });
        });
};

const borrowersUpdateLoanableAmount = (req, res) => {
    const {
        borrowerid
    } = req.params;
    if (!borrowerid) {
        return res
            .status(404)
            .json({
                "message": "Not found, borrowerid is required"
            });
    }
    Borrower
        .findById(borrowerid)
        .exec((err, borrower) => {
            if (!borrower) {
                return res
                    .status(404)
                    .json({
                        "message": "borrowerid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            borrower.updateLoanableAmount(req.body);
            borrower.save((err) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(borrower);
                }
            });
        });
};

module.exports = {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersDeleteOne,
    borrowersUpdateStatus,
    borrowersAddContributions,
    borrowersUpdateLoanableAmount
};