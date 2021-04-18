const validator = require('validator');
const CryptoJS = require("crypto-js");
const request = require('request');
const PdfPrinter = require('pdfmake');
const apiOptions = {
    server: process.env.BASE_URL
};

/**
 * GET /account
 * Profile page.
 */

function parseDate(date) {
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month2 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let d = (new Date(date)).toString().split(' ');
    return (date) ? month2[month.indexOf(d[1])] + '/' + d[2] + '/' + d[3] : "";
}

function getUserDetails(req, res, filename, title) {
    path = ((req.user.type == "Borrower") ? '/api/borrowers/users/' : '/api/employees/users/') + (req.user.id).toString();
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
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error in loading your account.'
                });
                return res.redirect('/login');
            } else if (statusCode === 200) {
                if (title.indexOf("Security") != -1) {
                    for (let i = 0; i < (user.userId.security).length; i++) {
                        let bytes = CryptoJS.AES.decrypt((user.userId.security)[i].answer, process.env.CRYPTOJS_SERVER_SECRET);
                        (user.userId.security)[i].answer = bytes.toString(CryptoJS.enc.Utf8);
                    }
                }
                res.render(filename, {
                    title: title,
                    user: user
                });
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/login');
            }
        }
    );
}


const getAccount = (req, res) => {
    getUserDetails(req, res, 'account/index', 'Account Management');
};

const getProfile = (req, res) => {
    getUserDetails(req, res, 'account/profile', 'Account Management - Profile');
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
        return res.redirect('/profile');
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
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/profile');
    }
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
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/profile');
    }
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
    getUserDetails(req, res, 'account/security', 'Account Management - Security');
};

const postSecurity = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.currentPassword)) validationErrors.push({
        msg: 'Current Password cannot be blank.'
    });
    if (!validator.isLength(req.body.currentPassword, {
            min: 8
        })) validationErrors.push({
        msg: 'Current Password must be at least 8 characters long'
    });
    if (validator.isEmpty(req.body.newPassword)) validationErrors.push({
        msg: 'Current Password cannot be blank.'
    });
    if (!validator.isLength(req.body.newPassword, {
            min: 8
        })) validationErrors.push({
        msg: 'Current Password must be at least 8 characters long'
    });
    if (req.body.newPassword !== req.body.confirmPassword) validationErrors.push({
        msg: 'Passwords do not match'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/security');
    }
    path = '/api/change/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            currentPassword: CryptoJS.AES.encrypt(req.body.currentPassword, process.env.CRYPTOJS_CLIENT_SECRET).toString(),
            newPassword: CryptoJS.AES.encrypt(req.body.newPassword, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, borrower) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your password.  Please try again later.'
                });
                return res.redirect('/security');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Success! Your password has been changed.'
                });
                return res.redirect('/security');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/security');
            }
        }
    );
};

const postSecurityQuestions = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.question1)) validationErrors.push({
        msg: 'Question 1 cannot be blank.'
    });
    if (validator.isEmpty(req.body.answer1)) validationErrors.push({
        msg: 'Answer 1 cannot be blank.'
    });
    if (validator.isEmpty(req.body.question2)) validationErrors.push({
        msg: 'Question 2 cannot be blank.'
    });
    if (validator.isEmpty(req.body.answer2)) validationErrors.push({
        msg: 'Answer 2 cannot be blank.'
    });
    if (validator.isEmpty(req.body.question3)) validationErrors.push({
        msg: 'Question 3 cannot be blank.'
    });
    if (validator.isEmpty(req.body.answer3)) validationErrors.push({
        msg: 'Answer 3 cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/security');
    }
    path = '/api/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            security: [{
                    question: req.body.question1,
                    answer: CryptoJS.AES.encrypt(req.body.answer1, process.env.CRYPTOJS_CLIENT_SECRET).toString()
                },
                {
                    question: req.body.question2,
                    answer: CryptoJS.AES.encrypt(req.body.answer2, process.env.CRYPTOJS_CLIENT_SECRET).toString()
                },
                {
                    question: req.body.question3,
                    answer: CryptoJS.AES.encrypt(req.body.answer3, process.env.CRYPTOJS_CLIENT_SECRET).toString()
                }
            ]
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your security questions.  Please try again later.'
                });
                return res.redirect('/security');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Password Recovery Questions has been updated.'
                });
                return res.redirect('/security');
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/security');
            }
        }
    );
};

