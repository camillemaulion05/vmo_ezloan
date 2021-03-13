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
router.post('/client/encrypt', ctrlHome.clientEncrypt);
router.post('/client/decrypt', ctrlHome.clientDecrypt);
router.post('/server/encrypt', ctrlHome.serverEncrypt);
router.post('/server/decrypt', ctrlHome.serverDecrypt);
router.post('/sendOTP', ctrlHome.sendOTP);
router.post('/validateOTP', ctrlHome.validateOTP);
router.post('/sendMail', ctrlHome.sendMail);

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
router.post('/passToken', ctrlUsers.usersSetPasswordToken);
router.post('/validatePassToken', ctrlUsers.usersValidatePasswordToken);
router.post('/emailToken', ctrlUsers.usersSetEmailToken);
router.post('/reset', ctrlUsers.usersResetPassword);
router.post('/validateEmailToken', ctrlUsers.usersVerifyEmailToken);

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
    .get(auth, middleware.isAdmin, ctrlEmployees.employeesList)
    .post(auth, middleware.isAdmin, ctrlEmployees.employeesCreate);

router
    .route('/employees/:employeeid')
    .get(auth, middleware.isModerator, ctrlEmployees.employeesReadOne)
    .put(auth, middleware.isModerator, ctrlEmployees.employeesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlEmployees.employeesDeleteOne);

// transactions
router
    .route('/transactions')
    .get(auth, middleware.isModerator, ctrlTransactions.transactionsList)
    .post(auth, middleware.isSafe, ctrlTransactions.transactionsCreate);

router
    .route('/transactions/:transactionid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsReadOne)
    .put(auth, middleware.isModerator, ctrlTransactions.transactionsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlTransactions.transactionsDeleteOne);

router
    .route('/transactions/type/:type')
    .get(auth, middleware.isModerator, ctrlTransactions.transactionsPerType);

router
    .route('/transactions/users/:userid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsPerUser);

router
    .route('/transactions/summary/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.transactionsSummary);

router
    .route('/transactions/contributions/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.contributionsPerMember);

// withdrawals
router
    .route('/withdrawals')
    .get(auth, middleware.isModerator, ctrlWithdrawals.withdrawalsList)
    .post(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsCreate);

router
    .route('/withdrawals/:withdrawalid')
    .get(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsReadOne)
    .put(auth, middleware.isModerator, ctrlWithdrawals.withdrawalsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlWithdrawals.withdrawalsDeleteOne);

router
    .route('/withdrawals/users/:userid')
    .get(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsPerUser);

// borrowers
router
    .route('/borrowers')
    .get(auth, middleware.isModerator, ctrlBorrowers.borrowersList)
    .post(auth, middleware.isSafe, ctrlBorrowers.borrowersCreate);

router
    .route('/borrowers/:borrowerid')
    .get(auth, middleware.isSafe, ctrlBorrowers.borrowersReadOne)
    .put(auth, middleware.isSafe, ctrlBorrowers.borrowersUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlBorrowers.borrowersDeleteOne);

// loans
router
    .route('/loans')
    .get(auth, middleware.isModerator, ctrlLoans.loansList)
    .post(auth, middleware.isSafe, ctrlLoans.loansCreate);

router
    .route('/loans/:loanid')
    .get(auth, middleware.isSafe, ctrlLoans.loansReadOne)
    .put(auth, middleware.isModerator, ctrlLoans.loansUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlLoans.loansDeleteOne);

router
    .route('/loans/users/:userid')
    .get(auth, middleware.isSafe, ctrlLoans.loansPerUser);

router
    .route('/loans/:loanid/schedules')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesList)
    .put(auth, middleware.isModerator, ctrlLoans.loansSchedulesUpdate);

router
    .route('/loans/:loanid/schedules/:scheduleid')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesReadOne);

router
    .route('/loans/:loanid/due')
    .get(auth, middleware.isSafe, ctrlLoans.loansDuePerLoan);

router
    .route('/loans/due/repayments')
    .get(auth, middleware.isAdmin, ctrlLoans.loansDueRepayments);

router
    .route('/loans/summary/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansSummary);

router
    .route('/loans/report/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansInterestReport);

module.exports = router;