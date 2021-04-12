const validator = require('validator');
const CryptoJS = require("crypto-js");
const request = require('request');
const apiOptions = {
    server: process.env.BASE_URL
};

/**
 * GET /account
 * Profile page.
 */
const getAccount = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + req.user.token
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
                    msg: 'There was an error in loading your account.'
                });
                return res.redirect('/login');
            } else if (statusCode === 200) {
                res.render('account/index', {
                    title: 'Account Management',
                    borrower: borrower
                });
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/login');
            }
        }
    );
};

const getProfile = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + req.user.token
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
                    msg: 'There was an error in loading your profile.'
                });
                return res.redirect('/login');
            } else if (statusCode === 200) {
                res.render('account/profile', {
                    title: 'Account Management - Profile',
                    borrower: borrower
                });
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/login');
            }
        }
    );
};

const postProfile = (req, res) => {
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
    if (validator.isEmpty(req.body.firstName)) validationErrors.push({
        msg: 'First Name cannot be blank.'
    });
    if (validator.isEmpty(req.body.lastName)) validationErrors.push({
        msg: 'Last Name cannot be blank.'
    });
    if (validator.isEmpty(req.body.gender)) validationErrors.push({
        msg: 'Gender cannot be blank.'
    });
    if (validator.isEmpty(req.body.dateOfBirth)) validationErrors.push({
        msg: 'Birthday cannot be blank.'
    });
    if (!validator.isDate(req.body.dateOfBirth)) validationErrors.push({
        msg: 'Enter a valid date.'
    });
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });
    if (validator.isEmpty(req.body.mobileNum)) validationErrors.push({
        msg: 'Mobile number cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/signup');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
    path = '/api/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            username: req.body.username
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your username.  Please try again later.'
                });
                return res.redirect('/profile');
            } else if (statusCode === 200) {
                path = '/api/borrowers/users/' + (req.user.id).toString();
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {
                        profile: {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            gender: req.body.gender,
                            dateOfBirth: req.body.dateOfBirth,
                            email: req.body.email,
                            mobileNum: req.body.mobileNum
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
                                msg: 'There was an error when updating your profile.  Please try again later.'
                            });
                            return res.redirect('/profile');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: 'Profile information has been updated.'
                            });
                            return res.redirect('/profile');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
                            });
                            return res.redirect('/profile');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/profile');
            }
        }
    );
};

const postProfilePic = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.file.filename)) validationErrors.push({
        msg: 'Profile picture cannot be blank.'
    });
    path = '/api/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            picture: req.file.filename
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your profile picture.  Please try again later.'
                });
                return res.redirect('/profile');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Profile picture has been updated.'
                });
                return res.redirect('/profile');
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/profile');
            }
        }
    );
};

const postVerifyMobileNum = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.code)) validationErrors.push({
        msg: 'Code cannot be blank.'
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
                return res.redirect('/profile');
            } else if (statusCode === 200) {
                path = '/api/borrowers/users/' + (req.user.id).toString();
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'PUT',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {
                        profile: {
                            mobileNumVerified: true
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
                                msg: 'There was an error when updating your profile.  Please try again later.'
                            });
                            return res.redirect('/profile');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: 'Thank you for verifying your mobile number.'
                            });
                            return res.redirect('/profile');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
                            });
                            return res.redirect('/profile');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: body.message
                });
                return res.redirect('/profile');
            }
        }
    );
};

const getVerifyEmail = (req, res) => {
    path = '/api/borrowers/setEmailToken/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + req.user.token
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
                    msg: 'Error sending the email verification message. Please try again shortly.'
                });
                return res.redirect('/profile');
            } else if (statusCode === 200) {
                let bytes = CryptoJS.AES.decrypt(borrower.token, process.env.CRYPTOJS_SERVER_SECRET);
                let originalToken = bytes.toString(CryptoJS.enc.Utf8);
                path = '/api/sendMail';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        receiver: borrower.email,
                        subject: 'Please verify your email address on VMO EZ Loan',
                        message: `Thank you for registering with VMO EZ loan.\n\n
                        This verify your email address please click on the following link, or paste this into your browser:\n\n
                        http://${req.headers.host}/verifyEmail/${originalToken}\n\n
                        \n\n
                        Thank you!`
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, body) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'Error sending the email verification message. Please try again shortly.'
                            });
                            return res.redirect('/profile');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: `An e-mail has been sent to ${borrower.email} with further instructions.`
                            });
                            return res.redirect('/profile');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
                            });
                            return res.redirect('/profile');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/profile');
            }
        }
    );
};

const getVerifyEmailToken = (req, res) => {
    const validationErrors = [];
    if (req.params.token && (!validator.isHexadecimal(req.params.token))) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/profile');
    }
    path = '/api/borrowers/validateEmailToken';
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            userid: req.user.id.toString(),
            token: CryptoJS.AES.encrypt(req.params.token, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, borrower) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your profile.  Please try again later.'
                });
                return res.redirect('/profile');
            } else if (statusCode === 200) {
                req.flash('info', {
                    msg: 'Thank you for verifying your email address.'
                });
                return res.redirect('/profile');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/profile');
            }
        }
    );
};

const getSecurity = (req, res) => {
    res.render('account/security', {
        title: 'Account Management - Security'
    });
};

const getVerifications = (req, res) => {
    res.render('account/verifications', {
        title: 'Account Management - Verifications'
    });
};

const getVerificationsPersonal = (req, res) => {
    res.render('account/personal', {
        title: 'Account Management - Verifications - Personal Information'
    });
};

const getVerificationsAddress = (req, res) => {
    res.render('account/address', {
        title: 'Account Management - Verifications - Address'
    });
};

const getVerificationsFinancial = (req, res) => {
    res.render('account/financial', {
        title: 'Account Management - Verifications - Financial Questionnaire'
    });
};

const getVerificationsDocuments = (req, res) => {
    res.render('account/documents', {
        title: 'Account Management - Verifications - Identity Documentation'
    });
};

const getVerificationsDeclaration = (req, res) => {
    res.render('account/declaration', {
        title: 'Account Management - Verifications - KYC Declaration'
    });
};

const getVerificationsForm = (req, res) => {
    res.render('account/form', {
        title: 'Account Management - Verifications - Application Form'
    });
};

const getLoans = (req, res) => {
    res.render('account/loans', {
        title: 'Account Management - Loans'
    });
};


module.exports = {
    getAccount,
    getProfile,
    postProfile,
    postProfilePic,
    postVerifyMobileNum,
    getVerifyEmail,
    getVerifyEmailToken,
    getSecurity,
    getVerifications,
    getVerificationsPersonal,
    getVerificationsAddress,
    getVerificationsFinancial,
    getVerificationsDocuments,
    getVerificationsDeclaration,
    getVerificationsForm,
    getLoans
};