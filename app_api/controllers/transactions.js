const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

const transactionsList = (req, res) => {
    Transaction
        .find()
        .exec((err, transactions) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
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
        postedBy
    } = req.body);
    transaction.transactionNum = Date.now();
    transaction.postedDate = Date.now();
    transaction.save((err) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(transaction);
    });
};

const transactionsReadOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        return res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    }
    Transaction
        .findById(transactionid)
        .exec((err, transaction) => {
            if (!transaction) {
                return res
                    .status(404)
                    .json({
                        "message": "transaction not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(transaction);
            }
        });
};

const transactionsUpdateOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        return res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    }
    Transaction
        .findById(transactionid)
        .exec((err, transaction) => {
            if (!transaction) {
                return res
                    .status(404)
                    .json({
                        "message": "transactionid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            transaction.amount = req.body.amount;
            transaction.type = req.body.type;
            transaction.message = req.body.message;
            transaction.senderNum = req.body.senderNum;
            transaction.receiverNum = req.body.receiverNum;
            transaction.referenceNo = req.body.referenceNo;
            transaction.postedBy = req.body.postedBy;
            transaction.postedDate = Date.now();
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
        });
};

const transactionsDeleteOne = (req, res) => {
    const {
        transactionid
    } = req.params;
    if (!transactionid) {
        return res
            .status(404)
            .json({
                "message": "Not found, transactionid is required"
            });
    }
    Transaction
        .findByIdAndRemove(transactionid)
        .exec((err, transaction) => {
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
    transactionsList,
    transactionsCreate,
    transactionsReadOne,
    transactionsUpdateOne,
    transactionsDeleteOne
};