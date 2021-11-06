const mongoose = require('mongoose');
const Withdrawal = mongoose.model('Withdrawal');

function validYear(year) {
    const text = /^[0-9]+$/;
    if (year != 0) {
        if ((year != "") && (!text.test(year))) {
            return false;
        }
        if (year.length != 4) {
            return false;
        }
        var current_year = new Date().getFullYear();
        if ((year < 1920) || (year > current_year)) {
            return false;
        }
        return true;
    }
}

const withdrawalsList = (req, res) => {
    Withdrawal
        .find()
        .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email')
        .exec((err, withdrawals) => {
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
                    .json(withdrawals);
            }
        });
};

const withdrawalsCreate = (req, res) => {
    const withdrawal = new Withdrawal({
        amount,
        reason,
        requestBy,
        status,
        reviewedBy
    } = req.body);
    withdrawal.withdrawalNum = Date.now();
    if (req.body.reviewedBy) withdrawal.reviewedDate = Date.now();
    withdrawal.save((err) => {
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

const withdrawalsReadOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(withdrawalid);
    if (!withdrawalid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid withdrawalid."
            });
    } else {
        Withdrawal
            .findById(withdrawalid)
            .populate('requestedBy reviewedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum profile.email userId')
            .exec((err, withdrawal) => {
                if (!withdrawal) {
                    res
                        .status(404)
                        .json({
                            "message": "Withdrawals not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && withdrawal.requestedBy.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(withdrawal);
                }
            });
    }
};

const withdrawalsUpdateOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(withdrawalid);
    if (!withdrawalid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid withdrawalid."
            });
    } else {
        Withdrawal
            .findById(withdrawalid)
            .exec((err, withdrawal) => {
                if (!withdrawal) {
                    res
                        .status(404)
                        .json({
                            "message": "Withdrawals not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    withdrawal.amount = (req.body.amount) ? req.body.amount : withdrawal.amount;
                    withdrawal.reason = (req.body.reason) ? req.body.reason : withdrawal.reason;
                    withdrawal.requestBy = (req.body.requestBy) ? req.body.requestBy : withdrawal.requestBy;
                    withdrawal.status = (req.body.status) ? req.body.status : withdrawal.status;
                    withdrawal.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : withdrawal.reviewedBy;
                    withdrawal.reviewedDate = (req.body.reviewedBy) ? Date.now() : withdrawal.reviewedDate;
                    withdrawal.save((err) => {
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

const withdrawalsSoftDeleteOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(withdrawalid);
    if (!withdrawalid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid withdrawalid."
            });
    } else {
        Withdrawal
            .findById(withdrawalid)
            .exec((err, withdrawal) => {
                if (!withdrawal) {
                    res
                        .status(404)
                        .json({
                            "message": "Withdrawals not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    withdrawal.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : withdrawal.isDeleted;
                    withdrawal.save((err) => {
                        if (err) {
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
            });
    }
};

const withdrawalsListByUser = (req, res) => {
    const {
        userid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(userid);
    if (!userid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
            });
    } else {
        Withdrawal
            .aggregate([{
                $lookup: {
                    from: 'borrowers',
                    localField: 'requestedBy',
                    foreignField: '_id',
                    as: 'borrower'
                }
            }, {
                $match: {
                    'borrower.userId': mongoose.Types.ObjectId(userid),
                }
            }, {
                $project: {
                    borrower: 0
                }
            }])
            .exec((err, withdrawals) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if ("Borrower" == req.payload.type && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(withdrawals);
                }
            });
    }
};

const withdrawalsListByBorrower = (req, res) => {
    const {
        borrowerid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid borrowerid."
            });
    } else {
        Withdrawal
            .aggregate([{
                $match: {
                    'requestedBy': mongoose.Types.ObjectId(borrowerid)
                }
            }])
            .exec((err, withdrawals) => {
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
                        .json(withdrawals);
                }
            });
    }
};

const withdrawalsSoftDeleteManyByBorrower = (req, res) => {
    const {
        borrowerid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid borrowerid."
            });
    } else {
        Withdrawal
            .updateMany({
                "requestedBy": mongoose.Types.ObjectId(borrowerid)
            }, {
                $set: {
                    "isDeleted": req.body.isDeleted
                }
            })
            .exec((err, withdrawals) => {
                if (!withdrawals) {
                    res
                        .status(404)
                        .json({
                            "message": "Loan not found."
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

const withdrawalsSummary = (req, res) => {
    const {
        year
    } = req.params;
    const isValid = validYear(year);
    if (!year || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid year."
            });
    } else {
        let date1 = new Date('2020-12-31');
        date1.setFullYear(parseInt(year) - 1);
        let date2 = new Date(date1);
        date2.setFullYear(parseInt(year));
        Withdrawal
            .aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ])
            .exec((err, withdrawals) => {
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
                        .json(withdrawals);
                }
            });
    }
};

module.exports = {
    withdrawalsList,
    withdrawalsCreate,
    withdrawalsReadOne,
    withdrawalsUpdateOne,
    withdrawalsSoftDeleteOne,
    withdrawalsListByUser,
    withdrawalsListByBorrower,
    withdrawalsSoftDeleteManyByBorrower,
    withdrawalsSummary
};