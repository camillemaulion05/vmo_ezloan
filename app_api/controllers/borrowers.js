const mongoose = require('mongoose');
const Borrower = mongoose.model('Borrower');
const {
    promisify
} = require('util');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

const randomBytesAsync = promisify(crypto.randomBytes);

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

function validBorrowerType(type) {
    if (type == "Member") return true;
    if (type == "Non-Member") return true;
    return false;
}

const borrowersList = (req, res) => {
    Borrower
        .find()
        .populate('reviewedBy hrCertifiedBy', 'profile.firstName profile.lastName')
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
        employeeID,
        account,
        signature,
        documents,
        additionalDocuments,
        beneficiaries,
        totalCreditLimit,
        reviewedBy,
        hrCertifiedBy,
        userId,
        sharesPerPayDay
    } = req.body);
    borrower.borrowerNum = Date.now();
    if (req.body.reviewedBy) borrower.reviewedDate = Date.now();
    if (req.body.hrCertifiedBy) borrower.hrCertifiedDate = Date.now();
    if ("Borrower" == req.payload.type) borrower.userId = mongoose.Types.ObjectId(req.payload._id);
    Borrower.findOne({
        'profile.mobileNum': profile.mobileNum
    }, (err, existingMobileNum) => {
        if (err) {
            console.log(err);
            res
                .status(400)
                .json({
                    "message": err._message
                });
        } else if (existingMobileNum) {
            Borrower.findOne({
                'profile.email': profile.email
            }, (err, existingEmail) => {
                if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else if (existingEmail) {
                    res
                        .status(400)
                        .json({
                            "message": "Account with that mobile number and email address already exists."
                        });
                } else {
                    res
                        .status(400)
                        .json({
                            "message": "Account with that mobile number already exists."
                        });
                }
            });
        } else {
            Borrower.findOne({
                'profile.email': profile.email
            }, (err, existingEmail) => {
                if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else if (existingEmail) {
                    res
                        .status(400)
                        .json({
                            "message": "Account with that email address already exists."
                        });
                } else {
                    borrower.save((err) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(400)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            let userId = CryptoJS.AES.encrypt(req.payload._id, process.env.CRYPTOJS_SERVER_SECRET).toString();
                            res
                                .status(201)
                                .json({
                                    "message": "Created successfully.",
                                    "id": userId
                                });
                        }
                    });
                }
            });
        }
    });
};

