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

router.post('/security/questions', passportConfig.isAuthenticated, ctrlAccount.postSecurityQuestions);

router.get('/verifications', passportConfig.isAuthenticated, ctrlAccount.getVerifications);
router.get('/verifications/submit', passportConfig.isAuthenticated, ctrlAccount.getVerificationsSubmit);
router.get('/verifications/cancel', passportConfig.isAuthenticated, ctrlAccount.getVerificationsCancel);
router.get('/download/borrower', passportConfig.isAuthenticated, ctrlAccount.getDownloadBorrowerInfo);

router
    .route('/personal')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsPersonal)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsPersonal);

router
    .route('/address')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsAddress)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsAddress);

router
    .route('/financial')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsFinancial)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsFinancial);

router.get('/documents', passportConfig.isAuthenticated, ctrlAccount.getVerificationsDocuments);
router.post('/upload/documents', passportConfig.isAuthenticated, multerConfig.upload.fields([{
    name: 'primaryIdFront',
    maxCount: 1
}, {
    name: 'primaryIdBack',
    maxCount: 1
}, {
    name: 'companyIdFront',
    maxCount: 1
}, {
    name: 'companyIdBack',
    maxCount: 1
}, {
    name: 'coe',
    maxCount: 1
}, {
    name: 'payslip1',
    maxCount: 1
}, {
    name: 'payslip2',
    maxCount: 1
}, {
    name: 'bir',
    maxCount: 1
}, {
    name: 'tinProof',
    maxCount: 1
}, {
    name: 'selfiewithId',
    maxCount: 1
}]), lusca({
    csrf: true
}), ctrlAccount.postVerificationsDocuments);

router
    .route('/declaration')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsDeclaration)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsDeclaration);

router
    .route('/loans')
    .get(passportConfig.isAuthenticated, ctrlAccount.getLoans)
    .post(passportConfig.isAuthenticated, ctrlAccount.postLoans);

router
    .route('/loans/:loanid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getLoanDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postRepayment);

router.get('/download/loan/:loanid/soa', passportConfig.isAuthenticated, ctrlAccount.getDownloadLoanSOA);
router.get('/download/loan/:loanid/schedule', passportConfig.isAuthenticated, ctrlAccount.getDownloadLoanSchedule);

module.exports = router;