const getVerifications = (req, res) => {
    getUserDetails(req, res, 'account/verifications', 'Account Management - Verifications');
};

const getVerificationsSubmit = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            status: 'Pending for Review'
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, borrower) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your verification status.  Please try again later.'
                });
                return res.redirect('/verifications');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Verification status has been updated.'
                });
                return res.redirect('/verifications');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/verifications');
            }
        }
    );
};

const getVerificationsCancel = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            status: 'Basic'
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, borrower) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your verification status.  Please try again later.'
                });
                return res.redirect('/verifications');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Verification status has been updated.'
                });
                return res.redirect('/verifications');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/verifications');
            }
        }
    );
};

const getVerificationsDownload = (req, res) => {
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
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error in loading your account.'
                });
                return res.redirect('/verifications');
            } else if (statusCode === 200) {
                var fonts = {
                    Roboto: {
                        normal: __basedir + '/public/fonts/Roboto-Regular.ttf',
                        bold: __basedir + '/public/fonts/Roboto-Medium.ttf',
                        italics: __basedir + '/public/fonts/Roboto-Italic.ttf',
                        bolditalics: __basedir + '/public/fonts/Roboto-MediumItalic.ttf'
                    },
                    Fontello: {
                        normal: __basedir + '/public/fonts/fontello.ttf'
                    }
                }
                let printer = new PdfPrinter(fonts);
                let unchecked = '';
                let checked = '';
                let dateOfBirth = parseDate(user.profile.dateOfBirth);
                let dateHired = parseDate(user.workBusinessInfo.dateHired);
                let dateNow = parseDate(new Date);
                let reviewedDate = parseDate(user.reviewedDate);
                var docDefinition = {
                    content: [{
                            text: 'VMO EZ LOAN',
                            style: 'header'
                        },
                        {
                            text: [
                                'NON-MEMBERSHIP APPLICATION FORM\n\n'
                            ],
                            style: 'subheader'
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*', '*'],
                                body: [
                                    [{
                                        text: 'PERSONAL INFORMATION',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black',
                                        colSpan: 3,
                                    }, {}, {}],
                                    [{
                                            text: 'FIRST NAME',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'MIDDLE NAME',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'LAST NAME',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.profile.firstName,
                                            style: 'medium',
                                            border: [true, false, false, true]
                                        },
                                        {
                                            text: user.profile.middleName,
                                            style: 'medium',
                                            border: [true, false, false, true]
                                        },
                                        {
                                            text: user.profile.lastName,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'GENDER',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'DATE OF BIRTH\n(mm/dd/yyyy)',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'MARITAL STATUS',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: 'NO. OF DEPENDENTS',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        },
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.gender == "Male") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Male\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.gender == "Female") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Female'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            text: dateOfBirth,
                                            style: 'medium',
                                            border: [true, false, false, true]
                                        },
                                        {
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.maritalStat == "Single") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Single\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.maritalStat == "Married") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Married\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.maritalStat == "Widow/er") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Widow/er'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.maritalStat == "Legally Seperated") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Legally Seperated\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.maritalStat == "Annuled") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Annuled'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            text: user.profile.dependents,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        },
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'EDUCATIONAL ATTAINMENT',
                                            style: 'small',
                                            border: [true, false, false, false],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: 'PLACE OF BIRTH (CITY/MUNICIPALITY, PROVINCE)',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: 'NATIONALITY',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 2
                                        }, {},
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.educAttainment == "High School") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  High School\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.educAttainment == "College") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  College\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.educAttainment == "Others") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Others'
                                                    }, ]
                                                }
                                            ],
                                            colSpan: 2
                                        }, {},
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.educAttainment == "Vocational/Technical") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Vocational/Technical\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.educAttainment == "Post Graduate") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Post Graduate'
                                                    }, ]
                                                }
                                            ],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: user.profile.placeOfBirth,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: user.profile.nationality,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 2
                                        }, {}
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: [{
                                                    text: 'PRESENT ADDRESS',
                                                    style: 'item'
                                                },
                                                {
                                                    text: '\t(Unit No., House No., Street No., Subdivision,  Barangay, City, Province)',
                                                    style: 'small'
                                                }
                                            ],
                                            border: [true, false, true, false],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: 'ZIP CODE',
                                            style: 'small',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.profile.address.present.unitNo + ' ' + user.profile.address.present.houseNo + ' ' + user.profile.address.present.street + ' ' + user.profile.address.present.subdivision + ' ' + user.profile.address.present.barangay + ' ' + user.profile.address.present.city + ' ' + user.profile.address.present.province,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: user.profile.address.present.zipCode,
                                            style: 'medium',
                                            border: [false, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: [{
                                                    text: 'PERMANENT ADDRESS',
                                                    style: 'item'
                                                },
                                                {
                                                    text: '\t(Unit No., House No., Street No., Subdivision,  Barangay, City, Province)',
                                                    style: 'small'
                                                }
                                            ],
                                            border: [true, false, true, false],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: 'ZIP CODE',
                                            style: 'small',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.profile.address.permanent.unitNo + ' ' + user.profile.address.permanent.houseNo + ' ' + user.profile.address.permanent.street + ' ' + user.profile.address.permanent.subdivision + ' ' + user.profile.address.permanent.barangay + ' ' + user.profile.address.permanent.city + ' ' + user.profile.address.permanent.province,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: user.profile.address.permanent.zipCode,
                                            style: 'medium',
                                            border: [false, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'HOME OWNERSHIP',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: 'HOME PHONE NO.',
                                            style: 'small',
                                            border: [false, false, true, false]
                                        },
                                        {
                                            text: 'MOBILE/CELLPHONE NO.',
                                            style: 'small',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.profile.homeOwnership == "Owned") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Owned\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.homeOwnership == "Rented/Boarder") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Rented/Boarder\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.profile.homeOwnership == "Others") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Others'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, true, true],
                                            text: [{
                                                text: (user.profile.homeOwnership == "Living with Parents/Relatives") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Living with Parents/Relatives'
                                            }, ]
                                        },
                                        {
                                            text: '+(63) ' + user.profile.homePhoneNum,
                                            style: 'medium',
                                            border: [false, false, true, true]
                                        },
                                        {
                                            text: '+(63) ' + user.profile.mobileNum,
                                            style: 'medium',
                                            border: [false, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*'],
                                body: [
                                    [{
                                            text: 'TAX IDENTIFICATION NUMBER',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        },
                                        {
                                            text: 'E-MAIL ADDRESS',
                                            style: 'small',
                                            border: [false, false, true, false],
                                            colSpan: 2
                                        }, {}
                                    ],
                                    [{
                                            text: user.profile.tin,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        },
                                        {
                                            text: user.profile.email,
                                            style: 'medium',
                                            border: [false, false, true, true],
                                            colSpan: 2
                                        }, {}
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{
                                        text: 'WORK / BUSINESS INFORMATION',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black',
                                        colSpan: 4
                                    }, {}, {}, {}],
                                    [{
                                            text: 'COMPANY NAME',
                                            style: 'small',
                                            border: [true, false, false, false],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: 'Department',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'OFFICE PHONE NO.',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.workBusinessInfo.companyName,
                                            style: 'medium',
                                            border: [true, false, false, true],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: user.workBusinessInfo.department,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        },
                                        {
                                            text: '+(63) ' + user.workBusinessInfo.officePhone,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: [{
                                                    text: 'OFFICE ADDRESS',
                                                    style: 'item'
                                                },
                                                {
                                                    text: '\t(Unit No., House No., Street No., Subdivision,  Barangay, City, Province)',
                                                    style: 'small'
                                                }
                                            ],
                                            border: [true, false, true, false],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: 'ZIP CODE',
                                            style: 'small',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.workBusinessInfo.officeAddress.unitNo + ' ' + user.workBusinessInfo.officeAddress.houseNo + ' ' + user.workBusinessInfo.officeAddress.street + ' ' + user.workBusinessInfo.officeAddress.subdivision + ' ' + user.workBusinessInfo.officeAddress.barangay + ' ' + user.workBusinessInfo.officeAddress.city + ' ' + user.workBusinessInfo.officeAddress.province,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 5
                                        }, {}, {}, {}, {},
                                        {
                                            text: user.workBusinessInfo.officeAddress.zipCode,
                                            style: 'medium',
                                            border: [false, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'EMPLOYMENT STATUS',
                                            style: 'small',
                                            border: [true, false, false, false],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: 'OCCUPATION TYPE',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 2
                                        }, {}
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Regular") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Regular\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Probation") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Probation\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Contractual") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Contractual'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Project Based") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Project Based\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Part-Time") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Part-Time\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.employmentType == "Self-Employed/Freelancer") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Self-Employed/Freelancer'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Management") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Management\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Marketing") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Marketing\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Sales") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Sales\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Office Worker") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Office Worker\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Professional/Technical") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Professional/Technical\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Others") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Others'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, true, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Service/Reception") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Service/Reception\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Production Worker/Labor") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Production Worker/Labor\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Security/Guard/Maid") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Security/Guard/Maid\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Driver") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Driver\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.occupationType == "Self Employee/Freelance") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Self Employee/Freelance'
                                                    }, ]
                                                }
                                            ]
                                        }
                                    ],
                                ]
                            }
                        },

                        {
                            table: {
                                widths: ['*', '*'],
                                body: [
                                    [{
                                        text: 'BUSINESS TYPE',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "BPO/IT/Communication/Mass Media") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  BPO/IT/Communication/Mass Media\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Transportation/Shipping/Real Estate") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Transportation/Shipping/Real Estate\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Government") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Government\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Trading/Export/Import/Wholesale") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Trading/Export/Import/Wholesale\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Medical/Education/School") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Medical/Education/School\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Agriculture/Forestry/Fisheries/Mining") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Agriculture/Forestry/Fisheries/Mining'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, true, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Retail Sale/Restaurant/Hotel/Tourism/Other Service") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Retail Sale/Restaurant/Hotel/Tourism/Other Service\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Bank/Insurance/Finance") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Bank/Insurance/Finance\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Construction/Maker/Manufacturing") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Construction/Maker/Manufacturing\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Electric/Gas/Waterworks") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Electric/Gas/Waterworks\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Security") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Security\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.businessType == "Others") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Others'
                                                    }, ]
                                                }
                                            ]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'POSITION',
                                            style: 'small',
                                            border: [true, false, false, false],
                                            colSpan: 2
                                        }, {},
                                        {
                                            text: 'DATE HIRED\n(mm/dd/yyyy)',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        },
                                        {
                                            text: 'MONTHLY INCOME',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.position == "Director/Executive") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Director/Executive\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.position == "Officer") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Officer\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.position == "None") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  None'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                    text: [{
                                                        text: (user.workBusinessInfo.position == "Supervisor") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Supervisor\n'
                                                    }, ]
                                                },
                                                {
                                                    text: [{
                                                        text: (user.workBusinessInfo.position == "Staff") ? checked : unchecked,
                                                        style: 'icon'
                                                    }, {
                                                        text: '  Staff'
                                                    }, ]
                                                }
                                            ]
                                        },
                                        {
                                            text: dateHired,
                                            style: 'medium',
                                            border: [true, false, false, true]
                                        },
                                        {
                                            text: user.workBusinessInfo.monthlyIncome,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        }
                                    ]
                                ]
                            },
                            pageBreak: 'after'
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: [
                                    [{
                                        text: 'DOCUMENTS',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black',
                                        colSpan: 2,
                                    }, {}],
                                    [{
                                        text: 'IDENTIFICATION CARD',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                            image: __basedir + '/uploads/' + user.documents.primaryIdFront,
                                            width: 240,
                                            border: [true, false, false, false],
                                            alignment: 'center'
                                        },
                                        {
                                            image: __basedir + '/uploads/' + user.documents.primaryIdBack,
                                            width: 240,
                                            border: [false, false, true, false],
                                            alignment: 'center'
                                        }
                                    ],
                                    [{
                                        text: 'COMPANY ID / COE',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                            image: __basedir + '/uploads/' + user.documents.companyIdFront,
                                            width: 240,
                                            border: [true, false, false, false],
                                            alignment: 'center'
                                        },
                                        {
                                            image: __basedir + '/uploads/' + user.documents.companyIdBack,
                                            width: 240,
                                            border: [false, false, true, false],
                                            alignment: 'center'
                                        }
                                    ],
                                    [{
                                        text: 'PAYSLIP / BIR 2316',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        image: __basedir + '/uploads/' + user.documents.payslip1,
                                        width: 250,
                                        border: [true, false, true, false],
                                        alignment: 'center',
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        text: 'TIN PROOF',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        image: __basedir + '/uploads/' + user.documents.tinProof,
                                        width: 250,
                                        border: [true, false, true, false],
                                        alignment: 'center',
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        text: 'SELFIE WITH ID',
                                        style: 'small',
                                        border: [true, false, true, false],
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        image: __basedir + '/uploads/' + user.documents.selfiewithId,
                                        width: 250,
                                        border: [true, false, true, false],
                                        alignment: 'center',
                                        colSpan: 2
                                    }, {}],
                                    [{
                                        text: '   ',
                                        style: 'medium',
                                        border: [true, false, true, true],
                                        colSpan: 2
                                    }, {}]
                                ]
                            },
                            pageBreak: 'after'
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*'],
                                body: [
                                    [{
                                        text: 'BANK / G-CASH INFORMATION',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black',
                                        colSpan: 2,
                                    }, {}],
                                    [{
                                            text: 'NAME OF BANK/NAME OF G-CASH',
                                            style: 'small',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: 'BRANCH',
                                            style: 'small',
                                            border: [true, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: user.account.name,
                                            style: 'medium',
                                            border: [true, false, false, true]
                                        },
                                        {
                                            text: user.account.branch,
                                            style: 'medium',
                                            border: [true, false, true, true]
                                        }
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 0,
                                widths: ['*', '*', '*', '*', '*'],
                                body: [
                                    [{
                                            text: 'TYPE OF ACCOUNT',
                                            style: 'small',
                                            border: [true, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: 'ACCOUNT NO.',
                                            style: 'small',
                                            border: [true, false, true, false],
                                            colSpan: 2
                                        }, {}
                                    ],
                                    [{
                                            style: 'item',
                                            border: [true, false, false, true],
                                            text: [{
                                                text: (user.account.type == "Savings") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Savings'
                                            }, ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                text: (user.account.type == "Checking/Current") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Checking/Current'
                                            }, ]
                                        },
                                        {
                                            style: 'item',
                                            border: [false, false, false, true],
                                            text: [{
                                                text: (user.account.type == "G-Cash") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  G-Cash'
                                            }, ]
                                        },
                                        {
                                            text: user.account.number,
                                            style: 'medium',
                                            border: [true, false, true, true],
                                            colSpan: 2
                                        }, {}
                                    ],
                                ]
                            }
                        },
                        {
                            table: {
                                headerRows: 1,
                                widths: ['*'],
                                body: [
                                    [{
                                        text: 'DECLARATION',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black'
                                    }],
                                    [{
                                        text: 'I certify that all information provided in this Application Form is true and correct.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I agree that VMO EZ Loan will send SMS and email for reminder. VMO EZ Loan is not responsible for the security administration on the phone and email account. It is the borrower’s responsibility.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'VMO EZ Loan may deny the application as a result of credit check, but VMO EZ Loan will not have the obligation to disclose the reason of denial or to return my application and other submitted documents.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I agree that VMO EZ Loan may obtain the Borrower’s personal information from credit information center, third parties or any other relevant source of information for purposes of the credit check, confirmation of employment or other risk management and disclose the personal information pursuant to applicable laws and regulations. I also agree to waive my rights under R.A. 1405.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I hereby acknowledge and authorize: (1) the regular submission and disclosure of my basic credit data (as defined under Republic Act No. 9510 and its Implementing Rules and Regulations to the Credit Information Corporation ("CIC") as well as  any updates; and (2) the sharing of my basic credit data with other lenders authorized by the CIC and credit reporting agencies duly accredited by the CIC.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I declare that my family and I are not a person in a foreign country, who is an important position in heads of state, government, central bank or similar institution (including cases where applicable in the past).',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I consent to the processing of my personal information and sensitive personal information contained in this application in accordance with Republic Act No. 10173 or the Data Privacy Act, for the purpose of processing my loan application and implementation of the Loan Agreement.',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }],
                                    [{
                                        text: 'I agree that notwithstanding the execution of a Loan Agreement, the obligations of the parties therein, including the release of the loan amount by VMO EZ Loan and payment of the principal amount of  the loan and interest, shall be effective only upon approval by VMO EZ Loan of my loan application. \n',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        alignment: 'justify'
                                    }]
                                ]
                            }
                        },
                        {
                            table: {
                                widths: ['*', '*', '*', '*', '*', '*', ],
                                body: [
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            image: user.signature,
                                            fit: [100, 100],
                                            alignment: 'center',
                                            border: [false, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: '',
                                            border: [false, false, false, false]
                                        },
                                        {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: (user.profile.firstName).toUpperCase() + ' ' + (user.profile.lastName).toUpperCase(),
                                            alignment: 'center',
                                            border: [false, false, false, false],
                                            colSpan: 3

                                        }, {}, {},
                                        {
                                            text: dateNow,
                                            alignment: 'center',
                                            border: [false, false, false, false]
                                        },
                                        {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: '\t\t\tSIGNATURE OVER PRINTED NAME\t\t\t',
                                            decoration: 'overline',
                                            italics: true,
                                            alignment: 'center',
                                            style: 'item',
                                            border: [false, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: '\t\t\tDATE\t\t\t',
                                            decoration: 'overline',
                                            italics: true,
                                            style: 'item',
                                            alignment: 'center',
                                            border: [false, false, false, false]
                                        }, {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                        text: '\n',
                                        border: [true, false, true, true],
                                        colSpan: 6
                                    }, {}, {}, {}, {}, {}]
                                ]
                            },
                        }, {
                            table: {
                                headerRows: 1,
                                widths: ['*', '*', '*', '*', '*', '*', ],
                                body: [
                                    [{
                                        text: 'FOR VMO EZLOAN USE ONLY',
                                        style: 'tableHeader',
                                        alignment: 'center',
                                        fillColor: 'black',
                                        colSpan: 6
                                    }, {}, {}, {}, {}, {}],
                                    [{
                                        text: 'REVIEWED BY:',
                                        style: 'item',
                                        border: [true, false, true, false],
                                        colSpan: 6
                                    }, {}, {}, {}, {}, {}],
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            image: (user.reviewedBy && user.reviewedBy.signature) ? user.reviewedBy.signature : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADIAZADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
                                            fit: [100, 100],
                                            alignment: 'center',
                                            border: [false, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: '',
                                            border: [false, false, false, false]
                                        },
                                        {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: (user.reviewedBy && user.reviewedBy.profile.firstName && user.reviewedBy.profile.lastName) ? user.reviewedBy.profile.firstName + ' ' + user.reviewedBy.profile.lastName : '',
                                            alignment: 'center',
                                            border: [false, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: reviewedDate,
                                            alignment: 'center',
                                            border: [false, false, false, false]
                                        },
                                        {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                            text: '',
                                            border: [true, false, false, false]
                                        },
                                        {
                                            text: '\t\t\tSIGNATURE OVER PRINTED NAME\t\t\t',
                                            decoration: 'overline',
                                            italics: true,
                                            alignment: 'center',
                                            style: 'item',
                                            border: [false, false, false, false],
                                            colSpan: 3
                                        }, {}, {},
                                        {
                                            text: '\t\t\tDATE\t\t\t',
                                            decoration: 'overline',
                                            italics: true,
                                            style: 'item',
                                            alignment: 'center',
                                            border: [false, false, false, false]
                                        }, {
                                            text: '',
                                            border: [false, false, true, false]
                                        }
                                    ],
                                    [{
                                        text: '\n',
                                        border: [true, false, true, true],
                                        colSpan: 6
                                    }, {}, {}, {}, {}, {}]
                                ]
                            }
                        }
                    ],
                    styles: {
                        icon: {
                            font: 'Fontello'
                        },
                        header: {
                            fontSize: 15,
                            bold: true,
                            alignment: 'center'
                        },
                        subheader: {
                            fontSize: 9,
                            alignment: 'center'
                        },
                        medium: {
                            fontSize: 11,
                            alignment: 'left'
                        },
                        item: {
                            fontSize: 9,
                            alignment: 'left'
                        },
                        small: {
                            fontSize: 7,
                            alignment: 'left'
                        },
                        tableHeader: {
                            fontSize: 12,
                            bold: true,
                            alignment: 'center',
                            color: 'white',
                            fillColor: 'black'
                        },
                        signature: {
                            margin: [0, 200, 0, 0]
                        }
                    }
                };
                // Make sure the browser knows this is a PDF.
                res.set('Content-Type', 'application/pdf');
                res.set('Content-Disposition', `attachment; filename=form.pdf`);
                res.set('Content-Description: File Transfer');
                res.set('Cache-Control: no-cache');
                // Create the PDF and pipe it to the response object.
                var pdfDoc = printer.createPdfKitDocument(docDefinition);
                pdfDoc.pipe(res);
                pdfDoc.end();
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/verifications');
            }
        }
    );
};

