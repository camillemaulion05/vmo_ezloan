import {
    promisify
} from 'util';
import {
    randomBytes
} from 'crypto';
import {
    createTransport
} from 'nodemailer';
import passport from 'passport';
import {
    isEmail,
    normalizeEmail,
    isHexadecimal
} from 'validator';
import {
    isValid
} from 'mailchecker';

const randomBytesAsync = promisify(randomBytes);

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
    if (!isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });

    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/forgot');
    }
    req.body.email = normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
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
    if (!isHexadecimal(req.params.token)) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/forgot');
    }

    User
        .findOne({
            passwordResetToken: req.params.token
        })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash('errors', {
                    msg: 'Password reset token is invalid or has expired.'
                });
                return res.redirect('/forgot');
            }
            res.render('account/reset', {
                title: 'Reset Pass'
            });
        });
};

/**
 * GET index
 * Home page.
 */
const index = (req, res) => {
    console.log(req.session.token);
    res.render('account/home');
};

/**
 * GET /account/profile
 * Profile page.
 */
const getAccountProfile = (req, res) => {
    res.render('account/profile');
};

/**
 * GET /account/loan
 * Loan page.
 */
const getAccountLoan = (req, res) => {
    res.render('account/loan');
};

/**
 * GET /account/verify/:token
 * Verify email address
 */
const getVerifyEmailToken = (req, res, next) => {
    if (req.user.emailVerified) {
        req.flash('info', {
            msg: 'The email address has been verified.'
        });
        return res.redirect('/account/profile');
    }

    const validationErrors = [];
    if (req.params.token && (!isHexadecimal(req.params.token))) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/account/profile');
    }

    if (req.params.token === req.user.emailVerificationToken) {
        User
            .findOne({
                email: req.user.email
            })
            .then((user) => {
                if (!user) {
                    req.flash('errors', {
                        msg: 'There was an error in loading your profile.'
                    });
                    return res.redirect('back');
                }
                user.emailVerificationToken = '';
                user.emailVerified = true;
                user = user.save();
                req.flash('info', {
                    msg: 'Thank you for verifying your email address.'
                });
                return res.redirect('/account/profile');
            })
            .catch((error) => {
                console.log('Error saving the user profile to the database after email verification', error);
                req.flash('errors', {
                    msg: 'There was an error when updating your profile.  Please try again later.'
                });
                return res.redirect('/account/profile');
            });
    } else {
        req.flash('errors', {
            msg: 'The verification link was invalid, or is for a different account.'
        });
        return res.redirect('/account/profile');
    }
};

/**
 * GET /account/verify
 * Verify email address
 */
const getVerifyEmail = (req, res, next) => {
    if (req.user.emailVerified) {
        req.flash('info', {
            msg: 'The email address has been verified.'
        });
        return res.redirect('/account/profile');
    }

    if (!isValid(req.user.email)) {
        req.flash('errors', {
            msg: 'The email address is invalid or disposable and can not be verified.  Please update your email address and try again.'
        });
        return res.redirect('/account/profile');
    }

    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString('hex'));

    const setRandomToken = (token) => {
        User
            .findOne({
                email: req.user.email
            })
            .then((user) => {
                user.emailVerificationToken = token;
                user = user.save();
            });
        return token;
    };

    const sendVerifyEmail = async (token) => {
        let transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD
            }
        });
        const mailOptions = {
            to: req.user.email,
            from: process.env.GMAIL_USER,
            subject: 'Please verify your email address on VMO EZ Loan',
            text: `Thank you for registering with vmo-ez-loan.\n\n
          This verify your email address please click on the following link, or paste this into your browser:\n\n
          http://${req.headers.host}/account/verify/${token}\n\n
          \n\n
          Thank you!`
        };
        try {
            await transporter.sendMail(mailOptions);
            req.flash('info', {
                msg: `An e-mail has been sent to ${req.user.email} with further instructions.`
            });
        } catch (err) {
            if (err.message === 'self signed certificate in certificate chain') {
                console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
                transporter = createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASSWORD
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                return transporter.sendMail(mailOptions)
                    .then(() => {
                        req.flash('info', {
                            msg: `An e-mail has been sent to ${req.user.email} with further instructions.`
                        });
                    });
            }
            console.log('ERROR: Could not send verifyEmail email after security downgrade.\n', err);
            req.flash('errors', {
                msg: 'Error sending the email verification message. Please try again shortly.'
            });
            return err;
        }
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendVerifyEmail)
        .then(() => res.redirect('/account/profile'))
        .catch(next);
};

export default {
    getLogin,
    getSignup,
    getLogout,
    getForgot,
    getReset
};