const mongoose = require('mongoose');
const Borrower = mongoose.model('Borrower');
const {
    promisify
} = require('util');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

const randomBytesAsync = promisify(crypto.randomBytes);

const borrowersList = (req, res) => {
    Borrower
        .find({}, {
            "borrowerNum": 1,
            "type": 1,
            "status": 1,
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.gender": 1,
            "profile.dateOfBirth": 1,
            "profile.mobileNum": 1,
            "profile.email": 1
        })
        .exec((err, borrowers) => {
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
        account,
        signature,
        documents,
        beneficiaries,
        maxLoanAmount,
        reviewedBy,
        hrCertifiedBy,
        userId,
        sharesPerPayDay
    } = req.body);
    borrower.borrowerNum = Date.now();
    if (req.body.reviewedBy) borrower.reviewedDate = Date.now();
    if (req.body.hrCertifiedBy) borrower.hrCertifiedDate = Date.now();
    if ("Borrower" == req.payload.type) borrower.userId = mongoose.Types.ObjectId(req.payload._id);
    borrower.save((err) => {
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
                    if ("Borrower" == req.payload.type && borrower.userId._id != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
                            "message": "Borrower not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && borrower.userId._id != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    borrower.type = (req.body.type) ? req.body.type : borrower.type;
                    borrower.status = (req.body.status) ? req.body.status : borrower.status;
                    borrower.profile = (req.body.profile) ? req.body.profile : borrower.profile;
                    borrower.workBusinessInfo = (req.body.workBusinessInfo) ? req.body.workBusinessInfo : borrower.workBusinessInfo;
                    borrower.account = (req.body.account) ? req.body.account : borrower.account;
                    borrower.signature = (req.body.signature) ? req.body.signature : borrower.signature;
                    borrower.documents = (req.body.documents) ? req.body.documents : borrower.documents;
                    borrower.beneficiaries = (req.body.beneficiaries) ? req.body.beneficiaries : borrower.beneficiaries;
                    if ("Verified" == borrower.status) borrower.maxLoanAmount = (req.body.maxLoanAmount) ? req.body.maxLoanAmount : borrower.maxLoanAmount;
                    borrower.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : borrower.reviewedBy;
                    borrower.reviewedDate = (!req.body.reviewedBy && borrower.reviewedDate) ? borrower.reviewedDate : Date.now();
                    borrower.hrCertifiedBy = (req.body.hrCertifiedBy) ? req.body.hrCertifiedBy : borrower.hrCertifiedBy;
                    borrower.hrCertifiedDate = (!req.body.hrCertifiedBy && borrower.hrCertifiedDate) ? borrower.hrCertifiedDate : Date.now();
                    borrower.userId = (req.body.userId) ? req.body.userId : borrower.userId;
                    borrower.sharesPerPayDay = (req.body.sharesPerPayDay) ? req.body.sharesPerPayDay : borrower.sharesPerPayDay;
                    borrower.save((err) => {
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
                        .status(204)
                        .json(null);
                }
            });
    }
};

const borrowersGetEmail = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.userId, process.env.CRYPTOJS_SERVER_SECRET);
    let originalUserId = bytes.toString(CryptoJS.enc.Utf8);
    Borrower.findOne({
            'userId': mongoose.Types.ObjectId(originalUserId),
        })
        .exec((err, borrower) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!borrower) {
                res
                    .status(404)
                    .json({
                        "message": "UserId not found."
                    });
            } else {
                res
                    .status(200)
                    .json({
                        'email': borrower.profile.email
                    });
            }
        });
};

const borrowersSetEmailToken = (req, res) => {
    Borrower.findOne({
            "profile.email": req.body.email
        })
        .exec((err, borrower) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!borrower) {
                res
                    .status(404)
                    .json({
                        "message": "Email not found."
                    });
            } else {
                const createRandomToken = randomBytesAsync(16)
                    .then((buf) => buf.toString('hex'));

                createRandomToken
                    .then((token) => {
                        borrower.profile.emailVerificationToken = token;
                        let encryptToken = CryptoJS.AES.encrypt(token, process.env.CRYPTOJS_SERVER_SECRET).toString();
                        borrower.save((err) => {
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
                                        'token': encryptToken
                                    });
                            }
                        });
                    })
                    .catch(err);
            }
        });
};

const borrowersVerifyEmailToken = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_SERVER_SECRET);
    let originalToken = bytes.toString(CryptoJS.enc.Utf8);
    Borrower.findOne({
            "profile.emailVerificationToken": originalToken
        })
        .exec((err, borrower) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!borrower) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid token or expired token."
                    });
            } else {
                borrower.profile.emailVerificationToken = '';
                borrower.profile.emailVerified = true;
                borrower.save((err) => {
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
                                "message": "Thank you for verifying your email address."
                            });
                    }
                });
            }
        });
};


module.exports = {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersDeleteOne,
    borrowersGetEmail,
    borrowersSetEmailToken,
    borrowersVerifyEmailToken
};