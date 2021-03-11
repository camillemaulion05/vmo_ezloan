const validator = require('validator');
const CryptoJS = require("crypto-js");
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
const postForgot = (req, res, next) => {
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
                    msg: body.message
                });
                return res.redirect('/forgot');
            } else if (statusCode === 200) {
                path = '/api/sendMail';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        sender: req.body.email,
                        subject: 'Reset your password on VMO EZ Loan',
                        message: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
                        Please click on the following link, or paste this into your browser to complete the process:\n\n
                        http://${req.headers.host}/reset/${body.token}\n\n
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
                        }
                    }
                );
            }
        }
    );
};

module.exports = {
    getLogin,
    getSignup,
    getLogout,
    getForgot,
    postForgot
};