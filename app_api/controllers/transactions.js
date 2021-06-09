const mongoose = require('mongoose');
const Transaction = mongoose.model('Transaction');

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

function validTxnType(type) {
    if (type == "Repayments") return true;
    if (type == "Release") return true;
    if (type == "Withdrawals") return true;
    if (type == "Contributions") return true;
    if (type == "Fees") return true;
    if (type == "Expenses") return true;
    return false;
}

const transactionsList = (req, res) => {
    Transaction
        .find()
        .populate('borrowerId postedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum  profile.email')
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
    if (req.body.status == "Posted") transaction.postedDate = Date.now();
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
    const isValid = mongoose.Types.ObjectId.isValid(transactionid);
    if (!transactionid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid transactionid."
            });
    } else {
        Transaction
            .findById(transactionid)
            .populate('borrowerId postedBy', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum  profile.email userId')
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
                    if ("Borrower" == req.payload.type && transaction.borrowerId.userId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
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
    const isValid = mongoose.Types.ObjectId.isValid(transactionid);
    if (!transactionid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid transactionid."
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
                    transaction.senderNum = (req.body.senderNum) ? req.body.senderNum : transaction.senderNum;
                    transaction.receiverNum = (req.body.receiverNum) ? req.body.receiverNum : transaction.receiverNum;
                    transaction.referenceNo = (req.body.referenceNo) ? req.body.referenceNo : transaction.referenceNo;
                    transaction.postedBy = (req.body.postedBy) ? req.body.postedBy : transaction.postedBy;
                    transaction.postedDate = (req.body.status == "Posted") ? Date.now() : transaction.postedDate;
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
    const isValid = mongoose.Types.ObjectId.isValid(transactionid);
    if (!transactionid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid transactionid."
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

const transactionsListByBorrower = (req, res) => {
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
        Transaction
            .aggregate([{
                $match: {
                    'borrowerId': mongoose.Types.ObjectId(borrowerid)
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

const transactionsDeleteManyByBorrower = (req, res) => {
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
        Transaction
            .deleteMany({
                "borrowerId": mongoose.Types.ObjectId(borrowerid)
            })
            .exec((err, transactions) => {
                if (!transactions) {
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
    const isValid = validTxnType(type);
    if (!type || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid transaction type."
            });
    } else {
        Transaction
            .find({
                "type": type
            })
            .populate('borrowerId postedBy loanId withdrawalId', 'profile.firstName profile.lastName type borrowerNum account profile.address profile.mobileNum  profile.email loanNum purposeOfLoan withdrawalNum reason')
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
    const isValid = mongoose.Types.ObjectId.isValid(userid);
    if (!userid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
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
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
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

const transactionsDeleteManyByLoans = (req, res) => {
    const {
        loanid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(loanid);
    if (!loanid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid loanid."
            });
    } else {
        Transaction
            .deleteMany({
                "loanId": mongoose.Types.ObjectId(loanid)
            })
            .exec((err, transactions) => {
                if (!transactions) {
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

const transactionsListByWithdrawals = (req, res) => {
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
        Transaction
            .aggregate([{
                $match: {
                    'withdrawalId': mongoose.Types.ObjectId(withdrawalid)
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

const transactionsDeleteManyByWithdrawals = (req, res) => {
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
        Transaction
            .deleteMany({
                "withdrawalId": mongoose.Types.ObjectId(withdrawalid)
            })
            .exec((err, transactions) => {
                if (!transactions) {
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

const transactionsSummary = (req, res) => {
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
        Transaction
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
                        _id: {
                            type: '$type',
                            status: '$status',
                        },
                        txnCount: {
                            $sum: 1
                        },
                        txnTotal: {
                            $sum: {
                                $toDecimal: '$amount'
                            }
                        },
                    }
                },
                {
                    $group: {
                        _id: '$_id.type',
                        transactions: {
                            $push: {
                                status: '$_id.status',
                                count: '$txnCount',
                                total: '$txnTotal'
                            },
                        },
                        count: {
                            $sum: '$txnCount'
                        },
                        total: {
                            $sum: {
                                $toDecimal: '$txnTotal'
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

const transactionsTypeSummary = (req, res) => {
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
        Transaction
            .aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        },
                        status: "Posted"
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

const transactionsMonthlySummaryByType = (req, res) => {
    const {
        type,
        year
    } = req.params;
    const isValidType = validTxnType(type);
    const isValidYear = validYear(year);
    if (!type || !year || !isValidType || !isValidYear) {
        res
            .status(404)
            .json({
                "message": "Invalid year or transaction type."
            });
    } else {
        let date1 = new Date('2020-12-31');
        date1.setFullYear(parseInt(year) - 1);
        let date2 = new Date(date1);
        date2.setFullYear(parseInt(year));
        Transaction
            .aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        },
                        status: "Posted",
                        type: type
                    }
                },
                {
                    "$project": {
                        "txnMonth": {
                            "$month": "$createdAt"
                        },
                        "amount": 1
                    }
                },
                {
                    $group: {
                        _id: '$txnMonth',
                        total: {
                            $sum: {
                                $toDecimal: '$amount'
                            }
                        },
                        count: {
                            $sum: 1
                        }
                    }
                },
                {
                    $sort: {
                        _id: 1
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

const contributionsSummary = (req, res) => {
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
        Transaction
            .aggregate([{
                    $match: {
                        createdAt: {
                            $gte: new Date(date1),
                            $lt: new Date(date2)
                        },
                        status: "Posted",
                        $or: [{
                            type: 'Contributions'
                        }, {
                            type: 'Withdrawals'
                        }]
                    }
                },
                {
                    "$project": {
                        "txnMonth": {
                            "$month": "$createdAt"
                        },
                        "amount": 1,
                        "borrowerId": 1
                    }
                },
                {
                    $group: {
                        _id: {
                            borrower: '$borrowerId',
                            month: '$txnMonth',
                        },
                        txnCount: {
                            $sum: 1
                        },
                        txnTotal: {
                            $sum: {
                                $toDecimal: '$amount'
                            }
                        },
                    }
                },
                {
                    $group: {
                        _id: '$_id.borrower',
                        transactions: {
                            $push: {
                                month: '$_id.month',
                                count: '$txnCount',
                                total: '$txnTotal'
                            },
                        },
                        count: {
                            $sum: '$txnCount'
                        },
                        total: {
                            $sum: {
                                $toDecimal: '$txnTotal'
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

const contributionsListByBorrower = (req, res) => {
    const {
        borrowerid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(borrowerid);
    if (!borrowerid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Invalid borrower id."
            });
    } else {
        Transaction
            .aggregate([{
                    $match: {
                        borrowerId: mongoose.Types.ObjectId(borrowerid),
                        status: "Posted",
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

module.exports = {
    transactionsList,
    transactionsCreate,
    transactionsReadOne,
    transactionsUpdateOne,
    transactionsDeleteOne,
    transactionsListByBorrower,
    transactionsDeleteManyByBorrower,
    transactionsListByType,
    transactionsListByUser,
    transactionsListByLoans,
    transactionsDeleteManyByLoans,
    transactionsListByWithdrawals,
    transactionsDeleteManyByWithdrawals,
    transactionsSummary,
    transactionsTypeSummary,
    transactionsMonthlySummaryByType,
    contributionsSummary,
    contributionsListByBorrower
};