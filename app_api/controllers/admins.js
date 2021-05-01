const mongoose = require('mongoose');
const Admin = mongoose.model('Admin');
const {
    promisify
} = require('util');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

const randomBytesAsync = promisify(crypto.randomBytes);

const adminsList = (req, res) => {
    Admin
        .find({}, {
            "adminNum": 1,
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.gender": 1,
            "profile.dateOfBirth": 1,
            "profile.mobileNum": 1,
            "profile.email": 1,
            "employeeID": 1,
            "userId": 1
        })
        .exec((err, admin) => {
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
                    .json(admin);
            }
        });
};

const adminsCreate = (req, res) => {
    const admin = new Admin({
        profile,
        employeeID,
        userId
    } = req.body);
    admin.adminNum = Date.now();
    if ("Admin" == req.payload.type) admin.userId = req.payload._id;
    admin.save((err) => {
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

const adminsReadOne = (req, res) => {
    const {
        adminid
    } = req.params;
    if (!adminid) {
        res
            .status(404)
            .json({
                "message": "Not found, adminid is required"
            });
    } else {
        Admin
            .findById(adminid)
            .exec((err, admin) => {
                if (!admin) {
                    res
                        .status(404)
                        .json({
                            "message": "Admin not found."
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
                        .json(admin);
                }
            });
    }
};

const adminsUpdateOne = (req, res) => {
    const {
        adminid
    } = req.params;
    if (!adminid) {
        res
            .status(404)
            .json({
                "message": "Not found, adminid is required"
            });
    } else {
        Admin
            .findById(adminid)
            .exec((err, admin) => {
                if (!admin) {
                    res
                        .status(404)
                        .json({
                            "message": "Admin not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    admin.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : admin.profile.firstName;
                    admin.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : admin.profile.middleName;
                    admin.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : admin.profile.lastName;
                    admin.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : admin.profile.gender;
                    admin.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : admin.profile.dateOfBirth;
                    admin.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : admin.profile.address;
                    admin.profile.mobileNumVerified = (req.body.profile && req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (admin.profile.mobileNumVerified && admin.profile.mobileNum == req.body.profile.mobileNum) ? admin.profile.mobileNumVerified : false : admin.profile.mobileNumVerified;
                    admin.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : admin.profile.mobileNum;
                    admin.profile.emailVerified = (req.body.profile && req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (admin.profile.emailVerified && admin.profile.email == req.body.profile.email) ? admin.profile.emailVerified : false : admin.profile.emailVerified;
                    admin.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : admin.profile.email;
                    admin.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : admin.profile.emailVerificationToken;
                    admin.employeeID = (req.body.employeeID) ? req.body.employeeID : admin.employeeID;
                    admin.userId = (req.body.userId) ? req.body.userId : admin.userId;
                    admin.save((err) => {
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

const adminsDeleteOne = (req, res) => {
    const {
        adminid
    } = req.params;
    if (!adminid) {
        res
            .status(404)
            .json({
                "message": "Not found, adminid is required"
            });
    } else {
        Admin
            .findByIdAndRemove(adminid)
            .exec((err, admin) => {
                if (!admin) {
                    res
                        .status(404)
                        .json({
                            "message": "Admin not found."
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

const adminsGetEmailByUser = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.userId, process.env.CRYPTOJS_SERVER_SECRET);
    let originalUserId = bytes.toString(CryptoJS.enc.Utf8);
    Admin.findOne({
            'userId': mongoose.Types.ObjectId(originalUserId),
        })
        .exec((err, admin) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!admin) {
                res
                    .status(404)
                    .json({
                        "message": "UserId not found."
                    });
            } else {
                res
                    .status(200)
                    .json({
                        'email': admin.profile.email
                    });
            }
        });
};

const adminsSetEmailToken = (req, res) => {
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
        Admin
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .exec((err, admin) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else if (!admin) {
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
                            admin.profile.emailVerificationToken = token;
                            let encryptToken = CryptoJS.AES.encrypt(token, process.env.CRYPTOJS_SERVER_SECRET).toString();
                            admin.save((err) => {
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
                                            'email': admin.profile.email
                                        });
                                }
                            });
                        })
                        .catch(err);
                }
            });
    }
};

const adminsVerifyEmailToken = (req, res) => {
    Admin.findOne({
            "userId": mongoose.Types.ObjectId(req.body.userid)
        })
        .exec((err, admin) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!admin) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid token or expired token."
                    });
            } else {
                let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
                let originalToken = bytes.toString(CryptoJS.enc.Utf8);
                if (admin.profile.emailVerificationToken == originalToken) {
                    admin.profile.emailVerificationToken = '';
                    admin.profile.emailVerified = true;
                    admin.save((err) => {
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

const adminsReadOneByUser = (req, res) => {
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
        Admin
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .populate('userId', 'username type lastLogin lastFailedLogin status security picture')
            .exec((err, admin) => {
                if (!admin) {
                    res
                        .status(404)
                        .json({
                            "message": "Admin not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Admin" == req.payload.type && admin.userId._id != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(admin);
                }
            });
    }
};


const adminsUpdateOneByUser = (req, res) => {
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
        Admin
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .exec((err, admin) => {
                if (!admin) {
                    res
                        .status(404)
                        .json({
                            "message": "Admin not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Admin" == req.payload.type && admin.userId._id != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    admin.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : admin.profile.firstName;
                    admin.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : admin.profile.middleName;
                    admin.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : admin.profile.lastName;
                    admin.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : admin.profile.gender;
                    admin.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : admin.profile.dateOfBirth;
                    admin.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : admin.profile.address;
                    admin.profile.mobileNumVerified = (req.body.profile && req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (admin.profile.mobileNumVerified && admin.profile.mobileNum == req.body.profile.mobileNum) ? admin.profile.mobileNumVerified : false : admin.profile.mobileNumVerified;
                    admin.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : admin.profile.mobileNum;
                    admin.profile.emailVerified = (req.body.profile && req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (admin.profile.emailVerified && admin.profile.email == req.body.profile.email) ? admin.profile.emailVerified : false : admin.profile.emailVerified;
                    admin.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : admin.profile.email;
                    admin.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : admin.profile.emailVerificationToken;
                    admin.employeeID = (req.body.employeeID) ? req.body.employeeID : admin.employeeID;
                    admin.userId = (req.body.userId) ? req.body.userId : admin.userId;
                    admin.save((err) => {
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

module.exports = {
    adminsList,
    adminsCreate,
    adminsReadOne,
    adminsUpdateOne,
    adminsDeleteOne,
    adminsGetEmailByUser,
    adminsSetEmailToken,
    adminsVerifyEmailToken,
    adminsReadOneByUser,
    adminsUpdateOneByUser
};