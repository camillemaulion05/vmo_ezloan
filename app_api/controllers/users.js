const mongoose = require('mongoose');
const User = mongoose.model('User');

const usersList = (req, res) => {
    User
        .find()
        .exec((err, users) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
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
        isAdmin
    } = req.body);
    user.userNum = Date.now();
    //dummy
    user.passwordResetToken = "147a58e984a24e51412b1d7d8ddd5802";
    user.passwordResetExpires = Date.now() + 3600000;
    user.lastLogin = Date.now();
    user.lastFailedLogin = Date.now();
    User.findOne({
        username: req.body.username
    }, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            return res
                .status(400)
                .json({
                    "msg": "Account with that username already exists."
                });
        }
        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            return res
                .status(201)
                .json(user);
        });
    });
};

const usersReadOne = (req, res) => {
    const {
        userid
    } = req.params;
    if (!userid) {
        return res
            .status(404)
            .json({
                "message": "Not found, userid is required"
            });
    }
    User
        .findById(userid)
        .exec((err, user) => {
            if (!user) {
                return res
                    .status(404)
                    .json({
                        "message": "user not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(user);
            }
        });
};

const usersUpdateOne = (req, res) => {
    const {
        userid
    } = req.params;
    if (!userid) {
        return res
            .status(404)
            .json({
                "message": "Not found, userid is required"
            });
    }
    User.findById(userid, (err, user) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        user.username = req.body.username;
        user.password = req.body.password;
        user.passwordResetToken = req.body.passwordResetToken;
        user.passwordResetExpires = req.body.passwordResetExpires;
        user.lastLogin = req.body.lastLogin;
        user.lastFailedLogin = req.body.lastFailedLogin;
        user.status = req.body.status;
        user.isAdmin = req.body.isAdmin;
        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            res
                .status(200)
                .json(user);
        });
    });
};

const usersDeleteOne = (req, res) => {
    const {
        userid
    } = req.params;
    if (!userid) {
        return res
            .status(404)
            .json({
                "message": "Not found, userid is required"
            });
    }
    User
        .findByIdAndRemove(userid)
        .exec((err, user) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            }
            res
                .status(204)
                .json(null);
        });
};

module.exports = {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne
};