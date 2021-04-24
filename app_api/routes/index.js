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
const ctrlAdmin = require('../controllers/admins');
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
router.post('/setPassToken', ctrlUsers.usersSetPasswordToken);
router.post('/validatePassToken', ctrlUsers.usersValidatePasswordToken);
router.post('/reset', ctrlUsers.usersResetPassword);
router.post('/change/:userid', auth, middleware.isSafe, ctrlUsers.usersChangePassword);

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
    .post(auth, middleware.isModerator, ctrlEmployees.employeesCreate);

router
    .route('/employees/:employeeid')
    .get(auth, middleware.isModerator, ctrlEmployees.employeesReadOne)
    .put(auth, middleware.isModerator, ctrlEmployees.employeesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlEmployees.employeesDeleteOne);

router.post('/employees/email', ctrlEmployees.employeesGetEmailByUser);
router.get('/employees/setEmailToken/:userid', auth, middleware.isSafe, ctrlEmployees.employeesSetEmailToken);
router.post('/employees/validateEmailToken', auth, middleware.isSafe, ctrlEmployees.employeesVerifyEmailToken);

router
    .route('/employees/users/:userid')
    .get(auth, middleware.isSafe, ctrlEmployees.employeesReadOneByUser)
    .put(auth, middleware.isSafe, ctrlEmployees.employeesUpdateOneByUser);

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
    .get(auth, middleware.isModerator, ctrlTransactions.transactionsListByType);

router
    .route('/transactions/users/:userid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsListByUser);

router
    .route('/transactions/loans/:loanid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsListByLoans);

router
    .route('/transactions/summary/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.transactionsSummary);

router
    .route('/transactions/contributions/:year')
    .get(auth, middleware.isAdmin, ctrlTransactions.contributionsListByMember);

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
    .get(auth, middleware.isSafe, ctrlWithdrawals.withdrawalsListByUser);

// borrowers
router
    .route('/borrowers')
    .get(auth, middleware.isModerator, ctrlBorrowers.borrowersList)
    .post(auth, middleware.isSafe, ctrlBorrowers.borrowersCreate);

router
    .route('/borrowers/:borrowerid')
    .get(auth, middleware.isModerator, ctrlBorrowers.borrowersReadOne)
    .put(auth, middleware.isModerator, ctrlBorrowers.borrowersUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlBorrowers.borrowersDeleteOne);

router.post('/borrowers/email', ctrlBorrowers.borrowersGetEmailByUser);
router.get('/borrowers/setEmailToken/:userid', auth, middleware.isSafe, ctrlBorrowers.borrowersSetEmailToken);
router.post('/borrowers/validateEmailToken', auth, middleware.isSafe, ctrlBorrowers.borrowersVerifyEmailToken);

router
    .route('/borrowers/users/:userid')
    .get(auth, middleware.isSafe, ctrlBorrowers.borrowersReadOneByUser)
    .put(auth, middleware.isSafe, ctrlBorrowers.borrowersUpdateOneByUser);

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
    .get(auth, middleware.isSafe, ctrlLoans.loansListByUser);

router
    .route('/loans/:loanid/schedules')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesList)
    .put(auth, middleware.isModerator, ctrlLoans.loansSchedulesUpdate);

router
    .route('/loans/:loanid/schedules/:scheduleid')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesReadOne);

router
    .route('/loans/:loanid/due')
    .get(auth, middleware.isSafe, ctrlLoans.loansDueListByLoan);

router
    .route('/loans/:loanid/pastDue')
    .get(auth, middleware.isSafe, ctrlLoans.loansPastDueListByLoan);

router
    .route('/loans/due/repayments')
    .get(auth, middleware.isAdmin, ctrlLoans.loansDueRepaymentsList);

router
    .route('/loans/summary/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansSummary);

router
    .route('/loans/report/:year')
    .get(auth, middleware.isAdmin, ctrlLoans.loansInterestReport);

// admin
router
    .route('/admins')
    .get(auth, middleware.isAdmin, ctrlAdmin.adminsList)
    .post(auth, middleware.isAdmin, ctrlAdmin.adminsCreate);

router
    .route('/admins/:adminid')
    .get(auth, middleware.isModerator, ctrlAdmin.adminsReadOne)
    .put(auth, middleware.isModerator, ctrlAdmin.adminsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlAdmin.adminsDeleteOne);

router.post('/admins/email', ctrlAdmin.adminsGetEmailByUser);
router.get('/admins/setEmailToken/:userid', auth, middleware.isSafe, ctrlAdmin.adminsSetEmailToken);
router.post('/admins/validateEmailToken', auth, middleware.isSafe, ctrlAdmin.adminsVerifyEmailToken);

router
    .route('/admins/users/:userid')
    .get(auth, middleware.isSafe, ctrlAdmin.adminsReadOneByUser)
    .put(auth, middleware.isSafe, ctrlAdmin.adminsUpdateOneByUser);

module.exports = router;