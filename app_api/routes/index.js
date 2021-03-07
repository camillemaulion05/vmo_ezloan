// Connect to MongoDB.
require('../models/db');

const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['sha1', 'RS256', 'HS256']
})
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlInquiries = require('../controllers/inquiries');
const ctrlEmployees = require('../controllers/employees');
const ctrlTransactions = require('../controllers/transactions');
const ctrlWithdrawals = require('../controllers/withdrawals');
const ctrlBorrowers = require('../controllers/borrowers');
const ctrlLoans = require('../controllers/loans');
const middleware = require('../middlewares/authorization');

router.get('/', ctrlHome.index);
router.post('/encrypt', ctrlHome.encrypt);
router.post('/decrypt', ctrlHome.decrypt);

// users
router
    .route('/users')
    .get(auth, middleware.isAdmin, ctrlUsers.usersList)
    .post(ctrlUsers.usersCreate);

router
    .route('/users/:userid')
    .get(auth, middleware.isSafe, ctrlUsers.usersReadOne)
    .put(auth, middleware.isSafe, ctrlUsers.usersUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlUsers.usersDeleteOne);

router.post('/login', ctrlUsers.usersAuthenticate);

// inquiries
router
    .route('/inquiries')
    .get(auth, middleware.isAdmin, ctrlInquiries.inquiriesList)
    .post(ctrlInquiries.inquiriesCreate);

router
    .route('/inquiries/:inquiryid')
    .get(auth, middleware.isAdmin, ctrlInquiries.inquiriesReadOne)
    .put(auth, middleware.isAdmin, ctrlInquiries.inquiriesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlInquiries.inquiriesDeleteOne);

// employees
router
    .route('/employees')
    .get(auth, middleware.isSafe, ctrlEmployees.employeesList)
    .post(auth, middleware.isAdmin, ctrlEmployees.employeesCreate);

router
    .route('/employees/:employeeid')
    .get(auth, middleware.isSafe, ctrlEmployees.employeesReadOne)
    .put(auth, middleware.isModerator, ctrlEmployees.employeesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlEmployees.employeesDeleteOne);

// transactions
router
    .route('/transactions')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsList)
    .post(auth, middleware.isSafe, ctrlTransactions.transactionsCreate);

router
    .route('/transactions/:transactionid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsReadOne)
    .put(auth, middleware.isSafe, ctrlTransactions.transactionsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlTransactions.transactionsDeleteOne);

router
    .route('/transactions/type/:type')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsPerType);

router
    .route('/transactions/borrower/:borrowerid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsPerBorrower);

router
    .route('/transactions/summary/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.transactionsSummary);

router
    .route('/transactions/contributions/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.contributionsPerMember);

// withdrawals
router
    .route('/withdrawals')
    .get(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsList)
    .post(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsCreate);

router
    .route('/withdrawals/:withdrawalid')
    .get(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsReadOne)
    .put(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlWithdrawals.withdrawalsDeleteOne);

// borrowers
router
    .route('/borrowers')
    .get(auth, middleware.isSafe, ctrlBorrowers.borrowersList)
    .post(auth, middleware.isSafe, ctrlBorrowers.borrowersCreate);

router
    .route('/borrowers/:borrowerid')
    .get(auth, middleware.isSafe, ctrlBorrowers.borrowersReadOne)
    .put(auth, middleware.isSafe, ctrlBorrowers.borrowersUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlBorrowers.borrowersDeleteOne);

// loans
router
    .route('/loans')
    .get(auth, middleware.isSafe, ctrlLoans.loansList)
    .post(auth, middleware.isSafe, ctrlLoans.loansCreate);

router
    .route('/loans/:loanid')
    .get(auth, middleware.isSafe, ctrlLoans.loansReadOne)
    .put(auth, middleware.isSafe, ctrlLoans.loansUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlLoans.loansDeleteOne);

router
    .route('/loans/:loanid/schedules')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesList)
    .put(auth, middleware.isSafe, ctrlLoans.loansSchedulesUpdate);

router
    .route('/loans/:loanid/schedules/:scheduleid')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesReadOne);

router
    .route('/loans/:loanid/due')
    .get(auth, middleware.isSafe, ctrlLoans.loansRepaymentsDue);

router
    .route('/loans/summary/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansSummary);

router
    .route('/loans/report/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansInterestReport);

module.exports = router;