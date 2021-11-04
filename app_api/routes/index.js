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
const ctrlActivity = require('../controllers/activities');
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
    .post(ctrlUsers.usersCreate)
    .delete(auth, middleware.isSafe, ctrlUsers.usersDeleteOne);

router
    .route('/users/:userid')
    .get(auth, middleware.isSafe, ctrlUsers.usersReadOne)
    .put(auth, middleware.isSafe, ctrlUsers.usersUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlUsers.usersSoftDeleteOne);

router.post('/login/:type', ctrlUsers.usersAuthenticate);
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
router.get('/employees/account', ctrlEmployees.employeesAccountList);

router
    .route('/employees')
    .get(auth, middleware.isSafe, ctrlEmployees.employeesList)
    .post(auth, middleware.isModerator, ctrlEmployees.employeesCreate);

router
    .route('/employees/:employeeid')
    .get(auth, middleware.isSafe, ctrlEmployees.employeesReadOne)
    .put(auth, middleware.isModerator, ctrlEmployees.employeesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlEmployees.employeesDeleteOne);

router.post('/employees/email', ctrlEmployees.employeesGetEmailByUser);
router.get('/employees/setEmailToken/:userid', auth, middleware.isModerator, ctrlEmployees.employeesSetEmailToken);
router.post('/employees/validateEmailToken', auth, middleware.isModerator, ctrlEmployees.employeesVerifyEmailToken);

router
    .route('/employees/users/:userid')
    .get(auth, middleware.isModerator, ctrlEmployees.employeesReadOneByUser)
    .put(auth, middleware.isModerator, ctrlEmployees.employeesUpdateOneByUser);

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
    .route('/transactions/borrowers/:borrowerid')
    .get(auth, middleware.isModerator, ctrlTransactions.transactionsListByBorrower)
    .delete(auth, middleware.isAdmin, ctrlTransactions.transactionsDeleteManyByBorrower);

router.get('/transactions/borrowers/:borrowerid/contributions', auth, middleware.isSafe, ctrlTransactions.contributionsListByBorrower);
router.get('/transactions/type/:type', auth, middleware.isModerator, ctrlTransactions.transactionsListByType);
router.get('/transactions/users/:userid', auth, middleware.isSafe, ctrlTransactions.transactionsListByUser);

router
    .route('/transactions/loans/:loanid')
    .get(auth, middleware.isSafe, ctrlTransactions.transactionsListByLoans)
    .delete(auth, middleware.isAdmin, ctrlTransactions.transactionsDeleteManyByLoans);

router
    .route('/transactions/withdrawals/:withdrawalid')
    .get(auth, middleware.isModerator, ctrlTransactions.transactionsListByWithdrawals)
    .delete(auth, middleware.isAdmin, ctrlTransactions.transactionsDeleteManyByWithdrawals);

router.get('/transactions/summary/:year', auth, middleware.isModerator, ctrlTransactions.transactionsSummary);
router.get('/transactions/summary/type/:year', auth, middleware.isModerator, ctrlTransactions.transactionsTypeSummary);
router.get('/transactions/summary/type/:type/:year', auth, middleware.isModerator, ctrlTransactions.transactionsMonthlySummaryByType);
router.get('/transactions/contributions/:year', auth, middleware.isModerator, ctrlTransactions.contributionsSummary);

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

router.get('/withdrawals/users/:userid', auth, middleware.isSafe, ctrlWithdrawals.withdrawalsListByUser);
router.get('/withdrawals/summary/:year', auth, middleware.isModerator, ctrlWithdrawals.withdrawalsSummary);
router
    .route('/withdrawals/borrowers/:borrowerid')
    .get(auth, middleware.isModerator, ctrlWithdrawals.withdrawalsListByBorrower)
    .delete(auth, middleware.isAdmin, ctrlWithdrawals.withdrawalsDeleteManyByBorrower);

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

