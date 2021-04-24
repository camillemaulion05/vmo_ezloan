const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

const transactionsList = (req, res) => {
    Transaction
        .find()
        .exec((err, transactions) => {
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
                    .json(transactions);
            }
        });
};

const transactionsCreate = (req, res) => {
    const transaction = new Transaction({
        amount,
        type,
        message,
        method,
        senderNum,
        receiverNum,
        referenceNo,
        postedBy,
        status,
        borrowerId,
        loanId,
        withdrawalId
    } = req.body);
    transaction.transactionNum = Date.now();
    if (req.body.postedBy) transaction.postedDate = Date.now();
    transaction.save((err) => {
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
                            "message": "Transaction not found."
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
                            "message": "Transaction not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    transaction.amount = (req.body.amount) ? req.body.amount : transaction.amount;
                    transaction.type = (req.body.type) ? req.body.type : transaction.type;
                    transaction.message = (req.body.message) ? req.body.message : transaction.message;
                    transaction.method = (req.body.method) ? req.body.method : transaction.method;
                    transaction.senderNum = (req.body.senderNum) ? req.body.senderNum : transaction.senderNum;
                    transaction.receiverNum = (req.body.receiverNum) ? req.body.receiverNum : transaction.receiverNum;
                    transaction.referenceNo = (req.body.referenceNo) ? req.body.referenceNo : transaction.referenceNo;
                    transaction.postedBy = (req.body.postedBy) ? req.body.postedBy : transaction.postedBy;
                    transaction.postedDate = (req.body.postedBy) ? Date.now() : transaction.postedDate;
                    transaction.status = (req.body.status) ? req.body.status : transaction.status;
                    transaction.borrowerId = (req.body.borrowerId) ? req.body.borrowerId : transaction.borrowerId;
                    transaction.loanId = (req.body.loanId) ? req.body.loanId : transaction.loanId;
                    transaction.withdrawalId = (req.body.withdrawalId) ? req.body.withdrawalId : transaction.withdrawalId;
                    transaction.save((err) => {
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
                            "message": "Transaction not found."
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

const transactionsListByType = (req, res) => {
    const {
        type
    } = req.params;
    if (!type) {
        res
            .status(404)
            .json({
                "message": "Not found, type is required"
            });
    } else {
        Transaction
            .find({
                "type": type
            })
            .exec((err, transactions) => {
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
                        .json(transactions);
                }
            });
    }
};

const transactionsListByUser = (req, res) => {
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
        Transaction
            .aggregate([{
                $lookup: {
                    from: 'borrowers',
                    localField: 'borrowerId',
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
            .exec((err, transactions) => {
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
                        .json(transactions);
                }
            });
    }
};

const transactionsListByLoans = (req, res) => {
    const {
        loanid
    } = req.params;
    if (!loanid) {
        res
            .status(404)
            .json({
                "message": "Not found, loanid is required"
            });
    } else {
        Transaction
            .aggregate([{
                $match: {
                    'loanId': mongoose.Types.ObjectId(loanid)
                }
            }])
            .exec((err, transactions) => {
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
                        .json(transactions);
                }
            });
    }
};

const transactionsSummary = (req, res) => {
    const {
        year
    } = req.params;
    if (!year) {
        res
            .status(404)
            .json({
                "message": "Not found, year is required"
            });
    } else {
        let date1 = new Date('2020-01-01');
        date1.setFullYear(year);
        let date2 = new Date(date1);
        date2.setFullYear(year + 1);
        Transaction
            .aggregate([{
                    $match: {
                        postedDate: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        total: {
                            $sum: {
                                $toDecimal: '$amount'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                }
            ])
            .exec((err, transactions) => {
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
                        .json(transactions);
                }
            });
    }
};

const contributionsListByMember = (req, res) => {
    const {
        year
    } = req.params;
    if (!year) {
        res
            .status(404)
            .json({
                "message": "Not found, year is required"
            });
    } else {
        let date1 = new Date('2020-01-01');
        date1.setFullYear(year);
        let date2 = new Date(date1);
        date2.setFullYear(year + 1);
        Transaction
            .aggregate([{
                    $match: {
                        postedDate: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        },
                        $or: [{
                            type: 'Contributions'
                        }, {
                            type: 'Withdrawals'
                        }]
                    }
                },
                {
                    $group: {
                        _id: '$borrowerId',
                        shares: {
                            $sum: {
                                $toDecimal: '$amount'
                            }
                        }
                    }
                }
            ])
            .exec((err, transactions) => {
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
                        .json(transactions);
                }
            });
    }
};

module.exports = {
    transactionsList,
    transactionsCreate,
    transactionsReadOne,
    transactionsUpdateOne,
    transactionsDeleteOne,
    transactionsListByType,
    transactionsListByUser,
    transactionsListByLoans,
    transactionsSummary,
    contributionsListByMember
};