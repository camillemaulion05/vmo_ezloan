const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlInquiries = require('../controllers/inquiries');
const ctrlEmployees = require('../controllers/employees');
const ctrlTransactions = require('../controllers/transactions');

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
    .put(ctrlInquiries.inquiriesUpdateOne)
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

module.exports = router;