const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
// const ctrlUsers = require('../controllers/users');
const ctrlInquiries = require('../controllers/inquiries');
const ctrlSMS = require('../controllers/sms');

router.get('/', ctrlHome.index);
// router.get('/login', ctrlUsers.getLogin);
// router.post('/login', ctrlUsers.postLogin);
// router.get('/logout', ctrlUsers.logout);
// router.get('/forgot', ctrlUsers.getForgot);
// router.post('/forgot', ctrlUsers.postForgot);
// router.get('/reset/:token', ctrlUsers.getReset);
// router.post('/reset/:token', ctrlUsers.postReset);
// router.get('/signup', ctrlUsers.getSignup);
// router.post('/signup', ctrlUsers.postSignup);
router.post('/inquiries', ctrlInquiries.postInquiries);
router.post('/sms/sendOTP', ctrlSMS.sendOTP);
router.post('/sms/validateOTP', ctrlSMS.validateOTP);

module.exports = router;