const getVerificationsPersonal = (req, res) => {
    getUserDetails(req, res, 'account/personal', 'Account Management - Verifications - Personal Information');
};

const postVerificationsPersonal = (req, res) => {
    const validationErrors = [];
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
        return res.redirect('/profile');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
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
                middleName: req.body.middleName,
                lastName: req.body.lastName,
                gender: req.body.gender,
                dateOfBirth: req.body.dateOfBirth,
                maritalStat: req.body.maritalStat,
                dependents: req.body.dependents,
                educAttainment: req.body.educAttainment,
                placeOfBirth: req.body.placeOfBirth,
                nationality: req.body.nationality,
                homePhoneNum: req.body.homePhoneNum,
                mobileNum: req.body.mobileNum,
                tin: req.body.tin,
                email: req.body.email
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
                    msg: 'There was an error when updating your personal information.  Please try again later.'
                });
                return res.redirect('/personal');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Personal information has been updated.'
                });
                return res.redirect('/personal');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/personal');
            }
        }
    );
};

const getVerificationsAddress = (req, res) => {
    getUserDetails(req, res, 'account/address', 'Account Management - Verifications - Address');
};

const postVerificationsAddress = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            profile: {
                address: {
                    sameAddress: (req.body.sameAddress == 'true') ? true : false,
                    present: {
                        unitNo: req.body.unitNo,
                        houseNo: req.body.houseNo,
                        street: req.body.street,
                        subdivision: req.body.subdivision,
                        barangay: req.body.barangay,
                        city: req.body.city,
                        province: req.body.province,
                        zipCode: req.body.zipCode
                    },
                    permanent: {
                        unitNo: (req.body.sameAddress == 'true') ? req.body.unitNo : req.body.unitNo2,
                        houseNo: (req.body.sameAddress == 'true') ? req.body.houseNo : req.body.houseNo2,
                        street: (req.body.sameAddress == 'true') ? req.body.street : req.body.street2,
                        subdivision: (req.body.sameAddress == 'true') ? req.body.subdivision : req.body.subdivision2,
                        barangay: (req.body.sameAddress == 'true') ? req.body.barangay : req.body.barangay2,
                        city: (req.body.sameAddress == 'true') ? req.body.city : req.body.city2,
                        province: (req.body.sameAddress == 'true') ? req.body.province : req.body.province2,
                        zipCode: (req.body.sameAddress == 'true') ? req.body.zipCode : req.body.zipCode2
                    }
                },
                homeOwnership: req.body.homeOwnership
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
                    msg: 'There was an error when updating your address information.  Please try again later.'
                });
                return res.redirect('/address');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Address information has been updated.'
                });
                return res.redirect('/address');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/address');
            }
        }
    );
};

