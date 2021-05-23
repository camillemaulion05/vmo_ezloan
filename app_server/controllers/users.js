const validator = require('validator');
const CryptoJS = require("crypto-js");
const request = require('request');
const passport = require('passport');
const apiOptions = {
    server: process.env.BASE_URL
};

function capitalizeFirstLetter(str) {
    // converting first letter to uppercase
    let capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalized;
}

/**
 * GET /login
 * Login page.
 */
const getLogin = (req, res, next) => {
    if (req.user) {
        return res.redirect('/account');
    }
    let userType = (req.params.type) ? req.params.type : 'borrower';
    if (userType == 'employee' || userType == 'member' || userType == 'admin' || userType == 'borrower') {
        res.render('user/login', {
            title: 'Login',
            type: userType
        });
    } else {
        next();
    }
};

/**
 * POST /login
 * Sign in using username and password.
 */
const postLogin = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.username)) validationErrors.push({
        msg: 'Username cannot be blank.'
    });
    if (!validator.isAlphanumeric(req.body.username)) validationErrors.push({
        msg: 'Username must be alphanumeric.'
    });
    if (!validator.isLength(req.body.username, {
            min: 8
        })) validationErrors.push({
        msg: 'Username must be at least 8 characters long'
    });
    if (validator.isEmpty(req.body.password)) validationErrors.push({
        msg: 'Password cannot be blank.'
    });
    if (!validator.isLength(req.body.password, {
            min: 8
        })) validationErrors.push({
        msg: 'Password must be at least 8 characters long'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/login');
    }
    let userType = (req.params.type) ? req.params.type : 'borrower';
    if (userType == 'employee' || userType == 'member' || userType == 'admin' || userType == 'borrower') {
        if (userType == 'member') userType = 'borrower';
        req.userType = capitalizeFirstLetter(userType);
    } else {
        next();
    }
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('back');
        }
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', {
                msg: 'Success! You are logged in.'
            });
            res.redirect('/account');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
const getLogout = (req, res) => {
    let userType = (req.user.type != "Borrower") ? '/' + (req.user.type).toLowerCase() : '';
    req.logout();
    req.session.destroy((err) => {
        if (err) console.log('Error : Failed to destroy the session during logout.', err);
        req.user = null;
        res.redirect('/login' + userType);
    });
};

/**
 * GET /signup or /signup/:type
 * Signup page.
 */
const getSignup = (req, res, next) => {
    if (req.user) {
        return res.redirect('/account');
    }
    let userType = (req.params.type) ? req.params.type : 'borrower';
    if (userType == 'employee' || userType == 'member' || userType == 'admin' || userType == 'borrower') {
        if (userType == 'member') {
            path = '/api/employees/account';
            requestOptions = {
                url: `${apiOptions.server}${path}`,
                method: 'GET',
                json: {}
            };
            request(
                requestOptions,
                (err, {
                    statusCode
                }, employees) => {
                    if (err) {
                        req.flash('errors', {
                            msg: 'There was an error when loading list of employees. Please try again later.'
                        });
                        return res.redirect('/signup/borrower');
                    } else if (statusCode === 200) {
                        res.render('user/signup', {
                            title: 'Signup',
                            type: 'member',
                            employees: employees
                        });
                    } else {
                        req.flash('errors', {
                            msg: user.message
                        });
                        return res.redirect('/signup/borrower');
                    }
                }
            );
        } else {
            res.render('user/signup', {
                title: 'Signup',
                type: userType
            });
        }
    } else {
        next();
    }
};

/**
 * POST /signup or /signup/:type
 * Create a new local account.
 */