const borrowersReadOne = (req, res) => {
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
        Borrower
            .findById(borrowerid)
            .populate('userId reviewedBy hrCertifiedBy', 'username type lastLogin lastFailedLogin status security picture profile.firstName profile.lastName signature')
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
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid borrowerid."
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
                    if ("Borrower" == req.payload.type && borrower.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    borrower.type = (req.body.type) ? req.body.type : borrower.type;
                    borrower.status = (req.body.status) ? req.body.status : borrower.status;

                    borrower.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : borrower.profile.firstName;
                    borrower.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : borrower.profile.middleName;
                    borrower.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : borrower.profile.lastName;
                    borrower.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : borrower.profile.gender;
                    borrower.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : borrower.profile.dateOfBirth;
                    borrower.profile.maritalStat = (req.body.profile && req.body.profile.maritalStat) ? req.body.profile.maritalStat : borrower.profile.maritalStat;
                    borrower.profile.dependents = (req.body.profile && req.body.profile.dependents) ? req.body.profile.dependents : borrower.profile.dependents;
                    borrower.profile.educAttainment = (req.body.profile && req.body.profile.educAttainment) ? req.body.profile.educAttainment : borrower.profile.educAttainment;
                    borrower.profile.placeOfBirth = (req.body.profile && req.body.profile.placeOfBirth) ? req.body.profile.placeOfBirth : borrower.profile.placeOfBirth;
                    borrower.profile.nationality = (req.body.profile && req.body.profile.nationality) ? req.body.profile.nationality : borrower.profile.nationality;
                    borrower.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : borrower.profile.address;
                    borrower.profile.homeOwnership = (req.body.profile && req.body.profile.homeOwnership) ? req.body.profile.homeOwnership : borrower.profile.homeOwnership;
                    borrower.profile.homePhoneNum = (req.body.profile && req.body.profile.homePhoneNum) ? req.body.profile.homePhoneNum : borrower.profile.homePhoneNum;
                    borrower.profile.mobileNumVerified = (req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (borrower.profile.mobileNumVerified && borrower.profile.mobileNum == req.body.profile.mobileNum) ? borrower.profile.mobileNumVerified : false : borrower.profile.mobileNumVerified;
                    borrower.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : borrower.profile.mobileNum;
                    borrower.profile.tin = (req.body.profile && req.body.profile.tin) ? req.body.profile.tin : borrower.profile.tin;
                    borrower.profile.emailVerified = (req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (borrower.profile.emailVerified && borrower.profile.email == req.body.profile.email) ? borrower.profile.emailVerified : false : borrower.profile.emailVerified;
                    borrower.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : borrower.profile.email;
                    borrower.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : borrower.profile.emailVerificationToken;
                    borrower.profile.nameOfSpouse = (req.body.profile && req.body.profile.nameOfSpouse) ? req.body.profile.nameOfSpouse : borrower.profile.nameOfSpouse;

                    borrower.workBusinessInfo.companyName = (req.body.workBusinessInfo && req.body.workBusinessInfo.companyName) ? req.body.workBusinessInfo.companyName : borrower.workBusinessInfo.companyName;
                    borrower.workBusinessInfo.department = (req.body.workBusinessInfo && req.body.workBusinessInfo.department) ? req.body.workBusinessInfo.department : borrower.workBusinessInfo.department;
                    borrower.workBusinessInfo.officePhone = (req.body.workBusinessInfo && req.body.workBusinessInfo.officePhone) ? req.body.workBusinessInfo.officePhone : borrower.workBusinessInfo.officePhone;
                    borrower.workBusinessInfo.officeAddress = req.body.workBusinessInfo && (req.body.workBusinessInfo.officeAddress) ? req.body.workBusinessInfo.officeAddress : borrower.workBusinessInfo.officeAddress;
                    borrower.workBusinessInfo.dateHired = (req.body.workBusinessInfo && req.body.workBusinessInfo.dateHired) ? req.body.workBusinessInfo.dateHired : borrower.workBusinessInfo.dateHired;
                    borrower.workBusinessInfo.employmentType = (req.body.workBusinessInfo && req.body.workBusinessInfo.employmentType) ? req.body.workBusinessInfo.employmentType : borrower.workBusinessInfo.employmentType;
                    borrower.workBusinessInfo.occupationType = (req.body.workBusinessInfo && req.body.workBusinessInfo.occupationType) ? req.body.workBusinessInfo.occupationType : borrower.workBusinessInfo.occupationType;
                    borrower.workBusinessInfo.businessType = (req.body.workBusinessInfo && req.body.workBusinessInfo.businessType) ? req.body.workBusinessInfo.businessType : borrower.workBusinessInfo.businessType;
                    borrower.workBusinessInfo.position = (req.body.workBusinessInfo && req.body.workBusinessInfo.position) ? req.body.workBusinessInfo.position : borrower.workBusinessInfo.position;
                    borrower.workBusinessInfo.monthlyIncome = (req.body.workBusinessInfo && req.body.workBusinessInfo.monthlyIncome) ? req.body.workBusinessInfo.monthlyIncome : borrower.workBusinessInfo.monthlyIncome;

                    borrower.employeeID = (req.body.employeeID) ? req.body.employeeID : borrower.employeeID;
                    borrower.account = (req.body.account) ? req.body.account : borrower.account;
                    borrower.signature = (req.body.signature) ? req.body.signature : borrower.signature;

                    borrower.documents.primaryIdFront = (req.body.documents && req.body.documents.primaryIdFront) ? req.body.documents.primaryIdFront : borrower.documents.primaryIdFront;
                    borrower.documents.primaryIdBack = (req.body.documents && req.body.documents.primaryIdBack) ? req.body.documents.primaryIdBack : borrower.documents.primaryIdBack;
                    borrower.documents.companyIdFront = (req.body.documents && req.body.documents.companyIdFront) ? req.body.documents.companyIdFront : borrower.documents.companyIdFront;
                    borrower.documents.companyIdBack = (req.body.documents && req.body.documents.companyIdBack) ? req.body.documents.companyIdBack : borrower.documents.companyIdBack;
                    borrower.documents.coe = (req.body.documents && req.body.documents.coe) ? req.body.documents.coe : borrower.documents.coe;
                    borrower.documents.payslip1 = (req.body.documents && req.body.documents.payslip1) ? req.body.documents.payslip1 : borrower.documents.payslip1;
                    borrower.documents.payslip2 = (req.body.documents && req.body.documents.payslip2) ? req.body.documents.payslip2 : borrower.documents.payslip2;
                    borrower.documents.bir = (req.body.documents && req.body.documents.bir) ? req.body.documents.bir : borrower.documents.bir;
                    borrower.documents.tinProof = (req.body.documents && req.body.documents.tinProof) ? req.body.documents.tinProof : borrower.documents.tinProof;
                    borrower.documents.selfiewithId = (req.body.documents && req.body.documents.selfiewithId) ? req.body.documents.selfiewithId : borrower.documents.selfiewithId;

                    borrower.additionalDocuments = (req.body.additionalDocuments) ? req.body.additionalDocuments : borrower.additionalDocuments;

                    borrower.beneficiaries.fullName1 = (req.body.beneficiaries && req.body.beneficiaries.fullName1) ? req.body.beneficiaries.fullName1 : borrower.beneficiaries.fullName1;
                    borrower.beneficiaries.relationship1 = (req.body.beneficiaries && req.body.beneficiaries.relationship1) ? req.body.beneficiaries.relationship1 : borrower.beneficiaries.relationship1;
                    borrower.beneficiaries.dateOfBirth1 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth1) ? req.body.beneficiaries.dateOfBirth1 : borrower.beneficiaries.dateOfBirth1;
                    borrower.beneficiaries.fullName2 = (req.body.beneficiaries && req.body.beneficiaries.fullName2) ? req.body.beneficiaries.fullName2 : borrower.beneficiaries.fullName2;
                    borrower.beneficiaries.relationship2 = (req.body.beneficiaries && req.body.beneficiaries.relationship2) ? req.body.beneficiaries.relationship2 : borrower.beneficiaries.relationship2;
                    borrower.beneficiaries.dateOfBirth2 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth2) ? req.body.beneficiaries.dateOfBirth2 : borrower.beneficiaries.dateOfBirth2;
                    borrower.beneficiaries.fullName3 = (req.body.beneficiaries && req.body.beneficiaries.fullName3) ? req.body.beneficiaries.fullName3 : borrower.beneficiaries.fullName3;
                    borrower.beneficiaries.relationship3 = (req.body.beneficiaries && req.body.beneficiaries.relationship3) ? req.body.beneficiaries.relationship3 : borrower.beneficiaries.relationship3;
                    borrower.beneficiaries.dateOfBirth3 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth3) ? req.body.beneficiaries.dateOfBirth3 : borrower.beneficiaries.dateOfBirth3;
                    borrower.beneficiaries.fullName4 = (req.body.beneficiaries && req.body.beneficiaries.fullName4) ? req.body.beneficiaries.fullName4 : borrower.beneficiaries.fullName4;
                    borrower.beneficiaries.relationship4 = (req.body.beneficiaries && req.body.beneficiaries.relationship4) ? req.body.beneficiaries.relationship4 : borrower.beneficiaries.relationship4;
                    borrower.beneficiaries.dateOfBirth4 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth4) ? req.body.beneficiaries.dateOfBirth4 : borrower.beneficiaries.dateOfBirth4;
                    borrower.beneficiaries.fullName5 = (req.body.beneficiaries && req.body.beneficiaries.fullName5) ? req.body.beneficiaries.fullName5 : borrower.beneficiaries.fullName5;
                    borrower.beneficiaries.relationship5 = (req.body.beneficiaries && req.body.beneficiaries.relationship5) ? req.body.beneficiaries.relationship5 : borrower.beneficiaries.relationship5;
                    borrower.beneficiaries.dateOfBirth5 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth5) ? req.body.beneficiaries.dateOfBirth5 : borrower.beneficiaries.dateOfBirth5;

                    if ("Verified" == borrower.status) borrower.totalCreditLimit = (req.body.totalCreditLimit) ? req.body.totalCreditLimit : borrower.totalCreditLimit;
                    borrower.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : borrower.reviewedBy;
                    borrower.reviewedDate = (req.body.reviewedBy) ? Date.now() : borrower.reviewedDate;
                    borrower.hrCertifiedBy = (req.body.hrCertifiedBy) ? req.body.hrCertifiedBy : borrower.hrCertifiedBy;
                    borrower.hrCertifiedDate = (req.body.hrCertifiedBy) ? Date.now() : borrower.hrCertifiedDate;
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
                                .json({
                                    "message": "Updated successfully."
                                });
                        }
                    });
                }
            });
    }
};

