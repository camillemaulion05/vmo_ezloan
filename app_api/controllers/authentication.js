const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = (req, res) => {
    const user = new User({
        username,
        password,
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
                        .status(200)
                        .json({
                            "message": "User was registered successfully!"
                        });
                }
            });
        }
    });
};

const login = (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res
                .status(404)
                .json(err);
        }
        if (user) {
            const token = user.generateJwt();
            res
                .status(200)
                .json({
                    token
                });
        } else {
            res
                .status(401)
                .json(info);
        }
    })(req, res);
};

module.exports = {
    register,
    login
};