const express = require('express');
const router = express.Router();
const ctrlHome = require('../controllers/home');
const ctrlUsers = require('../controllers/users');
const ctrlAccount = require('../controllers/account');
const passportConfig = require('../config/passport');

router
    .route('/')
    .get(ctrlHome.index)
    .post(ctrlHome.postContact);

router
    .route('/login')
    .get(ctrlUsers.getLogin)
    .post(ctrlUsers.postLogin);

router
    .route('/login/:type')
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

router
    .route('/signup/:type')
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

router.post('/upload/pic', passportConfig.isAuthenticated, ctrlAccount.postProfilePic);

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
router.get('/download/borrower/:borrowerid', passportConfig.isAuthenticated, ctrlAccount.getDownloadBorrowerInfo);
router.get('/download/:filename/:originalname', passportConfig.isAuthenticated, ctrlAccount.getDownloadFiles);

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
router.post('/upload/documents', passportConfig.isAuthenticated, ctrlAccount.postVerificationsDocuments);

router
    .route('/declaration')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsDeclaration)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsDeclaration);

router
    .route('/beneficiaries')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsBeneficiaries)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsBeneficiaries);

router
    .route('/pledge')
    .get(passportConfig.isAuthenticated, ctrlAccount.getVerificationsPledge)
    .post(passportConfig.isAuthenticated, ctrlAccount.postVerificationsPledge);

router
    .route('/credits')
    .get(passportConfig.isAuthenticated, ctrlAccount.getCredits)
    .post(passportConfig.isAuthenticated, ctrlAccount.postCredits);

router.post('/repayments/:borrowerid/:loanid', passportConfig.isAuthenticated, ctrlAccount.postRepayment);

router.get('/download/loan/:loanid/soa', passportConfig.isAuthenticated, ctrlAccount.getDownloadLoanSOA);
router.get('/download/loan/:loanid/schedule', passportConfig.isAuthenticated, ctrlAccount.getDownloadLoanSchedule);

router
    .route('/contributions')
    .get(passportConfig.isAuthenticated, ctrlAccount.getContributions)
    .post(passportConfig.isAuthenticated, ctrlAccount.postContributions);

router.post('/withdrawalRequest', passportConfig.isAuthenticated, ctrlAccount.postWithdrawalRequest);
router.get('/contributions/:borrowerid', passportConfig.isAuthenticated, ctrlAccount.getContributionDetails);
router.get('/download/contributions', passportConfig.isAuthenticated, ctrlAccount.getDownloadContributions);
router.get('/summary/report/contributions', passportConfig.isAuthenticated, ctrlAccount.getContributionsReport);

router
    .route('/borrowers')
    .get(passportConfig.isAuthenticated, ctrlAccount.getBorrowers)
    .post(passportConfig.isAuthenticated, ctrlAccount.postBorrowers);

router
    .route('/borrowers/:borrowerid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getBorrowerDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postUpdateBorrowers);

router.get('/borrowers/:borrowerid/view', passportConfig.isAuthenticated, ctrlAccount.getBorrowerDetails);
router.get('/borrowers/:borrowerid/:userid/delete', passportConfig.isAuthenticated, ctrlAccount.getDeleteBorrowers);
router.get('/borrowers/loans/:loanid', passportConfig.isAuthenticated, ctrlAccount.getBorrowerLoans);
router.get('/download/report/borrowers/:type', passportConfig.isAuthenticated, ctrlAccount.getDownloadBorrowersReport);
router.get('/summary/report/borrowers', passportConfig.isAuthenticated, ctrlAccount.getBorrowersReport);

router
    .route('/loans')
    .get(passportConfig.isAuthenticated, ctrlAccount.getLoans)
    .post(passportConfig.isAuthenticated, ctrlAccount.postLoans);

router
    .route('/loans/:loanid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getLoanDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postUpdateLoans);

router.get('/loans/:loanid/delete', passportConfig.isAuthenticated, ctrlAccount.getDeleteLoans);
router.get('/download/report/loans/:type', passportConfig.isAuthenticated, ctrlAccount.getDownloadLoansReport);
router.get('/summary/report/loans/release', passportConfig.isAuthenticated, ctrlAccount.getLoansReleaseReport);
router.get('/summary/report/loans/repayments', passportConfig.isAuthenticated, ctrlAccount.getLoansRepaymentsReport);
router
    .route('/transactions')
    .get(passportConfig.isAuthenticated, ctrlAccount.getTransactions)
    .post(passportConfig.isAuthenticated, ctrlAccount.postTransactions);

router
    .route('/transactions/:transactionid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getTransactionDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postUpdateTransactions);

router.get('/transactions/:transactionid/delete', passportConfig.isAuthenticated, ctrlAccount.getDeleteTransactions);
router.get('/download/report/transactions/:type', passportConfig.isAuthenticated, ctrlAccount.getDownloadTransactionsReport);

router
    .route('/withdrawals')
    .get(passportConfig.isAuthenticated, ctrlAccount.getWithdrawals)
    .post(passportConfig.isAuthenticated, ctrlAccount.postWithdrawals);

router
    .route('/withdrawals/:withdrawalid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getWithdrawalDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postUpdateWithdrawals);

router.get('/withdrawals/:withdrawalid/delete', passportConfig.isAuthenticated, ctrlAccount.getDeleteWithdrawals);
router.get('/download/report/withdrawals/all', passportConfig.isAuthenticated, ctrlAccount.getDownloadWithdrawalsReport);

router
    .route('/employees')
    .get(passportConfig.isAuthenticated, ctrlAccount.getEmployees)
    .post(passportConfig.isAuthenticated, ctrlAccount.postEmployees);

router
    .route('/employees/:employeeid/:type')
    .get(passportConfig.isAuthenticated, ctrlAccount.getEmployeeDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.postUpdateEmployees);

router.get('/employees/:employeeid/:userid/delete/:type', passportConfig.isAuthenticated, ctrlAccount.getDeleteEmployees);
router.get('/download/report/employees/all', passportConfig.isAuthenticated, ctrlAccount.getDownloadEmployeesReport);

router
    .route('/inquiries')
    .get(passportConfig.isAuthenticated, ctrlAccount.getInquiries);

router
    .route('/inquiries/:inquiryid')
    .get(passportConfig.isAuthenticated, ctrlAccount.getInquiryDetails)
    .post(passportConfig.isAuthenticated, ctrlAccount.getUpdateInquiries);

router.get('/inquiries/:inquiryid/delete', passportConfig.isAuthenticated, ctrlAccount.getDeleteInquiries);
router.get('/download/report/inquiries/all', passportConfig.isAuthenticated, ctrlAccount.getDownloadInquiriesReport);

router.get('/download/report/financial/:year', passportConfig.isAuthenticated, ctrlAccount.getDownloadFinancialReport);

router
    .route('/activities')
    .get(passportConfig.isAuthenticated, ctrlAccount.getActivities);

router.get('/download/report/activities/all', passportConfig.isAuthenticated, ctrlAccount.getDownloadActivitiesReport);

module.exports = router;