const borrowersSoftDeleteOne = (req, res) => {
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
                    borrower.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : borrower.isDeleted;
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
                                .status(204)
                                .json(null);
                        }
                    });
                }
            });
    }
};

const borrowersGetEmailByUser = (req, res) => {
    let bytes = "",
        originalUserId = "";
    try {
        bytes = CryptoJS.AES.decrypt(req.body.userid, process.env.CRYPTOJS_SERVER_SECRET);
        originalUserId = bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.log(err);
        res
            .status(404)
            .json({
                "message": "Invalid userid."
            });
    }
    const isValid = mongoose.Types.ObjectId.isValid(originalUserId);
    if (!isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid originalUserId."
            });
    } else {
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
    }
};

const borrowersSetEmailToken = (req, res) => {
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
        Borrower
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
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
                    if ("Borrower" == req.payload.type && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
                                            'token': encryptToken,
                                            'email': borrower.profile.email
                                        });
                                }
                            });
                        })
                        .catch(err);
                }
            });
    }
};

const borrowersVerifyEmailToken = (req, res) => {
    const isValid = mongoose.Types.ObjectId.isValid(req.body.userid);
    if (!isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
            });
    } else {
        Borrower.findOne({
                "userId": mongoose.Types.ObjectId(req.body.userid)
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
                            "message": "Not found userid."
                        });
                } else {
                    if ("Borrower" == req.payload.type && req.body.userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    let bytes = "",
                        originalToken = "";
                    try {
                        bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
                        originalToken = bytes.toString(CryptoJS.enc.Utf8);
                    } catch (err) {
                        console.log(err);
                        res
                            .status(404)
                            .json({
                                "message": "Invalid token or expired token."
                            });
                    }
                    if (borrower.profile.emailVerificationToken == originalToken) {
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
                    } else {
                        res
                            .status(404)
                            .json({
                                "message": "Invalid token or expired token."
                            });
                    }
                }
            });
    }
};

