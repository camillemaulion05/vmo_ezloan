const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');
const {
    promisify
} = require('util');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

const randomBytesAsync = promisify(crypto.randomBytes);

const employeesList = (req, res) => {
    Employee
        .find()
        .exec((err, employees) => {
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
                    .json(employees);
            }
        });
};

const employeesCreate = (req, res) => {
    const employee = new Employee({
        type,
        profile,
        account,
        employeeID,
        userId,
        signature
    } = req.body);
    employee.employeeNum = Date.now();
    if ("Employee" == req.payload.type) employee.userId = req.payload._id;
    Employee.findOne({
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
            Employee.findOne({
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
            Employee.findOne({
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
                    employee.save((err) => {
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
                }
            });
        }
    });
};

const employeesReadOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(employeeid);
    if (!employeeid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid employeeid."
            });
    } else {
        Employee
            .findById(employeeid)
            .populate('userId', 'username type lastLogin lastFailedLogin status security picture')
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
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
                        .json(employee);
                }
            });
    }
};

const employeesUpdateOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(employeeid);
    if (!employeeid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid employeeid."
            });
    } else {
        Employee
            .findById(employeeid)
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Employee" == req.payload.type && employee.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    employee.type = (req.body.type) ? req.body.type : employee.type;
                    employee.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : employee.profile.firstName;
                    employee.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : employee.profile.middleName;
                    employee.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : employee.profile.lastName;
                    employee.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : employee.profile.gender;
                    employee.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : employee.profile.dateOfBirth;
                    employee.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : employee.profile.address;
                    employee.profile.mobileNumVerified = (req.body.profile && req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (employee.profile.mobileNumVerified && employee.profile.mobileNum == req.body.profile.mobileNum) ? employee.profile.mobileNumVerified : false : employee.profile.mobileNumVerified;
                    employee.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : employee.profile.mobileNum;
                    employee.profile.emailVerified = (req.body.profile && req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (employee.profile.emailVerified && employee.profile.email == req.body.profile.email) ? employee.profile.emailVerified : false : employee.profile.emailVerified;
                    employee.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : employee.profile.email;
                    employee.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : employee.profile.emailVerificationToken;
                    employee.account = (req.body.account) ? req.body.account : employee.account;
                    employee.employeeID = (req.body.employeeID) ? req.body.employeeID : employee.employeeID;
                    employee.userId = (req.body.userId) ? req.body.userId : employee.userId;
                    employee.signature = (req.body.signature) ? req.body.signature : employee.signature;
                    employee.save((err) => {
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

const employeesSoftDeleteOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(employeeid);
    if (!employeeid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid employeeid."
            });
    } else {
        Employee
            .findById(employeeid)
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    employee.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : employee.isDeleted;
                    employee.save((err) => {
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

const employeesGetEmailByUser = (req, res) => {
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
        Employee.findOne({
                'userId': mongoose.Types.ObjectId(originalUserId),
            })
            .exec((err, employee) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "UserId not found."
                        });
                } else {
                    res
                        .status(200)
                        .json({
                            'email': employee.profile.email
                        });
                }
            });
    }
};

const employeesSetEmailToken = (req, res) => {
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
        Employee
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .exec((err, employee) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Email not found."
                        });
                } else {
                    if ("Employee" == req.payload.type && userid != req.payload._id) {
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
                            employee.profile.emailVerificationToken = token;
                            let encryptToken = CryptoJS.AES.encrypt(token, process.env.CRYPTOJS_SERVER_SECRET).toString();
                            employee.save((err) => {
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
                                            'email': employee.profile.email
                                        });
                                }
                            });
                        })
                        .catch(err);
                }
            });
    }
};

