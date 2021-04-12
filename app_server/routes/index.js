const express = require('express');
const router = express.Router();
const lusca = require('lusca');
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlAccount = require('../controllers/account');
const passportConfig = require('../config/passport');
const multerConfig = require('../config/multer');

router
    .route('/')
    .get(ctrlHome.index)
    .post(ctrlHome.postContact);

router
    .route('/login')
    .get(ctrlUsers.getLogin)
    .post(ctrlUsers.postLogin);

router
    .route('/forgot')
    .get(ctrlUsers.getForgot)
    .post(ctrlUsers.postForgot);

router
    .route('/reset/:token')
    .get(ctrlUsers.getReset)
    .post(ctrlUsers.postReset);

router
    .route('/signup')
    .get(ctrlUsers.getSignup)
    .post(ctrlUsers.postSignup);

router.get('/logout', ctrlUsers.getLogout);

/**
 * Account routes.
 */
router.get('/account', passportConfig.isAuthenticated, ctrlAccount.getAccount);

router
    .route('/profile')
    .get(passportConfig.isAuthenticated, ctrlAccount.getProfile)
    .post(passportConfig.isAuthenticated, ctrlAccount.postProfile);

router.post('/upload/pic', passportConfig.isAuthenticated, multerConfig.upload.single('profilePic'), lusca({
    csrf: true
}), ctrlAccount.postProfilePic);

router.post('/verifyMobileNum', passportConfig.isAuthenticated, ctrlAccount.postVerifyMobileNum);
router.get('/verifyEmail', passportConfig.isAuthenticated, ctrlAccount.getVerifyEmail);
router.get('/verifyEmail/:token', passportConfig.isAuthenticated, ctrlAccount.getVerifyEmailToken);

router
    .route('/security')
    .get(passportConfig.isAuthenticated, ctrlAccount.getSecurity)
    .post(passportConfig.isAuthenticated, ctrlAccount.postSecurity);

router.post('/security/questions', ctrlAccount.postSecurityQuestions);

router.get('/verifications', ctrlAccount.getVerifications);
router.get('/personal', ctrlAccount.getVerificationsPersonal);
router.get('/address', ctrlAccount.getVerificationsAddress);
router.get('/financial', ctrlAccount.getVerificationsFinancial);
router.get('/documents', ctrlAccount.getVerificationsDocuments);
router.get('/declaration', ctrlAccount.getVerificationsDeclaration);
router.get('/form', ctrlAccount.getVerificationsForm);
router.get('/loans', ctrlAccount.getLoans);

module.exports = router;