router.post('/borrowers/email', ctrlBorrowers.borrowersGetEmailByUser);
router.get('/borrowers/setEmailToken/:userid', auth, middleware.isSafe, ctrlBorrowers.borrowersSetEmailToken);
router.post('/borrowers/validateEmailToken', auth, middleware.isSafe, ctrlBorrowers.borrowersVerifyEmailToken);

router
    .route('/borrowers/users/:userid')
    .get(auth, middleware.isSafe, ctrlBorrowers.borrowersReadOneByUser)
    .put(auth, middleware.isSafe, ctrlBorrowers.borrowersUpdateOneByUser);

router.get('/borrowers/type/:type', auth, middleware.isModerator, ctrlBorrowers.borrowersListByType);
router.get('/borrowers/summary/:year', auth, middleware.isModerator, ctrlBorrowers.borrowersSummary);

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

router.get('/loans/users/:userid', auth, middleware.isSafe, ctrlLoans.loansListByUser);

router
    .route('/loans/borrowers/:borrowerid')
    .get(auth, middleware.isModerator, ctrlLoans.loansListByBorrower)
    .delete(auth, middleware.isAdmin, ctrlLoans.loansDeleteManyByBorrower);

router
    .route('/loans/:loanid/schedules')
    .get(auth, middleware.isSafe, ctrlLoans.loansSchedulesList)
    .put(auth, middleware.isModerator, ctrlLoans.loansSchedulesUpdate);

router.get('/loans/:loanid/schedules/:scheduleid', auth, middleware.isSafe, ctrlLoans.loansSchedulesReadOne);
router.get('/loans/:loanid/due', auth, middleware.isSafe, ctrlLoans.loansDueListByLoan);
router.get('/loans/:loanid/pastDue', auth, middleware.isSafe, ctrlLoans.loansPastDueListByLoan);
router.get('/loans/due/repayments', auth, middleware.isModerator, ctrlLoans.loansDueRepaymentsList);
router.get('/loans/pastMaturity/repayments', auth, middleware.isModerator, ctrlLoans.loansPastMaturityRepaymentsList);
router.get('/loans/summary/:year', auth, middleware.isModerator, ctrlLoans.loansSummary);
router.get('/loans/summary/type/:year', auth, middleware.isModerator, ctrlLoans.loansTypeSummary);
router.get('/loans/interest/report/:year', auth, middleware.isModerator, ctrlLoans.loansInterestReport);

// admin
router
    .route('/admins')
    .get(auth, middleware.isAdmin, ctrlAdmin.adminsList)
    .post(auth, middleware.isAdmin, ctrlAdmin.adminsCreate);

router
    .route('/admins/:adminid')
    .get(auth, middleware.isAdmin, ctrlAdmin.adminsReadOne)
    .put(auth, middleware.isAdmin, ctrlAdmin.adminsUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlAdmin.adminsDeleteOne);

router.post('/admins/email', ctrlAdmin.adminsGetEmailByUser);
router.get('/admins/setEmailToken/:userid', auth, middleware.isAdmin, ctrlAdmin.adminsSetEmailToken);
router.post('/admins/validateEmailToken', auth, middleware.isAdmin, ctrlAdmin.adminsVerifyEmailToken);

router
    .route('/admins/users/:userid')
    .get(auth, middleware.isAdmin, ctrlAdmin.adminsReadOneByUser)
    .put(auth, middleware.isAdmin, ctrlAdmin.adminsUpdateOneByUser);

// activities
router
    .route('/activities')
    .get(auth, middleware.isSafe, ctrlActivity.activitiesList)
    .post(auth, middleware.isSafe, ctrlActivity.activitiesCreate);

router
    .route('/activities/:activityid')
    .get(auth, middleware.isSafe, ctrlActivity.activitiesReadOne)
    .put(auth, middleware.isAdmin, ctrlActivity.activitiesUpdateOne)
    .delete(auth, middleware.isAdmin, ctrlActivity.activitiesDeleteOne);

router.get('/activities/users/:userid', auth, middleware.isSafe, ctrlActivity.activitiesListByUser);
router.post('/activities/:userid', ctrlActivity.activitiesCreate2);

module.exports = router;