const employeesVerifyEmailToken = (req, res) => {
    const isValid = mongoose.Types.ObjectId.isValid(req.body.userid);
    if (!isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
            });
    } else {
        Employee.findOne({
                "userId": mongoose.Types.ObjectId(req.body.userid)
            })
            .exec((err, employee) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Invalid token or expired token."
                        });
                } else {
                    if ("Employee" == req.payload.type && req.body.userid != req.payload._id) {
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
                    if (employee.profile.emailVerificationToken == originalToken) {
                        employee.profile.emailVerificationToken = '';
                        employee.profile.emailVerified = true;
                        employee.save((err) => {
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

const employeesReadOneByUser = (req, res) => {
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
        Employee
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .populate('userId', 'username type lastLogin lastFailedLogin status security picture')
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
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
                        .json(employee);
                }
            });
    }
};


const employeesUpdateOneByUser = (req, res) => {
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
        Employee
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Employee" == req.payload.type && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    employee.type = (req.body.type) ? req.body.type : employee.type;
                    employee.profile.firstName = (req.body.profile && req.body.profile.firstName) ? req.body.profile.firstName : employee.profile.firstName;
                    employee.profile.middleName = (req.body.profile && req.body.profile.middleName) ? req.body.profile.middleName : employee.profile.middleName;
                    employee.profile.lastName = (req.body.profile && req.body.profile.lastName) ? req.body.profile.lastName : employee.profile.lastName;
                    employee.profile.gender = (req.body.profile && req.body.profile.gender) ? req.body.profile.gender : employee.profile.gender;
                    employee.profile.dateOfBirth = (req.body.profile && req.body.profile.dateOfBirth) ? req.body.profile.dateOfBirth : employee.profile.dateOfBirth;
                    employee.profile.address = (req.body.profile && req.body.profile.address) ? req.body.profile.address : employee.profile.address;
                    employee.profile.mobileNumVerified = (req.body.profile && req.body.profile && req.body.profile.mobileNumVerified) ? req.body.profile.mobileNumVerified : (req.body.profile && req.body.profile.mobileNum) ? (employee.profile.mobileNumVerified && employee.profile.mobileNum == req.body.profile.mobileNum) ? employee.profile.mobileNumVerified : false : employee.profile.mobileNumVerified;
                    employee.profile.mobileNum = (req.body.profile && req.body.profile.mobileNum) ? req.body.profile.mobileNum : employee.profile.mobileNum;
                    employee.profile.emailVerified = (req.body.profile && req.body.profile && req.body.profile.emailVerified) ? req.body.profile.emailVerified : (req.body.profile && req.body.profile.email) ? (employee.profile.emailVerified && employee.profile.email == req.body.profile.email) ? employee.profile.emailVerified : false : employee.profile.emailVerified;
                    employee.profile.email = (req.body.profile && req.body.profile.email) ? req.body.profile.email : employee.profile.email;
                    employee.profile.emailVerificationToken = (req.body.profile && req.body.profile.emailVerificationToken) ? req.body.profile.emailVerificationToken : employee.profile.emailVerificationToken;
                    employee.account = (req.body.account) ? req.body.account : employee.account;
                    employee.employeeID = (req.body.employeeID) ? req.body.employeeID : employee.employeeID;
                    employee.userId = (req.body.userId) ? req.body.userId : employee.userId;
                    employee.signature = (req.body.signature) ? req.body.signature : employee.signature;
                    employee.save((err) => {
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

const employeesAccountList = (req, res) => {
    Employee
        .find({
            "type": "Loan Processor"
        }, {
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.mobileNum": 1,
            "account": 1,
            "_id": 1
        })
        .exec((err, employees) => {
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
                    .json(employees);
            }
        });
};

module.exports = {
    employeesList,
    employeesCreate,
    employeesReadOne,
    employeesUpdateOne,
    employeesSoftDeleteOne,
    employeesGetEmailByUser,
    employeesSetEmailToken,
    employeesVerifyEmailToken,
    employeesReadOneByUser,
    employeesUpdateOneByUser,
    employeesAccountList
};