const getVerificationsFinancial = (req, res) => {
    getUserDetails(req, res, 'account/financial', 'Account Management - Verifications - Financial Questionnaire');
};

const postVerificationsFinancial = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            workBusinessInfo: {
                companyName: req.body.companyName,
                department: req.body.department,
                officePhone: req.body.officePhone,
                officeAddress: {
                    unitNo: req.body.unitNo,
                    houseNo: req.body.houseNo,
                    street: req.body.street,
                    subdivision: req.body.subdivision,
                    barangay: req.body.barangay,
                    city: req.body.city,
                    province: req.body.province,
                    zipCode: req.body.zipCode
                },
                dateHired: req.body.dateHired,
                employmentType: req.body.employmentType,
                occupationType: req.body.occupationType,
                businessType: req.body.businessType,
                position: req.body.position,
                monthlyIncome: req.body.monthlyIncome,
                employeeID: req.body.employeeID,
            },
            account: {
                name: (req.body.mop == "Bank Transfer") ? req.body.bankName : req.body.bankName2,
                branch: (req.body.mop == "Bank Transfer") ? req.body.branch : "",
                type: (req.body.mop == "Bank Transfer") ? req.body.accountType : req.body.mop,
                number: (req.body.mop == "Bank Transfer") ? req.body.accountNum : req.body.accountNum2
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
                    msg: 'There was an error when updating your work/business information.  Please try again later.'
                });
                return res.redirect('/financial');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Work/Business information has been updated.'
                });
                return res.redirect('/financial');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/financial');
            }
        }
    );
};

