const mongoose = require('mongoose');
const User = mongoose.model('User');

const usersList = (req, res, next) => {
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

const usersCreate = (req, res, next) => {
    if (!req.body.username || !req.body.password) {
        return res
            .status(400)
            .json({
                "msg": "All fields required"
            });
    }

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

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
        user.save((err, newUser) => {
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

const usersReadOne = (req, res, next) => {
    const {
        userid
    } = req.params;
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

const usersUpdateOne = (req, res, next) => {
    const {
        userid
    } = req.params;
    User.findById(userid, (err, user) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        user.password = req.body.password;
        user.save((err) => {
            if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            res
                .status(200)
                .json({
                    msg: 'Password has been changed.'
                });
        });
    });
};

const usersDeleteOne = (req, res, next) => {
    const {
        userid
    } = req.params;
    if (userid) {
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
    } else {
        res
            .status(404)
            .json({
                "message": "No User"
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