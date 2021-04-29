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
            "security": 0
        })
        .exec((err, users) => {
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
        lastLogin,
        lastFailedLogin,
        status,
        type,
        security,
        picture
    } = req.body);
    user.userNum = Date.now();
    if (req.body.security) user.encryptSecurityAnswer();
    User.findOne({
        username: req.body.username
    }, (err, existingUser) => {
        if (err) {
            console.log(err);
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
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (req.payload && "Admin" == req.payload.type) {
                        res
                            .status(201)
                            .json({
                                'id': user._id
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
            .findById(userid, {
                "password": 0,
                "passwordResetToken": 0,
                "passwordResetExpires": 0,
                "security": 0
            })
            .exec((err, user) => {
                if (!user) {
                    res
                        .status(404)
                        .json({
                            "message": "User not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (("Borrower" == req.payload.type || "Employee" == req.payload.type) && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
                console.log(err);
                res
                    .status(400)
                    .json({
                        "message": err._message
                    });
            } else {
                if (("Borrower" == req.payload.type || "Employee" == req.payload.type) && userid != req.payload._id) {
                    return res
                        .status(403)
                        .json({
                            "message": "You don\'t have permission to do that!"
                        });
                }
                user.username = (req.body.username) ? req.body.username : user.username;
                user.password = (req.body.password) ? req.body.password : user.password;
                user.passwordResetToken = (req.body.passwordResetToken) ? req.body.passwordResetToken : user.passwordResetToken;
                user.passwordResetExpires = (req.body.passwordResetExpires) ? req.body.passwordResetExpires : user.passwordResetExpires;
                user.lastLogin = (req.body.lastLogin) ? req.body.lastLogin : user.lastLogin;
                user.lastFailedLogin = (req.body.lastFailedLogin) ? req.body.lastFailedLogin : user.lastFailedLogin;
                user.status = (req.body.status) ? req.body.status : user.status;
                user.type = (req.body.type) ? req.body.type : user.type;
                user.security = (req.body.security) ? req.body.security : user.security;
                if (req.body.security) user.encryptSecurityAnswer();
                user.picture = (req.body.picture) ? req.body.picture : user.picture;
                user.save((err) => {
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

const usersAuthenticate = (req, res) => {
    User.findOne({
            username: req.body.username
        })
        .exec((err, user) => {
            if (err) {
                console.log(err);
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
                        console.log(err);
                        res
                            .status(404)
                            .json({
                                "message": err._message
                            });
                    } else if (isMatch) {
                        user.lastLogin = Date.now();
                        user.save((err) => {
                            if (err) {
                                console.log(err);
                                res
                                    .status(404)
                                    .json({
                                        "message": err._message
                                    });
                            } else {
                                const token = user.generateJwt();
                                res
                                    .status(200)
                                    .json({
                                        'id': user._id,
                                        'type': user.type,
                                        'token': token
                                    });
                            }
                        });

                    } else {
                        user.lastFailedLogin = Date.now();
                        user.save((err) => {
                            if (err) {
                                console.log(err);
                                res
                                    .status(404)
                                    .json({
                                        "message": err._message
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
            }
        });
};

const usersSetPasswordToken = (req, res) => {
    User.findOne({
            username: req.body.username
        })
        .exec((err, user) => {
            if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found."
                    });
            } else if (err) {
                console.log(err);
                res
                    .status(400)
                    .json({
                        "message": err._message
                    });
            } else {
                if (user.security.length > 0) {
                    user.compareSecurityAnswer(req.body.security, (err, isMatch) => {
                        if (err) {
                            console.log(err);
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
                                    let encryptUserId = CryptoJS.AES.encrypt((user._id).toString(), process.env.CRYPTOJS_SERVER_SECRET).toString();
                                    user.save((err) => {
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
                                                    'userid': encryptUserId,
                                                    'type': user.type
                                                });
                                        }
                                    });
                                })
                                .catch(err);

                        } else {
                            res
                                .status(404)
                                .json({
                                    "message": "Invalid username or security questions or answer."
                                });
                        }
                    });
                } else {
                    res
                        .status(404)
                        .json({
                            "message": "Security questions are not yet setup."
                        });
                }
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
                console.log(err);
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

const usersResetPassword = (req, res) => {
    let bytes = CryptoJS.AES.decrypt(req.body.token, process.env.CRYPTOJS_CLIENT_SECRET);
    let originalToken = bytes.toString(CryptoJS.enc.Utf8);
    User.findOne({
            "passwordResetToken": originalToken
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                console.log(err);
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
                let encryptUserId = CryptoJS.AES.encrypt((user._id).toString(), process.env.CRYPTOJS_SERVER_SECRET).toString();
                user.save((err) => {
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
                                'message': 'Success! Your password has been changed.',
                                'userid': encryptUserId,
                                'username': user.username,
                                'type': user.type
                            });
                    }
                });
            }
        });
};

const usersChangePassword = (req, res) => {
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
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (("Borrower" == req.payload.type || "Employee" == req.payload.type) && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    user.comparePassword(req.body.currentPassword, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else if (isMatch) {
                            user.password = req.body.newPassword;
                            user.save((err) => {
                                if (err) {
                                    console.log(err);
                                    res
                                        .status(404)
                                        .json({
                                            "message": err._message
                                        });
                                } else {
                                    const token = user.generateJwt();
                                    res
                                        .status(200)
                                        .json({
                                            'message': 'Success! Your password has been changed.'
                                        });
                                }
                            });
                        } else {
                            res
                                .status(404)
                                .json({
                                    "message": "Invalid current password."
                                });
                        }
                    });
                }
            });
    }
};

module.exports = {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne,
    usersAuthenticate,
    usersSetPasswordToken,
    usersValidatePasswordToken,
    usersResetPassword,
    usersChangePassword
};