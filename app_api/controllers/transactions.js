const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

const transactionsList = (req, res) => {
    Transaction
        .find()
        .exec((err, transactions) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(transactions);
            }
        });
};

const transactionsCreate = (req, res) => {
    const transaction = new Transaction({
        amount,
        type,
        message,
        senderNum,
        receiverNum,
        referenceNo,
        postedBy,
        status,
        transferredBy,
        loanId,
        withdrawalId
    } = req.body);
    transaction.transactionNum = Date.now();
    if (req.body.postedBy) transaction.postedDate = Date.now();
    transaction.save((err) => {
        if (err) {
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(transaction);
        }
    });
};

const transactionsReadOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    } else {
        Transaction
            .findById(transactionid)
            .exec((err, transaction) => {
                if (!transaction) {
                    res
                        .status(404)
                        .json({
                            "message": "transaction not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(transaction);
                }
            });
    }
};

const transactionsUpdateOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    } else {
        Transaction
            .findById(transactionid)
            .exec((err, transaction) => {
                if (!transaction) {
                    res
                        .status(404)
                        .json({
                            "message": "transactionid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    transaction.amount = (req.body.amount) ? req.body.amount : transaction.amount;
                    transaction.type = (req.body.type) ? req.body.type : transaction.type;
                    transaction.message = (req.body.message) ? req.body.message : transaction.message;
                    transaction.senderNum = (req.body.senderNum) ? req.body.senderNum : transaction.senderNum;
                    transaction.receiverNum = (req.body.receiverNum) ? req.body.receiverNum : transaction.receiverNum;
                    transaction.referenceNo = (req.body.referenceNo) ? req.body.referenceNo : transaction.referenceNo;
                    transaction.postedBy = (req.body.postedBy) ? req.body.postedBy : transaction.postedBy;
                    transaction.postedDate = (!req.body.postedBy || transaction.postedDate) ? transaction.postedDate : Date.now();
                    transaction.status = (req.body.status) ? req.body.status : transaction.status;
                    transaction.transferredBy = (req.body.transferredBy) ? req.body.transferredBy : transaction.transferredBy;
                    transaction.loanId = (req.body.loanId) ? req.body.loanId : transaction.loanId;
                    transaction.withdrawalId = (req.body.withdrawalId) ? req.body.withdrawalId : transaction.withdrawalId;
                    transaction.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json(err);
                        } else {
                            res
                                .status(200)
                                .json(transaction);
                        }
                    });
                }
            });
    }
};

const transactionsDeleteOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    } else {
        Transaction
            .findByIdAndRemove(transactionid)
            .exec((err, transaction) => {
                if (!transaction) {
                    res
                        .status(404)
                        .json({
                            "message": "transaction not found"
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
    transactionsList,
    transactionsCreate,
    transactionsReadOne,
    transactionsUpdateOne,
    transactionsDeleteOne
};