const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlInquiries = require('../controllers/inquiries');

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

module.exports = router;