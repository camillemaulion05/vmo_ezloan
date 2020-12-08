const mongoose = require('mongoose');
const Withdrawal = mongoose.model('Withdrawal');

const withdrawalsList = (req, res) => {
    Withdrawal
        .find()
        .exec((err, withdrawals) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(withdrawals);
            }
        });
};

const withdrawalsCreate = (req, res) => {
    const withdrawal = new Withdrawal({
        amount,
        reason
    } = req.body);
    withdrawal.withdrawalNum = Date.now();
    withdrawal.compute(req.body.amount);
    withdrawal.save((err) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(withdrawal);
    });
};

const withdrawalsReadOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    if (!withdrawalid) {
        return res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    }
    Withdrawal
        .findById(withdrawalid)
        .exec((err, withdrawal) => {
            if (!withdrawal) {
                return res
                    .status(404)
                    .json({
                        "message": "withdrawal not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(withdrawal);
            }
        });
};

const withdrawalsUpdateOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    if (!withdrawalid) {
        return res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    }
    Withdrawal
        .findById(withdrawalid)
        .exec((err, withdrawal) => {
            if (!withdrawal) {
                return res
                    .status(404)
                    .json({
                        "message": "withdrawalid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            withdrawal.status = req.body.status;
            withdrawal.approvedBy = req.body.approvedBy;
            withdrawal.transactionId = req.body.transactionId;
            withdrawal.approvedDate = Date.now();
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
        });
};

const withdrawalsDeleteOne = (req, res) => {
    const {
        withdrawalid
    } = req.params;
    if (!withdrawalid) {
        return res
            .status(404)
            .json({
                "message": "Not found, withdrawalid is required"
            });
    }
    Withdrawal
        .findByIdAndRemove(withdrawalid)
        .exec((err, withdrawal) => {
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
    withdrawalsList,
    withdrawalsCreate,
    withdrawalsReadOne,
    withdrawalsUpdateOne,
    withdrawalsDeleteOne
};