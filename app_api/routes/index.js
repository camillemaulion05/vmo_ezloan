// Connect to MongoDB.
import '../models/db';

import {
    Router
} from 'express';
const router = Router();
import jwt from 'express-jwt';
const auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload',
    algorithms: ['sha1', 'RS256', 'HS256']
})
import {
    index,
    encrypt,
    decrypt,
    sendOTP,
    validateOTP,
    sendMail
} from '../controllers/home';
import {
    usersList,
    usersCreate,
    usersReadOne,
    usersUpdateOne,
    usersDeleteOne,
    usersAuthenticate
} from '../controllers/users';
import {
    inquiriesList,
    inquiriesCreate,
    inquiriesReadOne,
    inquiriesUpdateOne,
    inquiriesDeleteOne
} from '../controllers/inquiries';
import {
    employeesList,
    employeesCreate,
    employeesReadOne,
    employeesUpdateOne,
    employeesDeleteOne
} from '../controllers/employees';
import {
    transactionsList,
    transactionsCreate,
    transactionsReadOne,
    transactionsUpdateOne,
    transactionsDeleteOne,
    transactionsPerType,
    transactionsPerBorrower,
    transactionsSummary,
    contributionsPerMember
} from '../controllers/transactions';
import {
    withdrawalsList,
    withdrawalsCreate,
    withdrawalsReadOne,
    withdrawalsUpdateOne,
    withdrawalsDeleteOne
} from '../controllers/withdrawals';
import {
    borrowersList,
    borrowersCreate,
    borrowersReadOne,
    borrowersUpdateOne,
    borrowersDeleteOne
} from '../controllers/borrowers';
import {
    loansList,
    loansCreate,
    loansReadOne,
    loansUpdateOne,
    loansDeleteOne,
    loansSchedulesList,
    loansSchedulesUpdate,
    loansSchedulesReadOne,
    loansRepaymentsDue,
    loansSummary,
    loansInterestReport
} from '../controllers/loans';
import {
    isAdmin,
    isSafe,
    isModerator
} from '../middlewares/authorization';

router.get('/', index);
router.post('/encrypt', encrypt);
router.post('/decrypt', decrypt);
router.post('/sendOTP', sendOTP);
router.post('/validateOTP', validateOTP);
router.post('/sendMail', sendMail);

// users
router
    .route('/users')
    .get(auth, isAdmin, usersList)
    .post(usersCreate);

router
    .route('/users/:userid')
    .get(auth, isSafe, usersReadOne)
    .put(auth, isSafe, usersUpdateOne)
    .delete(auth, isAdmin, usersDeleteOne);

router.post('/login', usersAuthenticate);

// inquiries
router
    .route('/inquiries')
    .get(auth, isAdmin, inquiriesList)
    .post(inquiriesCreate);

router
    .route('/inquiries/:inquiryid')
    .get(auth, isAdmin, inquiriesReadOne)
    .put(auth, isAdmin, inquiriesUpdateOne)
    .delete(auth, isAdmin, inquiriesDeleteOne);

// employees
router
    .route('/employees')
    .get(auth, isSafe, employeesList)
    .post(auth, isAdmin, employeesCreate);

router
    .route('/employees/:employeeid')
    .get(auth, isSafe, employeesReadOne)
    .put(auth, isModerator, employeesUpdateOne)
    .delete(auth, isAdmin, employeesDeleteOne);

// transactions
router
    .route('/transactions')
    .get(auth, isSafe, transactionsList)
    .post(auth, isSafe, transactionsCreate);

router
    .route('/transactions/:transactionid')
    .get(auth, isSafe, transactionsReadOne)
    .put(auth, isSafe, transactionsUpdateOne)
    .delete(auth, isAdmin, transactionsDeleteOne);

router
    .route('/transactions/type/:type')
    .get(auth, isSafe, transactionsPerType);

router
    .route('/transactions/borrower/:borrowerid')
    .get(auth, isSafe, transactionsPerBorrower);

router
    .route('/transactions/summary/:year')
    .get(auth, isAdmin, transactionsSummary);

router
    .route('/transactions/contributions/:year')
    .get(auth, isAdmin, contributionsPerMember);

// withdrawals
router
    .route('/withdrawals')
    .get(auth, isSafe, withdrawalsList)
    .post(auth, isSafe, withdrawalsCreate);

router
    .route('/withdrawals/:withdrawalid')
    .get(auth, isSafe, withdrawalsReadOne)
    .put(auth, isSafe, withdrawalsUpdateOne)
    .delete(auth, isAdmin, withdrawalsDeleteOne);

// borrowers
router
    .route('/borrowers')
    .get(auth, isSafe, borrowersList)
    .post(auth, isSafe, borrowersCreate);

router
    .route('/borrowers/:borrowerid')
    .get(auth, isSafe, borrowersReadOne)
    .put(auth, isSafe, borrowersUpdateOne)
    .delete(auth, isAdmin, borrowersDeleteOne);

// loans
router
    .route('/loans')
    .get(auth, isSafe, loansList)
    .post(auth, isSafe, loansCreate);

router
    .route('/loans/:loanid')
    .get(auth, isSafe, loansReadOne)
    .put(auth, isSafe, loansUpdateOne)
    .delete(auth, isAdmin, loansDeleteOne);

router
    .route('/loans/:loanid/schedules')
    .get(auth, isSafe, loansSchedulesList)
    .put(auth, isSafe, loansSchedulesUpdate);

router
    .route('/loans/:loanid/schedules/:scheduleid')
    .get(auth, isSafe, loansSchedulesReadOne);

router
    .route('/loans/:loanid/due')
    .get(auth, isSafe, loansRepaymentsDue);

router
    .route('/loans/summary/:year')
    .get(auth, isAdmin, loansSummary);

router
    .route('/loans/report/:year')
    .get(auth, isAdmin, loansInterestReport);

export default router;