const validator = require('validator');
const CryptoJS = require("crypto-js");
const request = require('request');
const passport = require('passport');
const apiOptions = {
    server: process.env.BASE_URL
};

/**
 * GET /login
 * Login page.
 */
const getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/account');
    }
    res.render('account/login', {
        title: 'Login'
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
const postLogin = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.username)) validationErrors.push({
        msg: 'Username cannot be blank.'
    });
    if (validator.isEmpty(req.body.password)) validationErrors.push({
        msg: 'Password cannot be blank.'
    });

    if (validationErrors.length) {
        console.log(validationErrors);
        req.flash('errors', validationErrors);
        return res.redirect('/login');
    }
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('errors', info);
            return res.redirect('/login');
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
    req.logout();
    req.session.destroy((err) => {
        if (err) console.log('Error : Failed to destroy the session during logout.', err);
        req.user = null;
        res.redirect('/login');
    });
};

/**
 * GET /signup
 * Signup page.
 */
const getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/account');
    }
    res.render('account/signup', {
        title: 'Signup'
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
const postSignup = (req, res, next) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.username)) validationErrors.push({
        msg: 'Username cannot be blank.'
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
    if (validator.isEmpty(req.body.birthdate)) validationErrors.push({
        msg: 'Birthday cannot be blank.'
    });
    if (validator.isEmpty(req.body.gender)) validationErrors.push({
        msg: 'Gender cannot be blank.'
    });
    if (validator.isEmpty(req.body.phone)) validationErrors.push({
        msg: 'Mobile number cannot be blank.'
    });
    if (validator.isEmpty(req.body.code)) validationErrors.push({
        msg: 'OTP Code cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/signup');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });

    let path = '/api/validateOTP';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            phone: req.body.phone,
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
                return res.redirect('/signup');
            } else if (statusCode === 200) {
                path = '/api/users';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        username: req.body.username,
                        password: CryptoJS.AES.encrypt(req.body.password, process.env.CRYPTOJS_CLIENT_SECRET).toString(),
                        email: req.body.email,
                        mobileNum: req.body.phone,
                        mobileNumVerified: true
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, user) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'System Maintenance. Please try again later.'
                            });
                            return res.redirect('/signup');
                        } else if (statusCode === 201) {
                            path = '/api/borrowers';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                headers: {
                                    Authorization: 'Bearer ' + user.token
                                },
                                json: {
                                    profile: {
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        birthday: req.body.birthdate,
                                        gender: req.body.gender
                                    }
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, borrower) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'System Maintenance. Please try again later.'
                                        });
                                        return res.redirect('/signup');
                                    } else if (statusCode === 201) {
                                        req.logIn(user, (err) => {
                                            if (err) {
                                                return next(err);
                                            }
                                            req.flash("success", {
                                                msg: "Successfully Signed Up! Nice to meet you " + borrower.firstName
                                            });
                                            res.redirect('/account');
                                        });
                                    } else {
                                        req.flash('errors', {
                                            msg: borrower.message
                                        });
                                        return res.redirect('/signup');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: user.message
                            });
                            return res.redirect('/signup');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: body.message
                });
                return res.redirect('/signup');
            }
        }
    );
};

/**
 * GET /forgot
 * Forgot Password page.
 */
const getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/account');
    }
    res.render('account/forgot', {
        title: 'Forgot Pass'
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
const postForgot = (req, res) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
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
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });

    let path = '/api/passToken';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            email: req.body.email,
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
        }, body) => {
            if (err) {
                req.flash('errors', {
                    msg: 'Error sending the password reset message. Please try again shortly.'
                });
                return res.redirect('/forgot');
            } else if (statusCode === 200) {
                let bytes = CryptoJS.AES.decrypt(body.token, process.env.CRYPTOJS_SERVER_SECRET);
                let originalToken = bytes.toString(CryptoJS.enc.Utf8);
                path = '/api/sendMail';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        receiver: req.body.email,
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
                                msg: `An e-mail has been sent to ${req.body.email} with further instructions.`
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
                    msg: body.message
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
    if (req.isAuthenticated()) {
        return res.redirect('/account');
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
                res.render('account/reset', {
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
    console.log(JSON.stringify(req.body));
    const validationErrors = [];
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
    console.log(validationErrors.length);
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
    console.log(JSON.stringify(requestOptions));
    request(
        requestOptions,
        (err, {
            statusCode
        }, body) => {
            if (err) {
                req.flash('errors', {
                    msg: 'Password reset token is invalid or has expired.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/sendMail';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        receiver: body.email,
                        subject: 'Your VMO EZ Loan password has been changed',
                        message: `Hello,\n\nThis is a confirmation that the password for your account ${body.username} has just been changed.\n`
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, body) => {
                        if (err) {
                            req.flash('warning', {
                                msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.'
                            });
                            return res.redirect('/login');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: 'Success! Your password has been changed.'
                            });
                            return res.redirect('/login');
                        } else {
                            req.flash('warning', {
                                msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.'
                            });
                            return res.redirect('/login');
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
 * GET /account
 * Profile page.
 */
const getAccount = (req, res) => {
    res.render('account/profile', {
        title: 'Account Management'
    });
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
    postReset,
    getAccount
};