const borrowersReadOneByUser = (req, res) => {
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
        Borrower
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .populate('userId reviewedBy hrCertifiedBy', 'username type lastLogin lastFailedLogin status security picture profile.firstName profile.lastName signature')
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
                    if ("Borrower" == req.payload.type && userid != req.payload._id) {
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


const borrowersUpdateOneByUser = (req, res) => {
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
        Borrower
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
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
                    if ("Borrower" == req.payload.type && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    borrower.type = (req.body.type) ? req.body.type : borrower.type;
                    borrower.status = (req.body.status) ? req.body.status : borrower.status;

                    borrower.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : borrower.profile.firstName;
                    borrower.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : borrower.profile.middleName;
                    borrower.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : borrower.profile.lastName;
                    borrower.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : borrower.profile.gender;
                    borrower.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : borrower.profile.dateOfBirth;
                    borrower.profile.maritalStat = (req.body.profile && req.body.profile.maritalStat) ? req.body.profile.maritalStat : borrower.profile.maritalStat;
                    borrower.profile.dependents = (req.body.profile && req.body.profile.dependents) ? req.body.profile.dependents : borrower.profile.dependents;
                    borrower.profile.educAttainment = (req.body.profile && req.body.profile.educAttainment) ? req.body.profile.educAttainment : borrower.profile.educAttainment;
                    borrower.profile.placeOfBirth = (req.body.profile && req.body.profile.placeOfBirth) ? req.body.profile.placeOfBirth : borrower.profile.placeOfBirth;
                    borrower.profile.nationality = (req.body.profile && req.body.profile.nationality) ? req.body.profile.nationality : borrower.profile.nationality;
                    borrower.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : borrower.profile.address;
                    borrower.profile.homeOwnership = (req.body.profile && req.body.profile.homeOwnership) ? req.body.profile.homeOwnership : borrower.profile.homeOwnership;
                    borrower.profile.homePhoneNum = (req.body.profile && req.body.profile.homePhoneNum) ? req.body.profile.homePhoneNum : borrower.profile.homePhoneNum;
                    borrower.profile.mobileNumVerified = (req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (borrower.profile.mobileNumVerified && borrower.profile.mobileNum == req.body.profile.mobileNum) ? borrower.profile.mobileNumVerified : false : borrower.profile.mobileNumVerified;
                    borrower.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : borrower.profile.mobileNum;
                    borrower.profile.tin = (req.body.profile && req.body.profile.tin) ? req.body.profile.tin : borrower.profile.tin;
                    borrower.profile.emailVerified = (req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (borrower.profile.emailVerified && borrower.profile.email == req.body.profile.email) ? borrower.profile.emailVerified : false : borrower.profile.emailVerified;
                    borrower.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : borrower.profile.email;
                    borrower.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : borrower.profile.emailVerificationToken;
                    borrower.profile.nameOfSpouse = (req.body.profile && req.body.profile.nameOfSpouse) ? req.body.profile.nameOfSpouse : borrower.profile.nameOfSpouse;

                    borrower.workBusinessInfo.companyName = (req.body.workBusinessInfo && req.body.workBusinessInfo.companyName) ? req.body.workBusinessInfo.companyName : borrower.workBusinessInfo.companyName;
                    borrower.workBusinessInfo.department = (req.body.workBusinessInfo && req.body.workBusinessInfo.department) ? req.body.workBusinessInfo.department : borrower.workBusinessInfo.department;
                    borrower.workBusinessInfo.officePhone = (req.body.workBusinessInfo && req.body.workBusinessInfo.officePhone) ? req.body.workBusinessInfo.officePhone : borrower.workBusinessInfo.officePhone;
                    borrower.workBusinessInfo.officeAddress = req.body.workBusinessInfo && (req.body.workBusinessInfo.officeAddress) ? req.body.workBusinessInfo.officeAddress : borrower.workBusinessInfo.officeAddress;
                    borrower.workBusinessInfo.dateHired = (req.body.workBusinessInfo && req.body.workBusinessInfo.dateHired) ? req.body.workBusinessInfo.dateHired : borrower.workBusinessInfo.dateHired;
                    borrower.workBusinessInfo.employmentType = (req.body.workBusinessInfo && req.body.workBusinessInfo.employmentType) ? req.body.workBusinessInfo.employmentType : borrower.workBusinessInfo.employmentType;
                    borrower.workBusinessInfo.occupationType = (req.body.workBusinessInfo && req.body.workBusinessInfo.occupationType) ? req.body.workBusinessInfo.occupationType : borrower.workBusinessInfo.occupationType;
                    borrower.workBusinessInfo.businessType = (req.body.workBusinessInfo && req.body.workBusinessInfo.businessType) ? req.body.workBusinessInfo.businessType : borrower.workBusinessInfo.businessType;
                    borrower.workBusinessInfo.position = (req.body.workBusinessInfo && req.body.workBusinessInfo.position) ? req.body.workBusinessInfo.position : borrower.workBusinessInfo.position;
                    borrower.workBusinessInfo.monthlyIncome = (req.body.workBusinessInfo && req.body.workBusinessInfo.monthlyIncome) ? req.body.workBusinessInfo.monthlyIncome : borrower.workBusinessInfo.monthlyIncome;

                    borrower.employeeID = (req.body.employeeID) ? req.body.employeeID : borrower.employeeID;
                    borrower.account = (req.body.account) ? req.body.account : borrower.account;
                    borrower.signature = (req.body.signature) ? req.body.signature : borrower.signature;

                    borrower.documents.primaryIdFront = (req.body.documents && req.body.documents.primaryIdFront) ? req.body.documents.primaryIdFront : borrower.documents.primaryIdFront;
                    borrower.documents.primaryIdBack = (req.body.documents && req.body.documents.primaryIdBack) ? req.body.documents.primaryIdBack : borrower.documents.primaryIdBack;
                    borrower.documents.companyIdFront = (req.body.documents && req.body.documents.companyIdFront) ? req.body.documents.companyIdFront : borrower.documents.companyIdFront;
                    borrower.documents.companyIdBack = (req.body.documents && req.body.documents.companyIdBack) ? req.body.documents.companyIdBack : borrower.documents.companyIdBack;
                    borrower.documents.coe = (req.body.documents && req.body.documents.coe) ? req.body.documents.coe : borrower.documents.coe;
                    borrower.documents.payslip1 = (req.body.documents && req.body.documents.payslip1) ? req.body.documents.payslip1 : borrower.documents.payslip1;
                    borrower.documents.payslip2 = (req.body.documents && req.body.documents.payslip2) ? req.body.documents.payslip2 : borrower.documents.payslip2;
                    borrower.documents.bir = (req.body.documents && req.body.documents.bir) ? req.body.documents.bir : borrower.documents.bir;
                    borrower.documents.tinProof = (req.body.documents && req.body.documents.tinProof) ? req.body.documents.tinProof : borrower.documents.tinProof;
                    borrower.documents.selfiewithId = (req.body.documents && req.body.documents.selfiewithId) ? req.body.documents.selfiewithId : borrower.documents.selfiewithId;

                    borrower.additionalDocuments = (req.body.additionalDocuments) ? req.body.additionalDocuments : borrower.additionalDocuments;

                    borrower.beneficiaries.fullName1 = (req.body.beneficiaries && req.body.beneficiaries.fullName1) ? req.body.beneficiaries.fullName1 : borrower.beneficiaries.fullName1;
                    borrower.beneficiaries.relationship1 = (req.body.beneficiaries && req.body.beneficiaries.relationship1) ? req.body.beneficiaries.relationship1 : borrower.beneficiaries.relationship1;
                    borrower.beneficiaries.dateOfBirth1 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth1) ? req.body.beneficiaries.dateOfBirth1 : borrower.beneficiaries.dateOfBirth1;
                    borrower.beneficiaries.fullName2 = (req.body.beneficiaries && req.body.beneficiaries.fullName2) ? req.body.beneficiaries.fullName2 : borrower.beneficiaries.fullName2;
                    borrower.beneficiaries.relationship2 = (req.body.beneficiaries && req.body.beneficiaries.relationship2) ? req.body.beneficiaries.relationship2 : borrower.beneficiaries.relationship2;
                    borrower.beneficiaries.dateOfBirth2 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth2) ? req.body.beneficiaries.dateOfBirth2 : borrower.beneficiaries.dateOfBirth2;
                    borrower.beneficiaries.fullName3 = (req.body.beneficiaries && req.body.beneficiaries.fullName3) ? req.body.beneficiaries.fullName3 : borrower.beneficiaries.fullName3;
                    borrower.beneficiaries.relationship3 = (req.body.beneficiaries && req.body.beneficiaries.relationship3) ? req.body.beneficiaries.relationship3 : borrower.beneficiaries.relationship3;
                    borrower.beneficiaries.dateOfBirth3 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth3) ? req.body.beneficiaries.dateOfBirth3 : borrower.beneficiaries.dateOfBirth3;
                    borrower.beneficiaries.fullName4 = (req.body.beneficiaries && req.body.beneficiaries.fullName4) ? req.body.beneficiaries.fullName4 : borrower.beneficiaries.fullName4;
                    borrower.beneficiaries.relationship4 = (req.body.beneficiaries && req.body.beneficiaries.relationship4) ? req.body.beneficiaries.relationship4 : borrower.beneficiaries.relationship4;
                    borrower.beneficiaries.dateOfBirth4 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth4) ? req.body.beneficiaries.dateOfBirth4 : borrower.beneficiaries.dateOfBirth4;
                    borrower.beneficiaries.fullName5 = (req.body.beneficiaries && req.body.beneficiaries.fullName5) ? req.body.beneficiaries.fullName5 : borrower.beneficiaries.fullName5;
                    borrower.beneficiaries.relationship5 = (req.body.beneficiaries && req.body.beneficiaries.relationship5) ? req.body.beneficiaries.relationship5 : borrower.beneficiaries.relationship5;
                    borrower.beneficiaries.dateOfBirth5 = (req.body.beneficiaries && req.body.beneficiaries.dateOfBirth5) ? req.body.beneficiaries.dateOfBirth5 : borrower.beneficiaries.dateOfBirth5;

                    if ("Verified" == borrower.status) borrower.totalCreditLimit = (req.body.totalCreditLimit) ? req.body.totalCreditLimit : borrower.totalCreditLimit;
                    borrower.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : borrower.reviewedBy;
                    borrower.reviewedDate = (req.body.reviewedBy) ? Date.now() : borrower.reviewedDate;
                    borrower.hrCertifiedBy = (req.body.hrCertifiedBy) ? req.body.hrCertifiedBy : borrower.hrCertifiedBy;
                    borrower.hrCertifiedDate = (req.body.hrCertifiedBy) ? Date.now() : borrower.hrCertifiedDate;
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
                                .json({
                                    "message": "Updated successfully."
                                });
                        }
                    });
                }
            });
    }
};

const borrowersListByType = (req, res) => {
    const {
        type
    } = req.params;
    const isValid = validBorrowerType(type);
    if (!type || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid transaction type."
            });
    } else {
        Borrower
            .find({
                "type": type
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
    }
};

const borrowersSummary = (req, res) => {
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
        Borrower
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
                        _id: {
                            type: '$type',
                            status: '$status',
                        },
                        borrowerCount: {
                            $sum: 1
                        },
                    }
                },
                {
                    $group: {
                        _id: '$_id.type',
                        borrowers: {
                            $push: {
                                status: '$_id.status',
                                count: '$borrowerCount'
                            },
                        },
                        count: {
                            $sum: '$borrowerCount'
                        },
                    }
                }
            ])
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
    }
};

module.exports = {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersSoftDeleteOne,
    borrowersGetEmailByUser,
    borrowersSetEmailToken,
    borrowersVerifyEmailToken,
    borrowersReadOneByUser,
    borrowersUpdateOneByUser,
    borrowersListByType,
    borrowersSummary
};