const getVerificationsDocuments = (req, res) => {
    getUserDetails(req, res, 'account/documents', 'Account Management - Verifications - Identity Documentation');
};

const postVerificationsDocuments = (req, res) => {
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            documents: {
                primaryIdFront: (req.files.primaryIdFront) ? req.files.primaryIdFront[0].filename : '',
                primaryIdBack: (req.files.primaryIdBack) ? req.files.primaryIdBack[0].filename : '',
                companyIdFront: (req.files.companyIdFront) ? req.files.companyIdFront[0].filename : '',
                companyIdBack: (req.files.companyIdBack) ? req.files.companyIdBack[0].filename : '',
                coe: (req.files.coe) ? req.files.coe[0].filename : '',
                payslip1: (req.files.payslip1) ? req.files.payslip1[0].filename : '',
                payslip2: (req.files.payslip2) ? req.files.payslip2[0].filename : '',
                bir: (req.files.bir) ? req.files.bir[0].filename : '',
                tinProof: (req.files.tinProof) ? req.files.tinProof[0].filename : '',
                selfiewithId: (req.files.selfiewithId) ? req.files.selfiewithId[0].filename : ''
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
                    msg: 'There was an error when updating your documents.  Please try again later.'
                });
                return res.redirect('/documents');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Documents have been updated.'
                });
                return res.redirect('/documents');
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('/documents');
            }
        }
    );
};

