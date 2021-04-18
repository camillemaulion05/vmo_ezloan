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
                    borrower.profile.mobileNumVerified = (req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (borrower.profile.mobileNumVerified && req.body.profile.mobileNum && borrower.profile.mobileNum == req.body.profile.mobileNum) ? true : false;
                    borrower.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : borrower.profile.mobileNum;
                    borrower.profile.tin = (req.body.profile && req.body.profile.tin) ? req.body.profile.tin : borrower.profile.tin;
                    borrower.profile.emailVerified = (req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (borrower.profile.emailVerified && req.body.profile.email && borrower.profile.email == req.body.profile.email) ? true : false;
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
                    borrower.workBusinessInfo.employeeID = (req.body.workBusinessInfo && req.body.workBusinessInfo.employeeID) ? req.body.workBusinessInfo.employeeID : borrower.workBusinessInfo.employeeID;

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

const borrowersGetEmailByUser = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.userid, process.env.CRYPTOJS_SERVER_SECRET);
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
                        "message": "Invalid token or expired token."
                    });
            } else {
                let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
                let originalToken = bytes.toString(CryptoJS.enc.Utf8);
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
};

const borrowersReadOneByUser = (req, res) => {
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
        Borrower
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            }, {
                "createdAt:": 0,
                "reviewedDate": 0,
                "updatedAt": 0,
                "__v": 0
            })
            .populate('userId', 'username lastLogin lastFailedLogin status security picture')
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


const borrowersUpdateOneByUser = (req, res) => {
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
                    if ("Borrower" == req.payload.type && borrower.userId._id != req.payload._id) {
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
                    borrower.profile.mobileNumVerified = (req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (borrower.profile.mobileNumVerified && req.body.profile.mobileNum && borrower.profile.mobileNum == req.body.profile.mobileNum) ? true : false;
                    borrower.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : borrower.profile.mobileNum;
                    borrower.profile.tin = (req.body.profile && req.body.profile.tin) ? req.body.profile.tin : borrower.profile.tin;
                    borrower.profile.emailVerified = (req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (borrower.profile.emailVerified && req.body.profile.email && borrower.profile.email == req.body.profile.email) ? true : false;
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
                    borrower.workBusinessInfo.employeeID = (req.body.workBusinessInfo && req.body.workBusinessInfo.employeeID) ? req.body.workBusinessInfo.employeeID : borrower.workBusinessInfo.employeeID;

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

module.exports = {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersDeleteOne,
    borrowersGetEmailByUser,
    borrowersSetEmailToken,
    borrowersVerifyEmailToken,
    borrowersReadOneByUser,
    borrowersUpdateOneByUser
};