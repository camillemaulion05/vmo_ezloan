const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');

const employeesList = (req, res) => {
    Employee
        .find({}, {
            "employeeNum": 1,
            "type": 1,
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.gender": 1,
            "profile.dateOfBirth": 1,
            "profile.mobileNum": 1,
            "profile.email": 1,
            "userId": 1
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

const employeesCreate = (req, res) => {
    const employee = new Employee({
        type,
        profile,
        userId,
        signature
    } = req.body);
    employee.employeeNum = Date.now();
    if ("Employee" == req.payload.type) employee.userId = req.payload._id;
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
};

const employeesReadOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
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
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
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
                    employee.profile.employeeID = (req.body.profile && req.body.profile.employeeID) ? req.body.profile.employeeID : employee.profile.employeeID;
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

const employeesDeleteOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    } else {
        Employee
            .findByIdAndRemove(employeeid)
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
                        .status(204)
                        .json(null);
                }
            });
    }
};

const employeesGetEmailByUser = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.userId, process.env.CRYPTOJS_SERVER_SECRET);
    let originalUserId = bytes.toString(CryptoJS.enc.Utf8);
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
};

const employeesSetEmailToken = (req, res) => {
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
                let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
                let originalToken = bytes.toString(CryptoJS.enc.Utf8);
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
};

const employeesReadOneByUser = (req, res) => {
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
        Employee
            .findOne({
                'userId': mongoose.Types.ObjectId(userid),
            })
            .populate('userId', 'username lastLogin lastFailedLogin status security picture')
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
    if (!userid) {
        res
            .status(404)
            .json({
                "message": "Not found, userid is required"
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
                    employee.profile.employeeID = (req.body.profile && req.body.profile.employeeID) ? req.body.profile.employeeID : employee.profile.employeeID;
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

module.exports = {
    employeesList,
    employeesCreate,
    employeesReadOne,
    employeesUpdateOne,
    employeesDeleteOne,
    employeesGetEmailByUser,
    employeesSetEmailToken,
    employeesVerifyEmailToken,
    employeesReadOneByUser,
    employeesUpdateOneByUser
};