const getVerificationsDeclaration = (req, res) => {
    getUserDetails(req, res, 'account/declaration', 'Account Management - Verifications - KYC Declaration');
};

const postVerificationsDeclaration = (req, res) => {
    console.log(req.body);
    const validationErrors = [];
    if (req.body.termsAndCondition != 'true') validationErrors.push({
        msg: 'You must agree with the Terms and Condition.'
    });
    if (req.body.privacyPolicy != 'true') validationErrors.push({
        msg: 'You must accept the Privacy Policy.'
    });
    if (req.body.soa != 'true') validationErrors.push({
        msg: 'You must agree that in case you do not have email address, you allow us to send your SOA in your office.'
    });
    if (req.body.letterOfAuthorization != 'true') validationErrors.push({
        msg: 'You must sign a Letter of Authorization.'
    });
    if (validator.isEmpty(req.body.signatureDataURL)) validationErrors.push({
        msg: 'Signature cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/declaration');
    }
    path = '/api/borrowers/users/' + (req.user.id).toString();
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            signature: req.body.signatureDataURL
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, borrower) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating your KYC declaration.  Please try again later.'
                });
                return res.redirect('/declaration');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'KYC declaration has been updated.'
                });
                return res.redirect('/declaration');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('/declaration');
            }
        }
    );
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
    postSecurity,
    postSecurityQuestions,
    getVerifications,
    getVerificationsCancel,
    getVerificationsSubmit,
    getVerificationsDownload,
    getVerificationsPersonal,
    postVerificationsPersonal,
    getVerificationsAddress,
    postVerificationsAddress,
    getVerificationsFinancial,
    postVerificationsFinancial,
    getVerificationsDocuments,
    postVerificationsDocuments,
    getVerificationsDeclaration,
    postVerificationsDeclaration,
    getVerificationsForm,
    getLoans
};