const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const passportConfig = require('../config/passport');

router.get('/', ctrlHome.index);
router.post('/', ctrlHome.postContact);
router.get('/login', ctrlUsers.getLogin);
router.post('/login', ctrlUsers.postLogin);
router.get('/logout', ctrlUsers.getLogout);
router.get('/forgot', ctrlUsers.getForgot);
router.post('/forgot', ctrlUsers.postForgot);
router.get('/reset/:token', ctrlUsers.getReset);
router.post('/reset/:token', ctrlUsers.postReset);
router.get('/signup', ctrlUsers.getSignup);
router.post('/signup', ctrlUsers.postSignup);

/**
 * Account routes.
 */
router.get('/account', ctrlUsers.getAccount);
// router.get('/security', ctrlUsers.getSecurity);
// router.get('/verifications', ctrlUsers.getVerifications);
// router.get('/verifications/personal', ctrlUsers.getVerificationsPersonal);
// router.get('/verifications/address', ctrlUsers.getVerificationsAddress);
// router.get('/verifications/financial', ctrlUsers.getVerificationsFinancial);
// router.get('/verifications/documents', ctrlUsers.getVerificationsDocuments);
// router.get('/verifications/kyc', ctrlUsers.getVerificationsKYC);
// router.get('/verifications/form', ctrlUsers.getVerificationsForm);
// router.get('/loans', ctrlUsers.getLoan);
module.exports = router;