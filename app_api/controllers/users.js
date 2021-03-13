const mongoose = require('mongoose');
const User = mongoose.model('User');
const {
    promisify
} = require('util');
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

const randomBytesAsync = promisify(crypto.randomBytes);

const usersList = (req, res) => {
    User
        .find({}, {
            "password": 0,
            "passwordResetToken": 0,
            "passwordResetExpires": 0,
            "emailVerificationToken": 0,
            "security": 0
        })
        .exec((err, users) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                res
                    .status(200)
                    .json(users);
            }
        });
};

const usersCreate = (req, res) => {
    const user = new User({
        username,
        password,
        passwordResetToken,
        passwordResetExpires,
        email,
        emailVerificationToken,
        emailVerified,
        mobileNum,
        mobileNumVerified,
        lastLogin,
        lastFailedLogin,
        status,
        type,
        security
    } = req.body);
    user.userNum = Date.now();
    if (req.body.security) user.encryptSecurityAnswer();
    User.findOne({
        username: req.body.username
    }, (err, existingUser) => {
        if (err) {
            res
                .status(400)
                .json({
                    "message": err._message
                });
        } else if (existingUser) {
            res
                .status(400)
                .json({
                    "message": "Account with that username already exists."
                });
        } else {
            user.save((err) => {
                if (err) {
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    const token = user.generateJwt();
                    res
                        .status(201)
                        .json({
                            'username': user.username,
                            'token': token
                        });
                }
            });
        }
    });
};

const usersReadOne = (req, res) => {
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
        User
            .findById(userid)
            .exec((err, user) => {
                if (!user) {
                    res
                        .status(404)
                        .json({
                            "message": "User not found."
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    res
                        .status(200)
                        .json(user);
                }
            });
    }
};

const usersUpdateOne = (req, res) => {
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
        User.findById(userid, (err, user) => {
            if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found."
                    });
            } else if (err) {
                res
                    .status(400)
                    .json({
                        "message": err._message
                    });
            } else {
                user.username = (req.body.username) ? req.body.username : user.username;
                user.password = (req.body.password) ? req.body.password : user.password;
                user.passwordResetToken = (req.body.passwordResetToken) ? req.body.passwordResetToken : user.passwordResetToken;
                user.passwordResetExpires = (req.body.passwordResetExpires) ? req.body.passwordResetExpires : user.passwordResetExpires;
                user.email = (req.body.email) ? req.body.email : user.email;
                user.emailVerificationToken = (req.body.emailVerificationToken) ? req.body.emailVerificationToken : user.emailVerificationToken;
                user.emailVerified = (req.body.emailVerified) ? req.body.emailVerified : user.emailVerified;
                user.mobileNum = (req.body.mobileNum) ? req.body.mobileNum : user.mobileNum;
                user.mobileNumVerified = (req.body.mobileNumVerified) ? req.body.mobileNumVerified : user.mobileNumVerified;
                user.lastLogin = (req.body.lastLogin) ? req.body.lastLogin : user.lastLogin;
                user.lastFailedLogin = (req.body.lastFailedLogin) ? req.body.lastFailedLogin : user.lastFailedLogin;
                user.status = (req.body.status) ? req.body.status : user.status;
                user.type = (req.body.type) ? req.body.type : user.type;
                user.security = (req.body.security) ? req.body.security : user.security;
                if (req.body.security) user.encryptSecurityAnswer();
                user.save((err) => {
                    if (err) {
                        res
                            .status(404)
                            .json({
                                "message": err._message
                            });
                    } else {
                        res
                            .status(200)
                            .json(user);
                    }
                });
            }
        });
    }
};

const usersDeleteOne = (req, res) => {
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
        User
            .findByIdAndRemove(userid)
            .exec((err, user) => {
                if (!user) {
                    res
                        .status(404)
                        .json({
                            "message": "User not found."
                        });
                } else if (err) {
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

const usersAuthenticate = (req, res) => {
    User.findOne({
            username: req.body.username
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid username or password."
                    });
            } else {
                user.comparePassword(req.body.password, (err, isMatch) => {
                    if (err) {
                        res
                            .status(404)
                            .json({
                                "message": err._message
                            });
                    } else if (isMatch) {
                        const token = user.generateJwt();
                        res
                            .status(200)
                            .json({
                                'username': user.username,
                                'token': token
                            });
                    } else {
                        res
                            .status(404)
                            .json({
                                "message": "Invalid username or password."
                            });
                    }
                });
            }
        });
};

const usersSetPasswordToken = (req, res) => {
    User.findOne({
            "email": req.body.email
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid email or security questions or answer."
                    });
            } else {
                user.compareSecurityAnswer(req.body.security, (err, isMatch) => {
                    if (err) {
                        res
                            .status(404)
                            .json({
                                "message": err._message
                            });
                    } else if (isMatch) {
                        const createRandomToken = randomBytesAsync(16)
                            .then((buf) => buf.toString('hex'));

                        createRandomToken
                            .then((token) => {
                                user.passwordResetToken = token;
                                user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                                let encryptToken = CryptoJS.AES.encrypt(token, process.env.CRYPTOJS_SERVER_SECRET).toString();
                                user.save((err) => {
                                    if (err) {
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

                    } else {
                        res
                            .status(404)
                            .json({
                                "message": "Invalid email or security questions or answer."
                            });
                    }
                });
            }
        });
};

const usersSetEmailToken = (req, res) => {
    User.findOne({
            "email": req.body.email
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid email or token."
                    });
            } else {
                const createRandomToken = randomBytesAsync(16)
                    .then((buf) => buf.toString('hex'));

                createRandomToken
                    .then((token) => {
                        user.emailVerificationToken = token;
                        let encryptToken = CryptoJS.AES.encrypt(token, process.env.CRYPTOJS_SERVER_SECRET).toString();
                        user.save((err) => {
                            if (err) {
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

const usersResetPassword = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
    let originalToken = bytes.toString(CryptoJS.enc.Utf8);
    User.findOne({
            "passwordResetToken": originalToken
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": 'Password reset token is invalid or has expired.'
                    });
            } else {
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.save((err) => {
                    if (err) {
                        res
                            .status(404)
                            .json({
                                "message": err._message
                            });
                    } else {
                        res
                            .status(200)
                            .json({
                                'message': 'Success! Your password has been changed.',
                                'email': user.email,
                                'username': user.username
                            });
                    }
                });
            }
        });
};

const usersVerifyEmailToken = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
    let originalToken = bytes.toString(CryptoJS.enc.Utf8);
    User.findOne({
            "emailVerificationToken": originalToken
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "Invalid token or expired token."
                    });
            } else {
                user.emailVerificationToken = '';
                user.emailVerified = true;
                user.save((err) => {
                    if (err) {
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

const usersValidatePasswordToken = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
    let originalToken = bytes.toString(CryptoJS.enc.Utf8);
    User.findOne({
            "passwordResetToken": originalToken
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": 'Password reset token is invalid or has expired.'
                    });
            } else {
                res
                    .status(200)
                    .json({
                        'message': 'Valid Token! You can now change your password.'
                    });
            }
        });
};

module.exports = {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne,
    usersAuthenticate,
    usersSetPasswordToken,
    usersSetEmailToken,
    usersResetPassword,
    usersVerifyEmailToken,
    usersValidatePasswordToken
};