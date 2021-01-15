const mongoose = require('mongoose');
const Loan = mongoose.model('Loan');

const statementsList = (req, res) => {
    var sum = function (items, prop) {
        return items.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b[prop]);
        }, 0);
    };
    Loan
        .find()
        .exec((err, loans) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                var summary = {};
                summary.interestIncome = (sum(loans[0].loanPaymentSchedule, 'interest')).toFixed(2);
                return res
                    .status(200)
                    .json(summary);
            }
        });
};

module.exports = {
    statementsList
};