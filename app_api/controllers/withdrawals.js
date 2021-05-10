const mongoose = require('mongoose');
const Withdrawal = mongoose.model('Withdrawal');

const withdrawalsList = (req, res) => {
    Withdrawal
        .find()
        .populate('requestedBy', 'profile.firstName profile.lastName type userId borrowerNum account profile.address profile.mobileNum')
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
    if (!withdrawalid) {
        res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    } else {
        Withdrawal
            .findById(withdrawalid)
            .populate('requestedBy', 'profile.firstName profile.lastName userId')
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
    if (!withdrawalid) {
        res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    } else {
        Withdrawal
            .findById(withdrawalid)
            .populate('requestedBy', 'profile.firstName profile.lastName')
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

const withdrawalsDeleteOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    if (!withdrawalid) {
        res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    } else {
        Withdrawal
            .findByIdAndRemove(withdrawalid)
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
                    res
                        .status(204)
                        .json(null);
                }
            });
    }
};

const withdrawalsListByUser = (req, res) => {
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

module.exports = {
    withdrawalsList,
    withdrawalsCreate,
    withdrawalsReadOne,
    withdrawalsUpdateOne,
    withdrawalsDeleteOne,
    withdrawalsListByUser
};