const mongoose = require('mongoose');
const Borrower = mongoose.model('Borrower');

const borrowersList = (req, res) => {
    Borrower
        .find({}, {
            "type": 1,
            "status": 1,
            "maxLoanAmount": 1,
            "borrowerNum": 1,
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.birthday": 1,
            "profile.gender": 1,
            "profile.mobileNum": 1,
            "profile.email": 1,
            "workBusinessInfo.occupationalType": 1
        })
        .exec((err, borrowers) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(borrowers);
            }
        });
};

const borrowersCreate = (req, res) => {
    const borrower = new Borrower({
        type,
        status,
        profile,
        workBusinessInfo,
        gcashAccount,
        documents,
        beneficiaries,
        employeeNum,
        maxLoanAmount,
        reviewedBy,
        userId
    } = req.body);
    borrower.borrowerNum = Date.now();
    if (req.body.reviewedBy) borrower.reviewedDate = Date.now();
    borrower.save((err) => {
        if (err) {
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(borrower);
        }
    });
};

const borrowersReadOne = (req, res) => {
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
        Borrower
            .findById(borrowerid)
            .exec((err, borrower) => {
                if (!borrower) {
                    res
                        .status(404)
                        .json({
                            "message": "borrower not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(borrower);
                }
            });
    }
};

const borrowersUpdateOne = (req, res) => {
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
        Borrower
            .findById(borrowerid)
            .exec((err, borrower) => {
                if (!borrower) {
                    res
                        .status(404)
                        .json({
                            "message": "borrowerid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    borrower.type = (req.body.type) ? req.body.type : borrower.type;
                    borrower.status = (req.body.status) ? req.body.status : borrower.status;
                    borrower.profile = (req.body.profile) ? req.body.profile : borrower.profile;
                    borrower.workBusinessInfo = (req.body.workBusinessInfo) ? req.body.workBusinessInfo : borrower.workBusinessInfo;
                    borrower.gcashAccount = (req.body.tygcashAccounte) ? req.body.gcashAccount : borrower.gcashAccount;
                    borrower.documents = (req.body.documents) ? req.body.documents : borrower.documents;
                    borrower.beneficiaries = (req.body.beneficiaries) ? req.body.beneficiaries : borrower.beneficiaries;
                    borrower.employeeNum = (req.body.employeeNum) ? req.body.employeeNum : borrower.employeeNum;
                    if ("Verified" == borrower.status) borrower.maxLoanAmount = (req.body.maxLoanAmount) ? req.body.maxLoanAmount : borrower.maxLoanAmount;
                    borrower.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : borrower.reviewedBy;
                    borrower.reviewedDate = (!req.body.reviewedBy && borrower.reviewedDate) ? borrower.reviewedDate : Date.now();
                    borrower.userId = (req.body.userId) ? req.body.userId : borrower.userId;
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
                }
            });
    }
};

const borrowersDeleteOne = (req, res) => {
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
        Borrower
            .findByIdAndRemove(borrowerid)
            .exec((err, borrower) => {
                if (!borrower) {
                    res
                        .status(404)
                        .json({
                            "message": "borrower not found"
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

module.exports = {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersDeleteOne
};