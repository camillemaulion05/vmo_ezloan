const mongoose = require('mongoose');
const User = mongoose.model('User');

const isAdmin = (req, res, next) => {
    User.findById(req.payload._id).exec((err, user) => {
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
                    "message": "User not found."
                });
        } else if (err) {
            res
                .status(404)
                .json({
                    "message": err._message
                });
        } else if (user.type != "Employee" && user.type != "Admin") {
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
    let arrayPath = req.path.split('/');
    let apiPath = arrayPath[1];
    let apiPath2 = arrayPath[2];
    let method = req.method;
    let params = arrayPath[arrayPath.length - 1];
    User.findById(req.payload._id).exec((err, user) => {
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
        } else if (user.type != "Employee" && user.type != "Admin" && user.type != "Borrower") {
            res
                .status(403)
                .json({
                    "message": "You don\'t have permission to do that!"
                });
        } else {
            if (params && apiPath == 'users' && (method == 'GET' || method == "PUT")) {
                if (user.type == "Employee" || user.type == "Borrower") {
                    if (user._id != params) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                }
            }
            if (params && (apiPath == 'transactions' || apiPath == 'withdrawals' || apiPath == 'loans') && apiPath2 == 'users' && method == 'GET') {
                if (user.type == "Borrower") {
                    if (user._id != params) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                }
            }
            next();
        }
    });
};

module.exports = {
    isAdmin,
    isModerator,
    isSafe
};