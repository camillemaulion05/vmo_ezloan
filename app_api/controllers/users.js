import {
    model
} from 'mongoose';
const User = model('User');

const usersList = (req, res) => {
    User
        .find({}, {
            "password": 0,
            "passwordResetToken": 0,
            "passwordResetExpires": 0
        })
        .exec((err, users) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
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
        security
    } = req.body);
    user.userNum = Date.now();
    if (req.body.security) user.encryptSecurityAnswer();
    User.findOne({
        username: req.body.username
    }, (err, existingUser) => {
        if (err) {
            res
                .status(404)
                .json(err);
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
                        .json(err);
                } else {
                    res
                        .status(201)
                        .json(user);
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
                            "message": "user not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
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
                        "message": "user not found"
                    });
            } else if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
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
                user.save((err) => {
                    if (err) {
                        res
                            .status(400)
                            .json(err);
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
                            "message": "user not found"
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

const usersAuthenticate = (req, res) => {
    User.findOne({
            username: req.body.username
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found"
                    });
            } else {
                user.comparePassword(req.body.password, (err, isMatch) => {
                    if (err) {
                        res
                            .status(404)
                            .json(err);
                    } else if (isMatch) {
                        const token = user.generateJwt();
                        res
                            .status(200)
                            .json({
                                token
                            });
                    } else {
                        res
                            .status(401)
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
            "email": req.body.email,
            "security.question": req.body.security.question
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found"
                    });
            } else {
                user.compareSecurityAnswer(req.body.security, (err, isMatch) => {
                    if (err) {
                        res
                            .status(404)
                            .json(err);
                    } else if (isMatch) {
                        user.setPasswordRandomToken();
                        user.save((err) => {
                            if (err) {
                                res
                                    .status(400)
                                    .json(err);
                            } else {
                                res
                                    .status(200)
                                    .json({
                                        'token': user.passwordResetToken
                                    });
                            }
                        });
                    } else {
                        res
                            .status(401)
                            .json({
                                "message": "Invalid email or answer to your security question."
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
                    .json(err);
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found"
                    });
            } else {
                user.setEmailRandomToken();
                user.save((err) => {
                    if (err) {
                        res
                            .status(400)
                            .json(err);
                    } else {
                        res
                            .status(200)
                            .json({
                                'token': user.emailVerificationToken
                            });
                    }
                });
            }
        });
};

const usersResetPassword = (req, res) => {
    User.findOne({
            "passwordResetToken": req.body.token
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found"
                    });
            } else {
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                user.save((err) => {
                    if (err) {
                        res
                            .status(400)
                            .json(err);
                    } else {
                        res
                            .status(200)
                            .json({
                                'message': 'Success! Your password has been changed.'
                            });
                    }
                });
            }
        });
};

const usersVerifyEmailToken = (req, res) => {
    User.findOne({
            "email": req.body.email,
            "emailVerificationToken": req.body.token
        })
        .exec((err, user) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else if (!user) {
                res
                    .status(404)
                    .json({
                        "message": "User not found"
                    });
            } else {
                user.emailVerificationToken = '';
                user.emailVerified = true;
                user.save((err) => {
                    if (err) {
                        res
                            .status(400)
                            .json(err);
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

export default {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne,
    usersAuthenticate,
    usersSetPasswordToken,
    usersSetEmailToken,
    usersResetPassword,
    usersVerifyEmailToken
};