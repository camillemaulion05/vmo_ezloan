const mongoose = require('mongoose');
const Withdrawal = mongoose.model('Withdrawal');

const withdrawalsList = (req, res) => {
    Withdrawal
        .find({}, {
            "reviewedBy": 0,
            "reviewedDate": 0
        })
        .populate('requestedBy', 'profile.firstName profile.lastName')
        .exec((err, withdrawals) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
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
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(withdrawal);
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
            .populate('requestedBy', 'profile.firstName profile.lastName')
            .exec((err, withdrawal) => {
                if (!withdrawal) {
                    res
                        .status(404)
                        .json({
                            "message": "withdrawal not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
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
                            "message": "withdrawalid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    withdrawal.amount = (req.body.amount) ? req.body.amount : withdrawal.amount;
                    withdrawal.reason = (req.body.reason) ? req.body.reason : withdrawal.reason;
                    withdrawal.requestBy = (req.body.requestBy) ? req.body.requestBy : withdrawal.requestBy;
                    withdrawal.status = (req.body.status) ? req.body.status : withdrawal.status;
                    withdrawal.reviewedBy = (req.body.reviewedBy) ? req.body.reviewedBy : withdrawal.reviewedBy;
                    withdrawal.reviewedDate = (!req.body.reviewedBy || withdrawal.reviewedDate) ? withdrawal.reviewedDate : Date.now();
                    withdrawal.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json(err);
                        } else {
                            res
                                .status(200)
                                .json(withdrawal);
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
                            "message": "withdrawal not found"
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
    withdrawalsList,
    withdrawalsCreate,
    withdrawalsReadOne,
    withdrawalsUpdateOne,
    withdrawalsDeleteOne
};