const e = require('express');
const mongoose = require('mongoose');
const User = mongoose.model('User');

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
        type
    } = req.body);
    user.userNum = Date.now();
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
                    "msg": "Account with that username already exists."
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

module.exports = {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne
};