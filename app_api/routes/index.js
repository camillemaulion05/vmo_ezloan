const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlInquiries = require('../controllers/inquiries');
const ctrlEmployees = require('../controllers/employees');
const ctrlTransactions = require('../controllers/transactions');
const ctrlWithdrawals = require('../controllers/withdrawals');
const ctrlBorrowers = require('../controllers/borrowers');
const ctrlLoans = require('../controllers/loans');
const ctrlStatements = require('../controllers/statements');

router.get('/', ctrlHome.index);

// users
router
    .route('/users')
    .get(ctrlUsers.usersList)
    .post(ctrlUsers.usersCreate);

router
    .route('/users/:userid')
    .get(ctrlUsers.usersReadOne)
    .put(ctrlUsers.usersUpdateOne)
    .delete(ctrlUsers.usersDeleteOne);

// inquiries
router
    .route('/inquiries')
    .get(ctrlInquiries.inquiriesList)
    .post(ctrlInquiries.inquiriesCreate);

router
    .route('/inquiries/:inquiryid')
    .get(ctrlInquiries.inquiriesReadOne)
    .put(ctrlInquiries.inquiriesResponse)
    .delete(ctrlInquiries.inquiriesDeleteOne);

// employees
router
    .route('/employees')
    .get(ctrlEmployees.employeesList)
    .post(ctrlEmployees.employeesCreate);

router
    .route('/employees/:employeeid')
    .get(ctrlEmployees.employeesReadOne)
    .put(ctrlEmployees.employeesUpdateOne)
    .delete(ctrlEmployees.employeesDeleteOne);

// transactions
router
    .route('/transactions')
    .get(ctrlTransactions.transactionsList)
    .post(ctrlTransactions.transactionsCreate);

router
    .route('/transactions/:transactionid')
    .get(ctrlTransactions.transactionsReadOne)
    .put(ctrlTransactions.transactionsUpdateOne)
    .delete(ctrlTransactions.transactionsDeleteOne);

// withdrawals
router
    .route('/withdrawals')
    .get(ctrlWithdrawals.withdrawalsList)
    .post(ctrlWithdrawals.withdrawalsCreate);

router
    .route('/withdrawals/:withdrawalid')
    .get(ctrlWithdrawals.withdrawalsReadOne)
    .put(ctrlWithdrawals.withdrawalsUpdateOne)
    .delete(ctrlWithdrawals.withdrawalsDeleteOne);

router
    .route('/withdrawals/:withdrawalid/status')
    .put(ctrlWithdrawals.withdrawalsUpdateStatus);

// borrowers
router
    .route('/borrowers')
    .get(ctrlBorrowers.borrowersList)
    .post(ctrlBorrowers.borrowersCreate);

router
    .route('/borrowers/:borrowerid')
    .get(ctrlBorrowers.borrowersReadOne)
    .put(ctrlBorrowers.borrowersUpdateOne)
    .delete(ctrlBorrowers.borrowersDeleteOne);

router
    .route('/borrowers/:borrowerid/status')
    .put(ctrlBorrowers.borrowersUpdateStatus);

router
    .route('/borrowers/:borrowerid/contributions')
    .put(ctrlBorrowers.borrowersAddContributions);

router
    .route('/borrowers/:borrowerid/loanableAmount')
    .put(ctrlBorrowers.borrowersUpdateLoanableAmount);

// loans
router
    .route('/loans')
    .get(ctrlLoans.loansList)
    .post(ctrlLoans.loansCreate);

router
    .route('/loans/:loanid')
    .get(ctrlLoans.loansReadOne)
    .put(ctrlLoans.loansUpdateOne)
    .delete(ctrlLoans.loansDeleteOne);

router
    .route('/loans/:loanid/status')
    .put(ctrlLoans.loansUpdateStatus);

router
    .route('/loans/:loanid/repayment')
    .put(ctrlLoans.loansAddRepayment);

// financial statements
router
    .route('/statements')
    .get(ctrlStatements.statementsList);

module.exports = router;