const postSignup = (req, res, next) => {
    const validationErrors = [];
    let userType = (req.params.type) ? req.params.type : 'borrower';
    let type = '',
        employeeID = '',
        sharesPerPayDay = '',
        accountName = '',
        accountNum = '';
    if (userType == 'employee' || userType == 'member' || userType == 'admin' || userType == 'borrower') {
        if (userType == 'employee' || userType == 'member' || userType == 'admin') {
            if (validator.isEmpty(req.body.userCode)) validationErrors.push({
                msg: 'User code cannot be blank.'
            });
            if (req.body.userCode) {
                if (userType == 'admin') {
                    let bytes = CryptoJS.AES.decrypt(process.env.ADMIN_CODE, process.env.CRYPTOJS_SERVER_SECRET);
                    let originalAdminCode = bytes.toString(CryptoJS.enc.Utf8);
                    if (validator.isEmpty(req.body.employeeID)) validationErrors.push({
                        msg: 'Employee ID cannot be blank.'
                    });
                    if (req.body.userCode != originalAdminCode) validationErrors.push({
                        msg: 'User code is invalid.'
                    });
                    employeeID = req.body.employeeID;
                }
                if (userType == 'employee') {
                    let bytes = CryptoJS.AES.decrypt(process.env.EMPLOYEE_CODE, process.env.CRYPTOJS_SERVER_SECRET);
                    let originalEmployeeCode = bytes.toString(CryptoJS.enc.Utf8);
                    if (validator.isEmpty(req.body.employeeType)) validationErrors.push({
                        msg: 'Employee type cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.employeeID)) validationErrors.push({
                        msg: 'Employee ID cannot be blank.'
                    });
                    if (req.body.employeeType == "Loan Processor") {
                        if (validator.isEmpty(req.body.accountName)) validationErrors.push({
                            msg: 'G-Cash Account Name cannot be blank.'
                        });
                        if (validator.isEmpty(req.body.accountNum)) validationErrors.push({
                            msg: 'G-Cash Account No. cannot be blank.'
                        });
                        accountName = req.body.accountName;
                        accountNum = req.body.accountNum;
                    }
                    if (req.body.userCode != originalEmployeeCode) validationErrors.push({
                        msg: 'User code is invalid.'
                    });
                    type = req.body.employeeType;
                    employeeID = req.body.employeeID;
                }
                if (userType == 'member') {
                    let bytes = CryptoJS.AES.decrypt(process.env.MEMBER_CODE, process.env.CRYPTOJS_SERVER_SECRET);
                    let originalMemberCode = bytes.toString(CryptoJS.enc.Utf8);
                    if (validator.isEmpty(req.body.employeeID)) validationErrors.push({
                        msg: 'Employee ID cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.sharesPerPayDay)) validationErrors.push({
                        msg: 'Shares per payday cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.senderNum)) validationErrors.push({
                        msg: 'Sender G-Cash No. cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.receiverNum)) validationErrors.push({
                        msg: 'Receiver G-Cash No. cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
                        msg: 'G-Cash Reference No. cannot be blank.'
                    });
                    if (req.body.userCode != originalMemberCode) validationErrors.push({
                        msg: 'User code is invalid.'
                    });
                    //override userType
                    userType = 'borrower';
                    type = 'Member';
                    employeeID = req.body.employeeID;
                    sharesPerPayDay = req.body.sharesPerPayDay;
                    accountNum = req.body.senderNum;
                }
            }
        } else {
            type = 'Non-Member';
        }
    } else {
        next();
    }
    if (validator.isEmpty(req.body.username)) validationErrors.push({
        msg: 'Username cannot be blank.'
    });
    if (!validator.isAlphanumeric(req.body.username)) validationErrors.push({
        msg: 'Username must be alphanumeric.'
    });
    if (!validator.isLength(req.body.username, {
            min: 8
        })) validationErrors.push({
        msg: 'Username must be at least 8 characters long'
    });
    if (validator.isEmpty(req.body.password)) validationErrors.push({
        msg: 'Password cannot be blank.'
    });
    if (!validator.isLength(req.body.password, {
            min: 8
        })) validationErrors.push({
        msg: 'Password must be at least 8 characters long'
    });
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({
        msg: 'Passwords do not match'
    });
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });
    if (validator.isEmpty(req.body.firstName)) validationErrors.push({
        msg: 'First Name cannot be blank.'
    });
    if (validator.isEmpty(req.body.lastName)) validationErrors.push({
        msg: 'Last Name cannot be blank.'
    });
    if (validator.isEmpty(req.body.dateOfBirth)) validationErrors.push({
        msg: 'Birthday cannot be blank.'
    });
    if (!validator.isDate(req.body.dateOfBirth)) validationErrors.push({
        msg: 'Enter a valid date.'
    });
    if (validator.isEmpty(req.body.gender)) validationErrors.push({
        msg: 'Gender cannot be blank.'
    });
    if (validator.isEmpty(req.body.mobileNum)) validationErrors.push({
        msg: 'Mobile number cannot be blank.'
    });
    if (validator.isEmpty(req.body.code)) validationErrors.push({
        msg: 'OTP Code cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });

    let path = '/api/validateOTP';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            mobileNum: req.body.mobileNum,
            code: req.body.code
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, body) => {
            if (err) {
                req.flash('errors', {
                    msg: 'The verification code you entered is not correct. Please try again.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/users';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        username: req.body.username,
                        password: CryptoJS.AES.encrypt(req.body.password, process.env.CRYPTOJS_CLIENT_SECRET).toString(),
                        type: capitalizeFirstLetter(userType)
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, user) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error in creating your account.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 201) {
                            path = '/api/borrowers';
                            if (userType == 'admin') path = '/api/admins';
                            if (userType == 'employee') path = '/api/employees';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                headers: {
                                    Authorization: 'Bearer ' + user.token
                                },
                                json: {
                                    type: type,
                                    profile: {
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        dateOfBirth: req.body.dateOfBirth,
                                        gender: req.body.gender,
                                        email: req.body.email,
                                        mobileNum: req.body.mobileNum,
                                        mobileNumVerified: true
                                    },
                                    employeeID: employeeID,
                                    sharesPerPayDay: sharesPerPayDay,
                                    account: {
                                        name: accountName,
                                        number: accountNum
                                    }
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, account) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error in creating your account profile.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 201) {
                                        if (type == "Member") {
                                            let bytes = CryptoJS.AES.decrypt(account.id, process.env.CRYPTOJS_SERVER_SECRET);
                                            let originalUserId = bytes.toString(CryptoJS.enc.Utf8);
                                            path = '/api/borrowers/users/' + originalUserId;
                                            requestOptions = {
                                                url: `${apiOptions.server}${path}`,
                                                method: 'GET',
                                                headers: {
                                                    Authorization: 'Bearer ' + user.token
                                                },
                                                json: {}
                                            };
                                            request(
                                                requestOptions,
                                                (err, {
                                                    statusCode
                                                }, borrower) => {
                                                    if (err) {
                                                        req.flash('errors', {
                                                            msg: 'There was an error when borrower information. Please try again later.'
                                                        });
                                                        return res.redirect('back');
                                                    } else if (statusCode === 200) {
                                                        let transaction = {};
                                                        transaction.amount = "1000.00";
                                                        transaction.type = "Fees";
                                                        transaction.senderNum = borrower.account.number;
                                                        transaction.borrowerId = borrower._id;
                                                        transaction.postedBy = req.body.receiverNum;
                                                        transaction.referenceNo = req.body.referenceNo;

                                                        path = '/api/employees/' + transaction.postedBy;
                                                        requestOptions = {
                                                            url: `${apiOptions.server}${path}`,
                                                            method: 'GET',
                                                            headers: {
                                                                Authorization: 'Bearer ' + user.token
                                                            },
                                                            json: {}
                                                        };
                                                        request(
                                                            requestOptions,
                                                            (err, {
                                                                statusCode
                                                            }, employee) => {
                                                                if (err) {
                                                                    req.flash('errors', {
                                                                        msg: 'There was an error when loading employee information. Please try again later.'
                                                                    });
                                                                    return res.redirect('back');
                                                                } else if (statusCode === 200) {
                                                                    transaction.receiverNum = (employee.account && employee.account.number) ? employee.account.number : '';
                                                                    path = '/api/transactions';
                                                                    requestOptions = {
                                                                        url: `${apiOptions.server}${path}`,
                                                                        method: 'POST',
                                                                        headers: {
                                                                            Authorization: 'Bearer ' + user.token
                                                                        },
                                                                        json: transaction
                                                                    };
                                                                    request(
                                                                        requestOptions,
                                                                        (err, {
                                                                            statusCode
                                                                        }, newTransaction) => {
                                                                            if (err) {
                                                                                req.flash('errors', {
                                                                                    msg: 'There was an error when adding new transaction for membership fee. Please try again later.'
                                                                                });
                                                                                return res.redirect('back');
                                                                            } else if (statusCode === 201) {
                                                                                transaction.amount = req.body.sharesPerPayDay;
                                                                                transaction.type = "Contributions";
                                                                                path = '/api/transactions';
                                                                                requestOptions = {
                                                                                    url: `${apiOptions.server}${path}`,
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        Authorization: 'Bearer ' + user.token
                                                                                    },
                                                                                    json: transaction
                                                                                };
                                                                                request(
                                                                                    requestOptions,
                                                                                    (err, {
                                                                                        statusCode
                                                                                    }, newTransaction2) => {
                                                                                        if (err) {
                                                                                            req.flash('errors', {
                                                                                                msg: 'There was an error when adding new transaction for new contribution. Please try again later.'
                                                                                            });
                                                                                            return res.redirect('back');
                                                                                        } else if (statusCode === 201) {
                                                                                            req.flash("success", {
                                                                                                msg: "Successfully Signed Up! Please login your credentials. "
                                                                                            });
                                                                                            return res.redirect('/login');
                                                                                        } else {
                                                                                            req.flash('errors', {
                                                                                                msg: newTransaction2.message
                                                                                            });
                                                                                            return res.redirect('back');
                                                                                        }
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                req.flash('errors', {
                                                                                    msg: newTransaction.message
                                                                                });
                                                                                return res.redirect('back');
                                                                            }
                                                                        }
                                                                    );
                                                                } else {
                                                                    req.flash('errors', {
                                                                        msg: employee.message
                                                                    });
                                                                    return res.redirect('back');
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        req.flash('errors', {
                                                            msg: borrower.message
                                                        });
                                                        return res.redirect('back');
                                                    }
                                                }
                                            );
                                        } else {
                                            req.flash("success", {
                                                msg: "Successfully Signed Up! Please login your credentials. "
                                            });
                                            userType = (userType != "borrower") ? '/' + userType : '';
                                            return res.redirect('/login' + userType);
                                        }
                                    } else {
                                        req.flash('errors', {
                                            msg: account.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: user.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: body.message
                });
                return res.redirect('back');
            }
        }
    );
};

/**
 * GET /forgot
 * Forgot Password page.
 */
const getForgot = (req, res) => {
    if (req.user) {
        return res.redirect('/security');
    }
    res.render('user/forgot', {
        title: 'Forgot Pass'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
const postForgot = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.username)) validationErrors.push({
        msg: 'Username cannot be blank.'
    });
    if (!validator.isAlphanumeric(req.body.username)) validationErrors.push({
        msg: 'Username must be alphanumeric.'
    });
    if (!validator.isLength(req.body.username, {
            min: 8
        })) validationErrors.push({
        msg: 'Username must be at least 8 characters long'
    });
    if (validator.isEmpty(req.body.question)) validationErrors.push({
        msg: 'Please select your security question.'
    });
    if (validator.isEmpty(req.body.answer)) validationErrors.push({
        msg: 'Please enter your answer.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/forgot');
    }
    let path = '/api/setPassToken';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            username: req.body.username,
            security: {
                question: req.body.question,
                answer: CryptoJS.AES.encrypt(req.body.answer, process.env.CRYPTOJS_CLIENT_SECRET).toString()
            }
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'Error sending the password reset message. Please try again shortly.'
                });
                return res.redirect('/forgot');
            } else if (statusCode === 200) {
                path = '/api/borrowers/email';
                if (user.type == "Admin") path = '/api/admins/email';
                if (user.type == "Employee") path = '/api/employees/email';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        userid: user.userid
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, borrower) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'Error sending the password reset message. Please try again shortly.'
                            });
                            return res.redirect('/forgot');
                        } else if (statusCode === 200) {
                            let bytes = CryptoJS.AES.decrypt(user.token, process.env.CRYPTOJS_SERVER_SECRET);
                            let originalToken = bytes.toString(CryptoJS.enc.Utf8);
                            path = '/api/sendMail';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                json: {
                                    receiver: borrower.email,
                                    subject: 'Reset your password on VMO EZ Loan',
                                    message: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
                            Please click on the following link, or paste this into your browser to complete the process:\n\n
                            http://${req.headers.host}/reset/${originalToken}\n\n
                            If you did not request this, please ignore this email and your password will remain unchanged.\n`
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, body) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'Error sending the password reset message. Please try again shortly.'
                                        });
                                        return res.redirect('/forgot');
                                    } else if (statusCode === 200) {
                                        req.flash('success', {
                                            msg: `An e-mail has been sent to ${borrower.email} with further instructions.`
                                        });
                                        return res.redirect('/forgot');
                                    } else {
                                        req.flash('errors', {
                                            msg: body.message
                                        });
                                        return res.redirect('/forgot');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
                            });
                            return res.redirect('/forgot');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/forgot');
            }
        }
    );

};

/**
 * GET /reset/:token
 * Reset Password page.
 */
const getReset = (req, res, next) => {
    if (req.user) {
        return res.redirect('/security');
    }
    const validationErrors = [];
    if (!validator.isHexadecimal(req.params.token)) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/forgot');
    }

    let path = '/api/validatePassToken';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            token: CryptoJS.AES.encrypt(req.params.token, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, body) => {
            if (err) {
                req.flash('errors', {
                    msg: 'Password reset token is invalid or has expired.'
                });
                return res.redirect('/forgot');
            } else if (statusCode === 200) {
                res.render('user/reset', {
                    title: 'Reset Pass'
                });
            } else {
                req.flash('errors', {
                    msg: body.message
                });
                return res.redirect('/forgot');
            }
        }
    );
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
const postReset = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.password)) validationErrors.push({
        msg: 'Password cannot be blank.'
    });
    if (!validator.isLength(req.body.password, {
            min: 8
        })) validationErrors.push({
        msg: 'Password must be at least 8 characters long'
    });
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({
        msg: 'Passwords do not match'
    });
    if (!validator.isHexadecimal(req.params.token)) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }

    let path = '/api/reset';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            token: CryptoJS.AES.encrypt(req.params.token, process.env.CRYPTOJS_CLIENT_SECRET).toString(),
            password: CryptoJS.AES.encrypt(req.body.password, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'Password reset token is invalid or has expired.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/borrowers/email';
                if (user.type == "Admin") path = '/api/admins/email';
                if (user.type == "Employee") path = '/api/employees/email';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        userid: user.userid
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, borrower) => {
                        if (err) {
                            req.flash('warnings', {
                                msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.'
                            });
                            return res.redirect('/login');
                        } else if (statusCode === 200) {
                            path = '/api/sendMail';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                json: {
                                    receiver: borrower.email,
                                    subject: 'Your VMO EZ Loan password has been changed',
                                    message: `Hello,\n\nThis is a confirmation that the password for your account ${user.username} has just been changed.\n`
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, body) => {
                                    if (err) {
                                        req.flash('warnings', {
                                            msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.'
                                        });
                                        return res.redirect('/login');
                                    } else if (statusCode === 200) {
                                        req.flash('success', {
                                            msg: 'Success! Your password has been changed.'
                                        });
                                        return res.redirect('/login');
                                    } else {
                                        req.flash('errors', {
                                            msg: body.message
                                        });
                                        return res.redirect('/login');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
                            });
                            return res.redirect('/login');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('back');
            }
        }
    );
};

module.exports = {
    getLogin,
    postLogin,
    getSignup,
    postSignup,
    getLogout,
    getForgot,
    postForgot,
    getReset,
    postReset
};