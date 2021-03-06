const mongoose = require('mongoose');
const User = mongoose.model('User');

const isAdmin = (req, res, next) => {
    User.findById(req.payload._id).exec((err, user) => {
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
        } else if (user.type != "Admin") {
            res
                .status(403)
                .json({
                    "message": "Require Admin Role!"
                });
        } else {
            next();
        }
    });
};

const isModerator = (req, res, next) => {
    User.findById(req.payload._id).exec((err, user) => {
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
        } else if (user.type != "Employee" || user.type != "Admin") {
            res
                .status(403)
                .json({
                    "message": "Require Moderator Role!"
                });
        } else {
            next();
        }
    });
};

const isSafe = (req, res, next) => {
    User.findById(req.payload._id).exec((err, user) => {
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
        } else if (user.type != "Employee" || user.type != "Admin" || user.type != "Borrower") {
            res
                .status(403)
                .json({
                    "message": "You don\'t have permission to do that!"
                });
        } else {
            next();
        }
    });
};

module.exports = {
    isAdmin,
    isModerator,
    isSafe
};