const multerConfig = require('../config/multer');
const validator = require('validator');
const CryptoJS = require("crypto-js");
const request = require('request');
const PdfPrinter = require('pdfmake');
const generator = require('generate-password');
const uploadFolder = __basedir + '/uploads/';

const apiOptions = {
    server: process.env.BASE_URL
};

function capitalizeFirstLetter(str) {
    // converting first letter to uppercase
    let capitalized = str.charAt(0).toUpperCase() + str.slice(1);
    return capitalized;
}

function passwordGen() {
    return generator.generate({
        length: 8,
        numbers: true,
        symbols: true
    });
}

function usernameGen(firstName, bday) {
    return firstName.replace(/\ /g, "").replace(/\./g, "").replace(/\-/g, "").replace(/\'/g, "").toLowerCase() + bday.replace(/\-/g, "");
}

function parseDate(date, format) {
    let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let month2 = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let month3 = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let d = (new Date(date)).toString().split(' ');
    let dateFormat = month2[month.indexOf(d[1])] + '/' + d[2] + '/' + d[3];
    if (format) {
        if (format == "short") {
            dateFormat = d[1] + ' ' + d[2] + ', ' + d[3];
        }
        if (format == "month") {
            dateFormat = (d[1]).toUpperCase() + ' ' + d[3];
        }
    }
    return dateFormat;
}

function ROUND(num) {
    let newNum = +(Math.round(parseFloat(num) + "e+2") + "e-2");
    return (Number.isNaN(newNum)) ? (num.toFixed(2) == 0) ? 0.00 : num.toFixed(2) : newNum;
}

function getAge(bday) {
    let dob = new Date(bday)
    let diff_ms = Date.now() - dob.getTime();
    let age_dt = new Date(diff_ms);
    let age = Math.abs(age_dt.getUTCFullYear() - 1970);
    return age;
}

function getUserDetails(req, res, filename, title) {
    path = '/api/borrowers/users/' + req.user.id;
    if (req.user.type == "Admin") path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
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

/**
 * GET /account
 * Accoun page.
 */
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
        return res.redirect('back');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
    path = '/api/users/' + req.user.id;
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
                    msg: 'There was an error when updating your username. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/borrowers/users/' + req.user.id;
                if (req.user.type == "Admin") path = '/api/admins/users/' + req.user.id;
                if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                                msg: 'There was an error when updating your profile. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: 'Profile information has been updated.'
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
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
};

const postProfilePic = (req, res) => {
    const upload = multerConfig.uploadImage.single('profilePic');
    upload(req, res, (err) => {
        if (err) {
            req.flash('errors', {
                msg: "File format should be JPG, JPEG, PNG and size should be no larger than 1 MB."
            });
            return res.redirect('back');
        }
        const validationErrors = [];
        if (validator.isEmpty(req.file.filename)) validationErrors.push({
            msg: 'Profile picture cannot be blank.'
        });
        if (validationErrors.length) {
            req.flash('errors', validationErrors);
            return res.redirect('back');
        }
        path = '/api/users/' + req.user.id;
        requestOptions = {
            url: `${apiOptions.server}${path}`,
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + req.user.token
            },
            json: {
                picture: {
                    originalname: req.file.originalname,
                    filename: req.file.filename,
                    contentType: req.file.mimetype
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
                        msg: 'There was an error when updating your profile picture. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    req.flash('success', {
                        msg: 'Profile picture has been updated.'
                    });
                    return res.redirect('back');
                } else {
                    req.flash('errors', {
                        msg: user.message
                    });
                    return res.redirect('back');
                }
            }
        );
    });
};

const postVerifyMobileNum = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.code)) validationErrors.push({
        msg: 'Code cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
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
                    msg: 'The verification code you entered is not correct. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/borrowers/users/' + req.user.id;
                if (req.user.type == "Admin") path = '/api/admins/users/' + req.user.id;
                if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                                msg: 'There was an error when updating your profile. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: 'Thank you for verifying your mobile number.'
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
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

const getVerifyEmail = (req, res) => {
    path = '/api/borrowers/setEmailToken/' + req.user.id;
    if (req.user.type == "Admin") path = '/api/admins/setEmailToken/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/setEmailToken/' + req.user.id;
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
                    msg: 'There was an error when updating your profile. Please try again later.'
                });
                return res.redirect('back');
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
                                msg: 'There was an error when sending the email verification message. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            req.flash('success', {
                                msg: `An e-mail has been sent to ${borrower.email} with further instructions.`
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: borrower.message
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
};

const getVerifyEmailToken = (req, res) => {
    const validationErrors = [];
    if (req.params.token && (!validator.isHexadecimal(req.params.token))) validationErrors.push({
        msg: 'Invalid Token.  Please retry.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/borrowers/validateEmailToken';
    if (req.user.type == "Admin") path = '/api/admins/validateEmailToken';
    if (req.user.type == "Employee") path = '/api/employees/validateEmailToken';
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
                    msg: 'There was an error when updating your profile. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('info', {
                    msg: 'Thank you for verifying your email address.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
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
        return res.redirect('back');
    }
    path = '/api/change/' + req.user.id;
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
                    msg: 'There was an error when updating your password. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Success! Your password has been changed.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
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
        return res.redirect('back');
    }
    path = '/api/users/' + req.user.id;
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
                    msg: 'There was an error when updating your password recovery questions. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Password Recovery Questions has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getVerifications = (req, res) => {
    getUserDetails(req, res, 'account/verifications', 'Account Management - Verifications');
};

const getVerificationsSubmit = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when updating your verification status. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Verification status has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getVerificationsCancel = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when updating your verification status. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Verification status has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDownloadBorrowerInfo = (req, res) => {
    let fonts = {
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

    function downloadNonMember(user, req, res) {
        let docDefinition = {
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
                                    text: parseDate(user.profile.dateOfBirth),
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
                                    text: (user.profile.address && user.profile.address.present) ? user.profile.address.present.unitNo + ' ' + user.profile.address.present.houseNo + ' ' + user.profile.address.present.street + ' ' + user.profile.address.present.subdivision + ' ' + user.profile.address.present.barangay + ' ' + user.profile.address.present.city + ' ' + user.profile.address.present.province : '',
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.profile.address && user.profile.address.present) ? user.profile.address.present.zipCode : '',
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
                                    text: (user.profile.address && user.profile.address.permanent) ? user.profile.address.permanent.unitNo + ' ' + user.profile.address.permanent.houseNo + ' ' + user.profile.address.permanent.street + ' ' + user.profile.address.permanent.subdivision + ' ' + user.profile.address.permanent.barangay + ' ' + user.profile.address.permanent.city + ' ' + user.profile.address.permanent.province : '',
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.profile.address && user.profile.address.permanent) ? user.profile.address.permanent.zipCode : '',
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
                                    text: (user.workBusinessInfo) ? user.workBusinessInfo.companyName : "",
                                    style: 'medium',
                                    border: [true, false, false, true],
                                    colSpan: 2
                                }, {},
                                {
                                    text: (user.workBusinessInfo) ? user.workBusinessInfo.department : "",
                                    style: 'medium',
                                    border: [true, false, true, true]
                                },
                                {
                                    text: (user.workBusinessInfo) ? '+(63) ' + user.workBusinessInfo.officePhone : "",
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
                                    text: (user.workBusinessInfo && user.workBusinessInfo.officeAddress) ? user.workBusinessInfo.officeAddress.unitNo + ' ' + user.workBusinessInfo.officeAddress.houseNo + ' ' + user.workBusinessInfo.officeAddress.street + ' ' + user.workBusinessInfo.officeAddress.subdivision + ' ' + user.workBusinessInfo.officeAddress.barangay + ' ' + user.workBusinessInfo.officeAddress.city + ' ' + user.workBusinessInfo.officeAddress.province : "",
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.officeAddress) ? user.workBusinessInfo.officeAddress.zipCode : "",
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Regular") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Regular\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Probation") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Probation\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Contractual") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Project Based") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Project Based\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Part-Time") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Part-Time\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Self-Employed/Freelancer") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Management") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Management\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Marketing") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Marketing\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Sales") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Sales\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Office Worker") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Office Worker\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Professional/Technical") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Professional/Technical\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Others") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Service/Reception") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Service/Reception\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Production Worker/Labor") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Production Worker/Labor\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Security/Guard/Maid") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Security/Guard/Maid\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Driver") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Driver\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.occupationType == "Self Employee/Freelance") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "BPO/IT/Communication/Mass Media") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  BPO/IT/Communication/Mass Media\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Transportation/Shipping/Real Estate") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Transportation/Shipping/Real Estate\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Government") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Government\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Trading/Export/Import/Wholesale") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Trading/Export/Import/Wholesale\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Medical/Education/School") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Medical/Education/School\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Agriculture/Forestry/Fisheries/Mining") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Retail Sale/Restaurant/Hotel/Tourism/Other Service") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Retail Sale/Restaurant/Hotel/Tourism/Other Service\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Bank/Insurance/Finance") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Bank/Insurance/Finance\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Construction/Maker/Manufacturing") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Construction/Maker/Manufacturing\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Electric/Gas/Waterworks") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Electric/Gas/Waterworks\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Security") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Security\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.businessType == "Others") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Director/Executive") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Director/Executive\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Officer") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Officer\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "None") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Supervisor") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Supervisor\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Staff") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Staff'
                                            }, ]
                                        }
                                    ]
                                },
                                {
                                    text: (user.workBusinessInfo) ? parseDate(user.workBusinessInfo.dateHired) : "",
                                    style: 'medium',
                                    border: [true, false, false, true]
                                },
                                {
                                    text: (user.workBusinessInfo) ? user.workBusinessInfo.monthlyIncome : "",
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
                            [(user.documents && user.documents.primaryIdFront && (user.documents.primaryIdFront.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.primaryIdFront.filename,
                                    width: 240,
                                    border: [true, false, false, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [true, false, false, false],
                                },
                                (user.documents && user.documents.primaryIdBack && (user.documents.primaryIdBack.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.primaryIdBack.filename,
                                    width: 240,
                                    border: [false, false, true, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [false, false, true, false],
                                }
                            ],
                            [{
                                text: 'COMPANY ID / COE',
                                style: 'small',
                                border: [true, false, true, false],
                                colSpan: 2
                            }, {}],
                            [(user.documents && (user.documents.companyIdFront || user.documents.coe)) ?
                                (user.documents.coe && (user.documents.coe.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.coe.filename,
                                    width: 240,
                                    border: [true, false, false, false],
                                    alignment: 'center'
                                } : (user.documents.companyIdFront && (user.documents.companyIdFront.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.companyIdFront.filename,
                                    width: 240,
                                    border: [true, false, false, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [true, false, false, false],
                                } : {
                                    text: '',
                                    border: [true, false, false, false],
                                }, (user.documents && user.documents.companyIdBack && (user.documents.companyIdBack.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.companyIdBack.filename,
                                    width: 240,
                                    border: [false, false, true, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                text: 'PAYSLIP / BIR 2316',
                                style: 'small',
                                border: [true, false, true, false],
                                colSpan: 2
                            }, {}],
                            [(user.documents && (user.documents.payslip1 || user.documents.bir)) ?
                                (user.documents.bir && (user.documents.bir.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.bir.filename,
                                    width: 240,
                                    border: [true, false, false, false],
                                    alignment: 'center'
                                } : (user.documents.payslip1 && (user.documents.payslip1.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.payslip1.filename,
                                    width: 240,
                                    border: [true, false, false, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [true, false, false, false],
                                } : {
                                    text: '',
                                    border: [true, false, false, false],
                                }, (user.documents && user.documents.payslip2 && (user.documents.payslip2.contentType).indexOf("image") != -1) ? {
                                    image: uploadFolder + user.documents.payslip2.filename,
                                    width: 250,
                                    border: [false, false, true, false],
                                    alignment: 'center'
                                } : {
                                    text: '',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                text: 'TIN PROOF',
                                style: 'small',
                                border: [true, false, true, false],
                                colSpan: 2
                            }, {}],
                            [(user.documents && user.documents.tinProof && (user.documents.tinProof.contentType).indexOf("image") != -1) ? {
                                image: uploadFolder + user.documents.tinProof.filename,
                                width: 250,
                                border: [true, false, true, false],
                                alignment: 'center',
                                colSpan: 2
                            } : {
                                text: '',
                                border: [true, false, true, false],
                                colSpan: 2
                            }, {}],
                            [{
                                text: 'SELFIE WITH ID',
                                style: 'small',
                                border: [true, false, true, false],
                                colSpan: 2
                            }, {}],
                            [(user.documents && user.documents.selfiewithId && (user.documents.selfiewithId.contentType).indexOf("image") != -1) ? {
                                image: uploadFolder + user.documents.selfiewithId.filename,
                                width: 250,
                                border: [true, false, true, false],
                                alignment: 'center',
                                colSpan: 2
                            } : {
                                text: '',
                                border: [true, false, true, false],
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
                                    text: 'ACCOUNT NO.',
                                    style: 'small',
                                    border: [true, false, true, false]
                                }
                            ],
                            [{
                                    text: (user.account) ? user.account.name : "",
                                    style: 'medium',
                                    border: [true, false, false, true]
                                },
                                {
                                    text: (user.account) ? user.account.number : "",
                                    style: 'medium',
                                    border: [true, false, true, true]
                                }
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
                                    image: (user.signature) ? user.signature : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADIAZADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
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
                                    text: (user.profile) ? (user.profile.firstName).toUpperCase() + ' ' + (user.profile.lastName).toUpperCase() : "",
                                    alignment: 'center',
                                    border: [false, false, false, false],
                                    colSpan: 3
                                }, {}, {},
                                {
                                    text: parseDate(new Date),
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
                },
                {
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
                                    text: (user.reviewedBy && user.reviewedBy.profile.firstName && user.reviewedBy.profile.lastName) ? (user.reviewedBy.profile.firstName).toUpperCase() + ' ' + (user.reviewedBy.profile.lastName).toUpperCase() : '',
                                    alignment: 'center',
                                    border: [false, false, false, false],
                                    colSpan: 3
                                }, {}, {},
                                {
                                    text: (user.reviewedDate) ? parseDate(user.reviewedDate) : "",
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
        res.set('Content-Disposition', `attachment; filename=form-non-member-` + user.borrowerNum + `.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadMember(user, req, res) {
        let docDefinition = {
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        'MEMBERSHIP APPLICATION FORM\n\n'
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
                                    text: 'TAX IDENTIFICATION NUMBER',
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
                                    text: parseDate(user.profile.dateOfBirth),
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
                                    text: user.profile.tin,
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
                                    text: (user.profile.address && user.profile.address.present) ? user.profile.address.present.unitNo + ' ' + user.profile.address.present.houseNo + ' ' + user.profile.address.present.street + ' ' + user.profile.address.present.subdivision + ' ' + user.profile.address.present.barangay + ' ' + user.profile.address.present.city + ' ' + user.profile.address.present.province : '',
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.profile.address && user.profile.address.present) ? user.profile.address.present.zipCode : '',
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
                                    text: (user.profile.address && user.profile.address.permanent) ? user.profile.address.permanent.unitNo + ' ' + user.profile.address.permanent.houseNo + ' ' + user.profile.address.permanent.street + ' ' + user.profile.address.permanent.subdivision + ' ' + user.profile.address.permanent.barangay + ' ' + user.profile.address.permanent.city + ' ' + user.profile.address.permanent.province : '',
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.profile.address && user.profile.address.permanent) ? user.profile.address.permanent.zipCode : '',
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
                                    text: (user.profile && user.profile.homePhoneNum) ? '+(63) ' + user.profile.homePhoneNum : "",
                                    style: 'medium',
                                    border: [false, false, true, true]
                                },
                                {
                                    text: (user.profile && user.profile.mobileNum) ? '+(63) ' + user.profile.mobileNum : "",
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
                        widths: ['*', '*'],
                        body: [
                            [{
                                    text: 'NAME OF SPOUSE',
                                    style: 'small',
                                    border: [true, false, true, false]
                                },
                                {
                                    text: 'E-MAIL ADDRESS',
                                    style: 'small',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                    text: user.profile.nameOfSpouse,
                                    style: 'medium',
                                    border: [true, false, true, true]
                                },
                                {
                                    text: user.profile.email,
                                    style: 'medium',
                                    border: [false, false, true, true]
                                }
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
                                    text: (user.workBusinessInfo && user.workBusinessInfo.companyName) ? user.workBusinessInfo.companyName : "",
                                    style: 'medium',
                                    border: [true, false, false, true],
                                    colSpan: 2
                                }, {},
                                {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.department) ? user.workBusinessInfo.department : "",
                                    style: 'medium',
                                    border: [true, false, true, true]
                                },
                                {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.officePhone) ? '+(63) ' + user.workBusinessInfo.officePhone : "",
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
                                    text: (user.workBusinessInfo && user.workBusinessInfo.officeAddress) ? user.workBusinessInfo.officeAddress.unitNo + ' ' + user.workBusinessInfo.officeAddress.houseNo + ' ' + user.workBusinessInfo.officeAddress.street + ' ' + user.workBusinessInfo.officeAddress.subdivision + ' ' + user.workBusinessInfo.officeAddress.barangay + ' ' + user.workBusinessInfo.officeAddress.city + ' ' + user.workBusinessInfo.officeAddress.province : "",
                                    style: 'medium',
                                    border: [true, false, true, true],
                                    colSpan: 5
                                }, {}, {}, {}, {},
                                {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.officeAddress) ? user.workBusinessInfo.officeAddress.zipCode : "",
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
                                    text: 'EMPLOYEE NO.',
                                    style: 'small',
                                    border: [true, false, true, false]
                                }
                            ],
                            [{
                                    style: 'item',
                                    border: [true, false, false, true],
                                    text: [{
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Director/Executive") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Director/Executive\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Officer") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Officer\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "None") ? checked : unchecked,
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
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Supervisor") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Supervisor\n'
                                            }, ]
                                        },
                                        {
                                            text: [{
                                                text: (user.workBusinessInfo && user.workBusinessInfo.position == "Staff") ? checked : unchecked,
                                                style: 'icon'
                                            }, {
                                                text: '  Staff'
                                            }, ]
                                        }
                                    ]
                                },
                                {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.dateHired) ? parseDate(user.workBusinessInfo.dateHired) : "",
                                    style: 'medium',
                                    border: [true, false, false, true]
                                },
                                {
                                    text: user.employeeID,
                                    style: 'medium',
                                    border: [true, false, true, true]
                                }
                            ]
                        ]
                    }
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
                                    text: 'ACCOUNT NO.',
                                    style: 'small',
                                    border: [true, false, true, false]
                                }
                            ],
                            [{
                                    text: (user.account) ? user.account.name : "",
                                    style: 'medium',
                                    border: [true, false, false, true]
                                },
                                {
                                    text: (user.account) ? user.account.number : "",
                                    style: 'medium',
                                    border: [true, false, true, true]
                                }
                            ],
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
        let beneficiariesTable = {
            table: {
                headerRows: 2,
                widths: ['*', '*', '*', '*', '*', '*', ],
                body: [
                    [{
                        text: 'BENEFICIARIES',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 6
                    }, {}, {}, {}, {}, {}],
                    [{
                            text: 'FULLNAME(First, Middle, Last)',
                            style: 'small',
                            border: [true, false, false, true],
                            alignment: 'center',
                            colSpan: 3
                        }, {}, {},
                        {
                            text: 'DATE OF BIRTH\n(mm/dd/yyyy)',
                            style: 'small',
                            alignment: 'center',
                            border: [true, false, false, true]
                        },
                        {
                            text: 'RELATIONSHIP TO THE MEMBER',
                            style: 'small',
                            alignment: 'center',
                            border: [true, false, true, true],
                            colSpan: 2
                        }, {}
                    ]
                ]
            },
            pageBreak: 'after'
        };
        let beneCount = 1;
        user.beneficiaries.forEach(d => {
            let beneficiarytRow = [{
                    text: beneCount + '. ' + d.fullName,
                    style: 'medium',
                    border: [true, false, false, true],
                    colSpan: 3
                }, {}, {},
                {
                    text: (d.dateOfBirth) ? parseDate(d.dateOfBirth) : "",
                    style: 'medium',
                    border: [true, false, false, true],
                },
                {
                    text: d.relationship,
                    style: 'medium',
                    border: [true, false, true, true],
                    colSpan: 2
                }, {}
            ];
            beneficiariesTable.table.body.push(beneficiarytRow);
        });
        let addtionalTable1 = {
            table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                    [{
                        text: 'FOR ACTIVE EMPLOYEE',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black'
                    }],
                    [{
                        text: 'CAPITAL BUILD-UP PLEDDGE',
                        bold: true,
                        border: [true, false, true, false],
                        alignment: 'center'
                    }],
                    [{
                        text: 'I declare that the information herein above written is correct, further I have read and understood the policies, rules, etc. of the Coop as contained in the website and other communication channels of the Calamba VMO Coop. I also agree to the terms and conditions therein contained.',
                        style: 'item',
                        border: [true, false, true, false],
                        alignment: 'justify'
                    }],
                    [{
                        text: 'I hereby subscribe to the Calamba VMO Multi-Purpose Cooperative common shares at P600 per share and my contribution per payday for continued capital build up is:',
                        style: 'item',
                        border: [true, false, true, false],
                        alignment: 'justify'
                    }],
                    [{
                        text: [{
                            text: (parseFloat(user.sharesPerPayDay) == 300.00) ? checked : unchecked,
                            style: 'icon'
                        }, {
                            text: '  ₱300 / per payday\t\t\t',
                            bold: true,
                            style: 'item'
                        }, {
                            text: (parseFloat(user.sharesPerPayDay) != 300.00 && parseFloat(user.sharesPerPayDay) > 0) ? checked : unchecked,
                            style: 'icon'
                        }, {
                            text: '  ________________ (amount of your choice)',
                            bold: true,
                            style: 'item',
                        }, ],
                        border: [true, false, true, false],
                        alignment: 'center'
                    }],
                    [{
                        text: 'This servers as an authorization for salary deduction for capital contribution and any future loan amortization to be paid to Calamba VMO Coop hereafter.',
                        style: 'item',
                        border: [true, false, true, false],
                        alignment: 'justify'
                    }]
                ]
            }
        };
        let addtionalTable2 = {
            table: {
                widths: ['*', '*', '*', '*', '*', '*', ],
                body: [
                    [{
                            text: '',
                            border: [true, false, false, false]
                        },
                        {
                            image: (user.signature) ? user.signature : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADIAZADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
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
                            text: (user.profile) ? (user.profile.firstName).toUpperCase() + ' ' + (user.profile.lastName).toUpperCase() : "",
                            alignment: 'center',
                            border: [false, false, false, false],
                            colSpan: 3
                        }, {}, {},
                        {
                            text: parseDate(new Date),
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
        };
        let addtionalTable3 = {
            table: {
                headerRows: 1,
                widths: ['*'],
                body: [
                    [{
                        text: 'FOR CALAMBA VMO COOP USE ONLY',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black'
                    }, ],
                    [{
                        text: [{
                                text: 'HRD CERTIFICATION',
                                bold: true,
                                decoration: 'underline',
                                style: 'medium',
                                alignment: 'center'
                            },
                            {
                                text: '\n(Please put a check on the employment status of Applicant)',
                                italic: true,
                                style: 'small',
                                alignment: 'center'
                            },
                            {
                                text: [{
                                    text: '\n\nI certify that the Applicant is a\t',
                                    style: 'item',
                                }, {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Regular") ? checked : unchecked,
                                    style: 'icon'
                                }, {
                                    text: '  PERMANENT\t',
                                    style: 'item'
                                }, {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.employmentType == "Probation") ? checked : unchecked,
                                    style: 'icon'
                                }, {
                                    text: '  PROBATIONARY',
                                    style: 'item',
                                }, {
                                    text: (user.workBusinessInfo && user.workBusinessInfo.companyName) ? '\temployee of ' + user.workBusinessInfo.companyName : '\temployee of\t',
                                    style: 'item'
                                }]
                            }

                        ],
                        border: [true, false, true, false]
                    }],
                    [{
                        columns: [{}, {}, {}, {
                            text: '\t\t\t\t(COMPANY NAME)\t\t\t\t',
                            style: 'item',
                            decoration: 'overline'
                        }],
                        alignment: 'left',
                        border: [true, false, true, false]
                    }]
                ]
            }
        };
        let addtionalTable4 = {
            table: {
                widths: ['*', '*', '*', '*', '*', '*', ],
                body: [
                    [{
                            text: '',
                            border: [true, false, false, false]
                        },
                        {
                            image: (user.hrCertifiedBy && user.hrCertifiedBy.signature) ? user.hrCertifiedBy.signature : 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCADIAZADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//Z',
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
                            text: (user.hrCertifiedBy && user.hrCertifiedBy.profile.firstName && user.hrCertifiedBy.profile.lastName) ? (user.hrCertifiedBy.profile.firstName).toUpperCase() + ' ' + (user.hrCertifiedBy.profile.lastName).toUpperCase() : '',
                            alignment: 'center',
                            border: [false, false, false, false],
                            colSpan: 3
                        }, {}, {},
                        {
                            text: (user.hrCertifiedDate) ? parseDate(user.hrCertifiedDate) : "",
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
        };
        let addtionalTable5 = {
            table: {
                widths: ['*', '*', '*', '*', '*', '*', ],
                body: [
                    [{
                        text: 'CALAMBA VMO COOP APPROVAL',
                        bold: true,
                        decoration: 'underline',
                        style: 'medium',
                        alignment: 'center',
                        border: [true, false, true, false],
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
                            text: (user.reviewedBy && user.reviewedBy.profile.firstName && user.reviewedBy.profile.lastName) ? (user.reviewedBy.profile.firstName).toUpperCase() + ' ' + (user.reviewedBy.profile.lastName).toUpperCase() : '',
                            alignment: 'center',
                            border: [false, false, false, false],
                            colSpan: 3
                        }, {}, {},
                        {
                            text: (user.reviewedDate) ? parseDate(user.reviewedDate) : "",
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
        };
        docDefinition.content.push(beneficiariesTable);
        docDefinition.content.push(addtionalTable1);
        docDefinition.content.push(addtionalTable2);
        docDefinition.content.push(addtionalTable3);
        docDefinition.content.push(addtionalTable4);
        docDefinition.content.push(addtionalTable5);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=form-member-` + user.borrowerNum + `.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    path = '/api/borrowers/' + req.params.borrowerid;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                if (user.type == "Non-Member") {
                    downloadNonMember(user, req, res);
                } else {
                    downloadMember(user, req, res);
                }

            } else {
                req.flash('errors', {
                    msg: user.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDownloadFiles = (req, res) => {
    const filename = req.params.filename;
    const originalname = req.params.originalname;
    res.download(uploadFolder + filename, originalname);
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
        return res.redirect('back');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when updating your personal information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Personal information has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getVerificationsAddress = (req, res) => {
    getUserDetails(req, res, 'account/address', 'Account Management - Verifications - Address');
};

const postVerificationsAddress = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when updating your address information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Address information has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getVerificationsFinancial = (req, res) => {
    getUserDetails(req, res, 'account/financial', 'Account Management - Verifications - Financial Questionnaire');
};

const postVerificationsFinancial = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
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
                name: req.body.accountName,
                number: req.body.accountNum
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
                    msg: 'There was an error when updating your work/business information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'Work/Business information has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getVerificationsDocuments = (req, res) => {
    getUserDetails(req, res, 'account/documents', 'Account Management - Verifications - Identity Documentation');
};

const postVerificationsDocuments = (req, res) => {
    const upload = multerConfig.uploadFiles.fields([{
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
    }]);
    upload(req, res, (err) => {
        if (err) {
            req.flash('errors', {
                msg: "File format should be PDF, JPG, PNG and size should be no larger than 5 MB."
            });
            return res.redirect('back');
        }
        path = '/api/borrowers/users/' + req.user.id;
        requestOptions = {
            url: `${apiOptions.server}${path}`,
            method: 'PUT',
            headers: {
                Authorization: 'Bearer ' + req.user.token
            },
            json: {
                documents: {
                    primaryIdFront: (req.files.primaryIdFront) ? {
                        originalname: req.files.primaryIdFront[0].originalname,
                        filename: req.files.primaryIdFront[0].filename,
                        contentType: req.files.primaryIdFront[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    primaryIdBack: (req.files.primaryIdBack) ? {
                        originalname: req.files.primaryIdBack[0].originalname,
                        filename: req.files.primaryIdBack[0].filename,
                        contentType: req.files.primaryIdBack[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    companyIdFront: (req.files.companyIdFront) ? {
                        originalname: req.files.companyIdFront[0].originalname,
                        filename: req.files.companyIdFront[0].filename,
                        contentType: req.files.companyIdFront[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    companyIdBack: (req.files.companyIdBack) ? {
                        originalname: req.files.companyIdBack[0].originalname,
                        filename: req.files.companyIdBack[0].filename,
                        contentType: req.files.companyIdBack[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    coe: (req.files.coe) ? {
                        originalname: req.files.coe[0].originalname,
                        filename: req.files.coe[0].filename,
                        contentType: req.files.coe[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    payslip1: (req.files.payslip1) ? {
                        originalname: req.files.payslip1[0].originalname,
                        filename: req.files.payslip1[0].filename,
                        contentType: req.files.payslip1[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    payslip2: (req.files.payslip2) ? {
                        originalname: req.files.payslip2[0].originalname,
                        filename: req.files.payslip2[0].filename,
                        contentType: req.files.payslip2[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    bir: (req.files.bir) ? {
                        originalname: req.files.bir[0].originalname,
                        filename: req.files.bir[0].filename,
                        contentType: req.files.bir[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    tinProof: (req.files.tinProof) ? {
                        originalname: req.files.tinProof[0].originalname,
                        filename: req.files.tinProof[0].filename,
                        contentType: req.files.tinProof[0].mimetype,
                        uploaded: new Date()
                    } : '',
                    selfiewithId: (req.files.selfiewithId) ? {
                        originalname: req.files.selfiewithId[0].originalname,
                        filename: req.files.selfiewithId[0].filename,
                        contentType: req.files.selfiewithId[0].mimetype,
                        uploaded: new Date()
                    } : ''
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
                        msg: 'There was an error when updating your documents. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    req.flash('success', {
                        msg: 'Documents have been updated.'
                    });
                    return res.redirect('back');
                } else {
                    req.flash('errors', {
                        msg: user.message
                    });
                    return res.redirect('back');
                }
            }
        );
    });
};

const getVerificationsDeclaration = (req, res) => {
    getUserDetails(req, res, 'account/declaration', 'Account Management - Verifications - KYC Declaration');
};

const postVerificationsDeclaration = (req, res) => {
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
        return res.redirect('back');
    }
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when updating your KYC declaration. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                req.flash('success', {
                    msg: 'KYC declaration has been updated.'
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getCredits = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/users/' + req.user.id;
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
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading your loan applications. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            res.render('account/credits', {
                                title: 'Account Management - Loans',
                                user: user,
                                loans: loans
                            });
                        } else {
                            req.flash('errors', {
                                msg: loans.message
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
};

const postCredits = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.loanAmount)) validationErrors.push({
        msg: 'Loan amount cannot be blank.'
    });
    if (req.body.loanAmount == 0) validationErrors.push({
        msg: 'Loan amount cannot be zero.'
    });
    if (req.body.loanAmount < 5000) validationErrors.push({
        msg: 'Required minimum loan amount is 5000.'
    });
    if (validator.isEmpty(req.body.purposeOfLoan)) validationErrors.push({
        msg: 'Purpose of loan cannot be blank.'
    });
    if (req.body.purposeOfLoan == "Others" && validator.isEmpty(req.body.purposeOfLoanOthers)) validationErrors.push({
        msg: 'Purpose of loan cannot be blank.'
    });
    if (validator.isEmpty(req.body.loanTerm)) validationErrors.push({
        msg: 'Loan term amount cannot be blank.'
    });
    if (req.body.termsAndCondition != 'true') validationErrors.push({
        msg: 'You must agree with the Terms and Condition.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/borrowers/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/users/' + req.user.id;
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
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading your loan applications. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            //validations
                            let totalUsedCreditLimit = (loans) ? loans.filter(({
                                status
                            }) => status != "Declined").reduce((a, b) => parseFloat(a) + parseFloat(b.principalRemaining), 0) : '0.00';
                            let remainingCreditLimit = ROUND(parseFloat(user.totalCreditLimit) - parseFloat(totalUsedCreditLimit));
                            if (parseFloat(req.body.loanAmount) <= parseFloat(remainingCreditLimit)) {
                                path = '/api/loans'
                                requestOptions = {
                                    url: `${apiOptions.server}${path}`,
                                    method: 'POST',
                                    headers: {
                                        Authorization: 'Bearer ' + req.user.token
                                    },
                                    json: {
                                        purposeOfLoan: (req.body.purposeOfLoan == "Others") ? req.body.purposeOfLoanOthers : req.body.purposeOfLoan,
                                        loanTerm: req.body.loanTerm,
                                        loanAmount: req.body.loanAmount,
                                        monthlyInterestRate: (user.type == "Member") ? 3 : 5,
                                        requestedBy: user._id
                                    }
                                };
                                request(
                                    requestOptions,
                                    (err, {
                                        statusCode
                                    }, loan) => {
                                        if (err) {
                                            req.flash('errors', {
                                                msg: 'There was an error when applying for new loan. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 201) {
                                            req.flash('success', {
                                                msg: "Your Personal Loan has been submitted successfully."
                                            });
                                            return res.redirect('back');
                                        } else {
                                            req.flash('errors', {
                                                msg: loan.message
                                            });
                                            return res.redirect('back');
                                        }
                                    }
                                );
                            } else {
                                req.flash('errors', {
                                    msg: "Invalid loan amount."
                                });
                                return res.redirect('back');
                            }
                        } else {
                            req.flash('errors', {
                                msg: loans.message
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
};

const getDownloadLoanSOA = (req, res) => {
    let fonts = {
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

    function download(data, req, res) {
        let statementDate = (data.currentDue && data.currentDue.dueDate) ? new Date(data.currentDue.dueDate) : '';
        if (statementDate) {
            statementDate.setDate(statementDate.getDate() - 24);
        }
        let principalBal = (data.currentDue && data.currentDue.principalBalance) ? (parseFloat(data.currentDue.principalBalance) - parseFloat(data.currentDue.principal)).toFixed(2) : "0.00";
        let interestBal = (data.currentDue && data.currentDue.interestBalance) ? (parseFloat(data.currentDue.interestBalance) - parseFloat(data.currentDue.interestAccrued)).toFixed(2) : "0.00";
        let totalBal = (data.currentDue && data.currentDue.amountDue) ? (parseFloat(data.currentDue.amountDue) + parseFloat(principalBal) + parseFloat(interestBal)).toFixed(2) : "0.00";
        let docDefinition = {
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        'LOAN STATEMENT\n\n'
                    ],
                    style: 'subheader'
                },
                {
                    table: {
                        widths: ['*', '*', '*', '*', '*'],
                        body: [
                            [{
                                    text: [{
                                            text: data.loan.requestedBy.profile.firstName + ' ' + data.loan.requestedBy.profile.lastName + '\n'
                                        },
                                        {
                                            text: (data.loan.requestedBy.profile.address && data.loan.requestedBy.profile.address.present && data.loan.requestedBy.profile.address.present.unitNo && data.loan.requestedBy.profile.address.present.houseNo && data.loan.requestedBy.profile.address.present.street) ? data.loan.requestedBy.profile.address.present.unitNo + ' ' + data.loan.requestedBy.profile.address.present.houseNo + ' ' + data.loan.requestedBy.profile.address.present.street + ',\n' : ''
                                        },
                                        {
                                            text: (data.loan.requestedBy.profile.address && data.loan.requestedBy.profile.address.present && data.loan.requestedBy.profile.address.present.subdivision && data.loan.requestedBy.profile.address.present.barangay) ? data.loan.requestedBy.profile.address.present.subdivision + ', ' + data.loan.requestedBy.profile.address.present.barangay + ',\n' : ''
                                        },
                                        {
                                            text: (data.loan.requestedBy.profile.address && data.loan.requestedBy.profile.address.present && data.loan.requestedBy.profile.address.present.city && data.loan.requestedBy.profile.address.present.province && data.loan.requestedBy.profile.address.present.zipCode) ? data.loan.requestedBy.profile.address.present.city + ', ' + data.loan.requestedBy.profile.address.present.province + ' ' + data.loan.requestedBy.profile.address.present.zipCode + '\n' : ''
                                        },
                                        {
                                            text: (data.loan.requestedBy.profile.mobileNum) ? '+63' + data.loan.requestedBy.profile.mobileNum + '\n' : ''
                                        },
                                    ],
                                    style: 'medium',
                                    border: [false, false, false, false],
                                    colSpan: 3
                                }, {}, {},
                                {
                                    text: [{
                                            text: 'Personal Loan\n'
                                        },
                                        {
                                            text: 'Loan No. ' + data.loan.loanNum + '\n'
                                        },
                                        {
                                            text: (data.currentDue && data.currentDue.dueDate) ? 'Total amount due ' + parseDate(data.currentDue.dueDate, 'short') + '\n' : ''
                                        },
                                        {
                                            text: (data.currentDue && data.currentDue.amountDue) ? '(₱) ' + (parseFloat(data.currentDue.amountDue)).toFixed(2) + '\n' : '(₱) 0.00\n',
                                            fontSize: 17,
                                            bold: true
                                        },
                                    ],
                                    style: 'medium',
                                    border: [false, false, false, false],
                                    colSpan: 2
                                }, {}
                            ]
                        ]
                    }
                },
                {
                    text: '\n'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [{
                                text: 'LOAN INFORMATION',
                                style: 'tableHeader',
                                alignment: 'center',
                                fillColor: 'black',
                                colSpan: 4,
                            }, {}, {}, {}],
                            [{
                                    text: 'Statement Date :',
                                    style: 'medium',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: (statementDate) ? parseDate(statementDate, 'short') : '',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }, {
                                    text: 'Loan Purpose :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.purposeOfLoan,
                                    style: 'medium',
                                    border: [false, false, true, false]
                                },

                            ],
                            [{
                                    text: 'Loan Status:',
                                    style: 'medium',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: data.loan.status,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Remaining Principal :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.principalRemaining)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                    text: 'Maturity Date:',
                                    style: 'medium',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: (data.loan.paymentEndDate) ? parseDate(data.loan.paymentEndDate, 'short') : '',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Interest Rate :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (parseFloat(data.loan.monthlyInterestRate)).toFixed(2) + '%',
                                    style: 'medium',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                    text: 'Principal Paid :',
                                    style: 'medium',
                                    border: [true, false, false, true]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalPrincipalPaid)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, true]
                                },
                                {
                                    text: 'Interest Paid :',
                                    style: 'medium',
                                    border: [false, false, false, true]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalInterestPaid)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, true, true]
                                }
                            ],

                        ]
                    }
                },
                {
                    text: '\n\n'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [{
                                text: 'STATEMENT OF ACCOUNT AS OF ' + (parseDate(new Date, 'short')).toUpperCase(),
                                style: 'tableHeader',
                                alignment: 'center',
                                fillColor: 'black',
                                colSpan: 4,
                            }, {}, {}, {}],
                            [{
                                    text: '',
                                    style: 'medium',
                                    border: [true, false, false, false]
                                },
                                {
                                    text: 'PAST DUE',
                                    style: 'medium',
                                    bold: true,
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
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
                                    text: 'Principal : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (data.pastDue && data.pastDue.principal) ? (parseFloat(data.pastDue.principal)).toFixed(2) : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
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
                                    text: 'Interest : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (data.pastDue && data.pastDue.interest) ? (parseFloat(data.pastDue.interest)).toFixed(2) : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
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
                                    text: 'CURRENT DUE',
                                    style: 'medium',
                                    bold: true,
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
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
                                    text: 'Principal : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (data.currentDue && data.currentDue.principal) ? (parseFloat(data.currentDue.principal)).toFixed(2) : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
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
                                    text: 'Interest : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (data.currentDue && data.currentDue.interestAccrued) ? (parseFloat(data.currentDue.interestAccrued)).toFixed(2) : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '',
                                    border: [false, false, true, false]
                                }
                            ],
                            [{
                                    text: (data.currentDue && data.currentDue.dueDate) ? 'Total Amount Due ' + parseDate(data.currentDue.dueDate, 'short') + ': ' : '',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [true, true, false, true],
                                    colSpan: 2
                                }, {},
                                {
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: (data.currentDue && data.currentDue.amountDue) ? (parseFloat(data.currentDue.amountDue)).toFixed(2) : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
                                    border: [true, true, true, true]
                                }
                            ],
                            [{
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: 'Amount Not Yet Due : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [false, true, false, true]
                                },
                                {
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: '',
                                    border: [true, true, true, true]
                                }
                            ],
                            [{
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: '',
                                    border: [false, true, false, true]
                                },
                                {
                                    text: 'Prinicipal : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: (data.currentDue) ? principalBal : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
                                    border: [true, true, true, true]
                                }
                            ],
                            [{
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: '',
                                    border: [false, true, false, true]
                                },
                                {
                                    text: 'Interest : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: (data.currentDue) ? interestBal : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
                                    border: [true, true, true, true]
                                }
                            ],
                            [{
                                    text: 'Total Amount of Obligation : ',
                                    style: 'item',
                                    alignment: 'right',
                                    border: [true, true, false, true],
                                    colSpan: 2
                                }, {},
                                {
                                    text: '',
                                    border: [true, true, false, true]
                                },
                                {
                                    text: (data.currentDue) ? totalBal : '0.00',
                                    style: 'medium',
                                    alignment: 'right',
                                    border: [true, true, true, true]
                                }
                            ],
                        ]
                    }
                },
                {
                    text: '\n\n'
                }
            ],
            styles: {
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
                    fontSize: 10,
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
        let repaymentsTable = {
            table: {
                headerRows: 2,
                widths: ['*', '*', '*', '*', '*', '*'],
                body: [
                    [{
                        text: 'REPAYMENTS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 6,
                    }, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Reference Code',
                            style: 'medium',
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Sender Number',
                            style: 'medium',
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        data.repayments.forEach(d => {
            if (d.type == "Repayments") {
                let repaymentRow = [{
                        text: d.transactionNum,
                        style: 'item',
                        border: [true, true, true, true]
                    },
                    {
                        text: parseDate(d.createdAt, 'short'),
                        style: 'item',
                        border: [true, true, true, true]
                    },
                    {
                        text: (parseFloat(d.amount)).toFixed(2),
                        style: 'item',
                        border: [true, true, true, true]
                    },
                    {
                        text: d.referenceNo,
                        style: 'item',
                        border: [true, true, true, true]
                    },
                    {
                        text: d.senderNum,
                        style: 'item',
                        border: [true, true, true, true]
                    },
                    {
                        text: (d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                        style: 'item',
                        border: [true, true, true, true]
                    }
                ];
                repaymentsTable.table.body.push(repaymentRow);
            }
        });
        docDefinition.content.push(repaymentsTable);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loan-soa-` + data.loan.loanNum + `.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    path = '/api/loans/' + req.params.loanid + '/due';
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
        }, currentDue) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading your loan current due. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/' + req.params.loanid + '/pastDue';
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
                    }, pastDue) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading your loan past due. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/loans/' + req.params.loanid;
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
                                }, loan) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading your loan statement of account. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/transactions/loans/' + req.params.loanid;
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
                                            }, repayments) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading your repayments. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    download({
                                                        loan: loan,
                                                        currentDue: currentDue,
                                                        repayments: repayments,
                                                        pastDue: pastDue,
                                                    }, req, res);
                                                } else {
                                                    req.flash('errors', {
                                                        msg: repayments.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: loan.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: pastDue.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: currentDue.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDownloadLoanSchedule = (req, res) => {
    let fonts = {
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

    function download(data, req, res) {
        let docDefinition = {
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        'LOAN REPAYMENT SCHEDULE\n\n'
                    ],
                    style: 'subheader'
                },
                {
                    table: {
                        widths: ['*', '*', '*', '*'],
                        body: [
                            [{
                                    text: 'Borrower Name :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.requestedBy.profile.firstName + ' ' + data.loan.requestedBy.profile.lastName,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }, {
                                    text: 'Borrower No: ',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.requestedBy.borrowerNum,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }

                            ],
                            [{
                                    text: 'Loan No :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.loanNum,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Loan Status :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.status,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Loan Purpose :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.purposeOfLoan,
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Loan Term :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: data.loan.loanTerm + ' months',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Loan Amount :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.loanAmount)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Application Date :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: parseDate(data.loan.createdAt, 'short'),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Service Fee :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.serviceFee)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Rate (per month) :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: (parseFloat(data.loan.monthlyInterestRate)).toFixed(2) + ' %',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'New Proceeds of Loan :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.newProceedsAmount)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Monthly Amortization :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.monthlyAmortization)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Total Payments :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalPayments)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Total Interest Accrued :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalInterestAccrued)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Total Principal Paid :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalPrincipalPaid)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Total Interest Paid :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.totalInterestPaid)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ],
                            [{
                                    text: 'Prinicipal Remaining :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.principalRemaining)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: 'Unpaid Interest :',
                                    style: 'medium',
                                    border: [false, false, false, false]
                                },
                                {
                                    text: '₱ ' + (parseFloat(data.loan.unpaidInterest)).toFixed(2),
                                    style: 'medium',
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    }
                },
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [{
                                text: '\n',
                                border: [false, true, false, false]
                            }],

                        ]
                    }
                },
            ],
            styles: {
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
                    fontSize: 10,
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
        let scheduleTable = {
            table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                body: [
                    [{
                            text: (data.loan.status == "Loan Release" || data.loan.status == "Open" || data.loan.status == "Fully Paid" || data.loan.status == "Loan Debt") ? 'Due Date' : 'Month',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Amount Due',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Interest',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Interest Paid',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Interest Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal Paid',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        data.loan.loanPaymentSchedule.forEach(d => {
            let scheduleRow = [{
                    text: (d.dueDate) ? parseDate(d.dueDate, 'short') : d.scheduleNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amountDue)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.paymentAmount) > 0 && d.paymentDate) ? parseDate(d.paymentDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.paymentAmount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.interest)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.interestPaid)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.interestBalance)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.principal)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.principalPaid)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.principalBalance)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            scheduleTable.table.body.push(scheduleRow);
        });
        docDefinition.content.push(scheduleTable);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loan-schedule-` + data.loan.loanNum + `.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }
    path = '/api/loans/' + req.params.loanid;
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
        }, loan) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading your loan schedule. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                download({
                    loan: loan
                }, req, res);
            } else {
                req.flash('errors', {
                    msg: loan.message
                });
                return res.redirect('back');
            }
        }
    );
};

const postRepayment = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.amount)) validationErrors.push({
        msg: 'Amount cannot be blank.'
    });
    if (validator.isEmpty(req.body.senderNum)) validationErrors.push({
        msg: 'Sender number cannot be blank.'
    });
    if (validator.isEmpty(req.body.postedBy)) validationErrors.push({
        msg: 'Receiver Name cannot be blank.'
    });
    if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
        msg: 'Reference no. cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/employees/' + req.body.postedBy;
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
        }, employee) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading list of employees. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/transactions';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {
                        amount: req.body.amount,
                        type: "Repayments",
                        message: req.body.message,
                        senderNum: req.body.senderNum,
                        receiverNum: employee.account.number,
                        postedBy: req.body.postedBy,
                        referenceNo: req.body.referenceNo,
                        loanId: req.params.loanid,
                        borrowerId: req.params.borrowerid
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, transaction) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when adding your repayment. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 201) {
                            req.flash('success', {
                                msg: "Successfully added new repayment."
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: transaction.message
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
};

const getBorrowers = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/borrowers';
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
                    }, borrowers) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of borrowers. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/employees';
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
                                }, employees) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading list of employees. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        res.render('account/borrowers', {
                                            title: 'Manage Borrowers',
                                            user: user,
                                            borrowers: borrowers,
                                            employees: employees
                                        });
                                    } else {
                                        req.flash('errors', {
                                            msg: employees.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: borrowers.message
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
};

const postBorrowers = (req, res) => {
    function sendMail(data) {
        path = '/api/sendMail';
        requestOptions = {
            url: `${apiOptions.server}${path}`,
            method: 'POST',
            json: {
                receiver: data.email,
                subject: 'VMO EZ Loan Account',
                message: `Hi, \n\nTo activate your account, follow these four (3) simple steps: \n 1. Click this url to access the site. (${process.env.BASE_URL}/login) \n 2. Log-on using these access credentials:\n\t USERNAME: \t ${data.username} \n\t\t These are your first name plus your birthdate in YYYYMMDD.\n\t PASSWORD: \t ${data.password} \n 3. Change the initial password provided to your preferred password. \n\n Thank you and welcome to VMO EZ Loan.`
            }
        };
        request(
            requestOptions,
            (err, {
                statusCode
            }, body) => {
                if (err) {
                    req.flash('warnings', {
                        msg: 'There was an error when sending the password to respective email. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    req.flash('success', {
                        msg: data.message
                    });
                    return res.redirect('back');
                } else {
                    req.flash('errors', {
                        msg: body.message
                    });
                    return res.redirect('back');
                }
            }
        );
    }
    const validationErrors = [];
    if (validator.isEmpty(req.body.type)) validationErrors.push({
        msg: 'Borrower type cannot be blank.'
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
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });
    if (req.body.type == 'Member') {
        if (validator.isEmpty(req.body.employeeID)) validationErrors.push({
            msg: 'Employee ID cannot be blank.'
        });
        if (validator.isEmpty(req.body.sharesPerPayDay)) validationErrors.push({
            msg: 'Shares/Payday cannot be blank.'
        });
        if (validator.equals(req.body.sharesPerPayDay, '0')) validationErrors.push({
            msg: 'Shares/Payday cannot be zero.'
        });
        if (validator.isEmpty(req.body.borrowerAcctNo)) validationErrors.push({
            msg: 'Borrower G-Cash No. cannot be blank.'
        });
        if (validator.isEmpty(req.body.postedBy)) validationErrors.push({
            msg: 'Assigned Loan Processor cannot be blank.'
        });
        if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
            msg: 'G-Cash Reference No. cannot be blank.'
        });
    }
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
    let username = usernameGen(req.body.firstName, req.body.dateOfBirth);
    let password = passwordGen();
    path = '/api/users';
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            username: username,
            password: CryptoJS.AES.encrypt(password, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when creating user account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 201) {
                let data;
                if (req.body.type == 'Member') {
                    data = {
                        type: req.body.type,
                        profile: {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            dateOfBirth: req.body.dateOfBirth,
                            gender: req.body.gender,
                            email: req.body.email,
                            mobileNum: req.body.mobileNum
                        },
                        employeeID: req.body.employeeID,
                        sharesPerPayDay: req.body.sharesPerPayDay,
                        account: {
                            number: req.body.borrowerAcctNo
                        }
                    };
                } else {
                    data = {
                        type: req.body.type,
                        profile: {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            dateOfBirth: req.body.dateOfBirth,
                            gender: req.body.gender,
                            email: req.body.email,
                            mobileNum: req.body.mobileNum
                        }
                    };
                }
                path = '/api/borrowers';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    },
                    json: data
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, newBorrower) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when creating borrower account. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 201) {
                            if (req.body.type == "Member") {
                                let bytes = CryptoJS.AES.decrypt(newBorrower.id, process.env.CRYPTOJS_SERVER_SECRET);
                                let originalUserId = bytes.toString(CryptoJS.enc.Utf8);
                                path = '/api/borrowers/users/' + originalUserId;
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
                                                msg: 'There was an error when borrower information. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 200) {
                                            let transaction = {};
                                            transaction.amount = "1000.00";
                                            transaction.type = "Fees";
                                            transaction.senderNum = borrower.account.number;
                                            transaction.status = "Posted";
                                            transaction.borrowerId = borrower._id;
                                            transaction.postedBy = req.body.postedBy;
                                            transaction.referenceNo = req.body.referenceNo;

                                            path = '/api/employees/' + transaction.postedBy;
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
                                                                Authorization: 'Bearer ' + req.user.token
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
                                                                            Authorization: 'Bearer ' + req.user.token
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
                                                                                sendMail({
                                                                                    username: username,
                                                                                    password: password,
                                                                                    email: req.body.email,
                                                                                    message: 'Success! New Borrower has been created, password has been sent to respective email and new transaction has been added.'
                                                                                });
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
                                sendMail({
                                    username: username,
                                    password: password,
                                    email: req.body.email,
                                    message: 'Success! New Borrower has been created and password has been sent to respective email.'
                                });
                            }
                        } else {
                            req.flash('errors', {
                                msg: newBorrower.message
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
};

const getDownloadBorrowersReport = (req, res) => {
    let fonts = {
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

    function downloadNonMembers(borrowers) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let borrowersTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF NON-MEMBERS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 11,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Borrower No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Age',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }, {
                            text: 'Mobile No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Email Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Date Hired',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Monthly Income',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Total Credit Limit',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Officer',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Status',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        borrowers.forEach(d => {
            let borrowerRow = [{
                    text: d.borrowerNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.firstName + ' ' + d.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: getAge(d.profile.dateOfBirth),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.mobileNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.email,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.profile.address && d.profile.address.present) ? d.profile.address.present.city + ' ' + d.profile.address.present.province : '',
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: (d.workBusinessInfo && d.workBusinessInfo.dateHired) ? parseDate(d.workBusinessInfo.dateHired) : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.workBusinessInfo && d.workBusinessInfo.monthlyIncome) ? d.workBusinessInfo.monthlyIncome : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.totalCreditLimit,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.reviewedBy) ? d.reviewedBy.profile.firstName + ' ' + d.reviewedBy.profile.lastName : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.status,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            borrowersTable.table.body.push(borrowerRow);
        });
        docDefinition.content.push(borrowersTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=non-members-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadMembers(borrowers) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let borrowersTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF MEMBERS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 11,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Borrower No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Employee ID',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }, {
                            text: 'Mobile No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Email Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Date Hired',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Shares/Payday',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Total Credit Limit',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },

                        {
                            text: 'Assigned Loan Officer',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Status',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        borrowers.forEach(d => {
            let borrowerRow = [{
                    text: d.borrowerNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.employeeID,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.firstName + ' ' + d.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.mobileNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.email,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.profile.address && d.profile.address.present) ? d.profile.address.present.city + ' ' + d.profile.address.present.province : '',
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: (d.workBusinessInfo && d.workBusinessInfo.dateHired) ? parseDate(d.workBusinessInfo.dateHired) : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.sharesPerPayDay,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.totalCreditLimit,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.reviewedBy) ? d.reviewedBy.profile.firstName + ' ' + d.reviewedBy.profile.lastName : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.status,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            borrowersTable.table.body.push(borrowerRow);
        });
        docDefinition.content.push(borrowersTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=members-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadBorrowers(borrowers) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let borrowersTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF BORROWERS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 10,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Borrower No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Age',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Type',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Mobile No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Email Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Address',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Total Credit Limit',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Officer',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Status',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        borrowers.forEach(d => {
            let borrowerRow = [{
                    text: d.borrowerNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.firstName + ' ' + d.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: getAge(d.profile.dateOfBirth),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.type,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.mobileNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.profile.email,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.profile.address && d.profile.address.present) ? d.profile.address.present.city + ' ' + d.profile.address.present.province : '',
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: d.totalCreditLimit,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.reviewedBy) ? d.reviewedBy.profile.firstName + ' ' + d.reviewedBy.profile.lastName : '',
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.status,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            borrowersTable.table.body.push(borrowerRow);
        });
        docDefinition.content.push(borrowersTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=borrowers-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    let userType = req.params.type;
    if (userType == 'non-members' || userType == 'members' || userType == 'all') {
        path = '/api/borrowers';
        if (userType == 'non-members') path = '/api/borrowers/type/Non-Member';
        if (userType == 'members') path = '/api/borrowers/type/Member';
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
            }, borrowers) => {
                if (err) {
                    req.flash('errors', {
                        msg: 'There was an error when loading list of borrowers. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    if (userType == 'non-members') downloadNonMembers(borrowers);
                    if (userType == 'members') downloadMembers(borrowers);
                    if (userType == 'all') downloadBorrowers(borrowers);
                } else {
                    req.flash('errors', {
                        msg: borrowers.message
                    });
                    return res.redirect('back');
                }
            }
        );
    } else {
        req.flash('errors', {
            msg: 'Not existing user type. Please enter correct user type.'
        });
        return res.redirect('/borrowers');
    }
};

const getDeleteBorrowers = (req, res) => {
    path = '/api/transactions/borrowers/' + req.params.borrowerid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, transactions) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting transactions record. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                path = '/api/loans/borrowers/' + req.params.borrowerid;
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {}
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when deleting loans record. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 204) {
                            path = '/api/withdrawals/borrowers/' + req.params.borrowerid;
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'DELETE',
                                headers: {
                                    Authorization: 'Bearer ' + req.user.token
                                },
                                json: {}
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, withdrawals) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when deleting withdrawals record. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 204) {
                                        path = '/api/borrowers/' + req.params.borrowerid;
                                        requestOptions = {
                                            url: `${apiOptions.server}${path}`,
                                            method: 'DELETE',
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
                                                        msg: 'There was an error when deleting borrower account. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 204) {
                                                    path = '/api/users/' + req.params.userid;
                                                    requestOptions = {
                                                        url: `${apiOptions.server}${path}`,
                                                        method: 'DELETE',
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
                                                                    msg: 'There was an error when deleting user account. Please try again later.'
                                                                });
                                                                return res.redirect('back');
                                                            } else if (statusCode === 204) {
                                                                req.flash('success', {
                                                                    msg: "Successfully deleting all borrower records."
                                                                });
                                                                return res.redirect('back');
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
                                                        msg: borrower.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: withdrawals.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: loans.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: transactions.message
                });
                return res.redirect('back');
            }
        }
    );
};

const postUpdateBorrowers = (req, res) => {
    path = '/api/borrowers/' + req.params.borrowerid;
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
                    msg: 'There was an error when loading borrower information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                if (borrower.status != "Declined") {
                    const validationErrors = [];
                    if (borrower.status != "Verified") {
                        if (validator.isEmpty(req.body.status)) validationErrors.push({
                            msg: 'Borrower status cannot be blank.'
                        });
                        if (req.body.status == "Verified") {
                            if (validator.isEmpty(req.body.reviewedBy)) validationErrors.push({
                                msg: 'Assigned Loan Officer cannot be blank.'
                            });
                        }
                        if (borrower.type == 'Member' && req.body.status == "Verified") {
                            if (validator.isEmpty(req.body.hrCertifiedBy)) validationErrors.push({
                                msg: 'HRD Authorized Officer cannot be blank.'
                            });
                        }
                    }
                    if (borrower.type == 'Member') {
                        if (validator.isEmpty(req.body.sharesPerPayDay)) validationErrors.push({
                            msg: 'Shares/Payday cannot be blank.'
                        });
                        if (validator.equals(req.body.sharesPerPayDay, '0')) validationErrors.push({
                            msg: 'Shares/Payday cannot be zero.'
                        });
                        if (req.body.status == "Verified") {
                            if (validator.isEmpty(req.body.employmentType)) validationErrors.push({
                                msg: 'Employment Type cannot be blank.'
                            });
                        }
                    }
                    if (req.body.status == "Verified") {
                        if (validator.isEmpty(req.body.totalCreditLimit)) validationErrors.push({
                            msg: 'Total Credit Limit cannot be blank.'
                        });
                        if (validator.equals(req.body.totalCreditLimit, '0')) validationErrors.push({
                            msg: 'Total Credit Limit cannot be zero.'
                        });
                    }
                    if (validationErrors.length) {
                        req.flash('errors', validationErrors);
                        return res.redirect('back');
                    }
                    path = '/api/borrowers/' + req.params.borrowerid;
                    requestOptions = {
                        url: `${apiOptions.server}${path}`,
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer ' + req.user.token
                        },
                        json: {
                            status: (borrower.status == 'Verified') ? borrower.status : req.body.status,
                            totalCreditLimit: (borrower.status == 'Verified') ? req.body.totalCreditLimit : (req.body.status == 'Verified') ? req.body.totalCreditLimit : '',
                            reviewedBy: (req.body.status == 'Verified') ? req.body.reviewedBy : '',
                            sharesPerPayDay: (borrower.type == 'Member') ? req.body.sharesPerPayDay : '',
                            hrCertifiedBy: (borrower.type == 'Member' && req.body.status == 'Verified') ? req.body.hrCertifiedBy : '',
                            workBusinessInfo: {
                                employmentType: (borrower.status == 'Verified') ? req.body.employmentType : (borrower.type == 'Member' && req.body.status == 'Verified') ? req.body.employmentType : ''
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
                                    msg: 'There was an error when updating borrower information. Please try again later.'
                                });
                                return res.redirect('back');
                            } else if (statusCode === 200) {
                                req.flash('success', {
                                    msg: 'Borrower information has been updated.'
                                });
                                return res.redirect('back');
                            } else {
                                req.flash('errors', {
                                    msg: borrower.message
                                });
                                return res.redirect('back');
                            }
                        }
                    );
                } else {
                    req.flash('errors', {
                        msg: 'Cannot update the borrower information.'
                    });
                    return res.redirect('back');
                }
            } else {
                req.flash('errors', {
                    msg: borrower.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getLoans = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans';
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
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of loans. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/employees';
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
                                }, employees) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading list of employees. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/borrowers';
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
                                            }, borrowers) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading list of borrowers. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    res.render('account/loans', {
                                                        title: 'Manage Loans',
                                                        user: user,
                                                        loans: loans,
                                                        employees: employees,
                                                        borrowers: borrowers
                                                    });
                                                } else {
                                                    req.flash('errors', {
                                                        msg: borrowers.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: employees.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: loans.message
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
};

const getBorrowerDetails = (req, res) => {
    path = '/api/borrowers/' + req.params.borrowerid;
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
                    msg: 'There was an error when loading borrower information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/borrowers/' + req.params.borrowerid;
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
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading loans by borrower information. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            let totalUsedCreditLimit = (loans.length >= 1) ? loans.filter(({
                                status
                            }) => status != "Declined").reduce((a, b) => parseFloat(a) + parseFloat(b.principalRemaining), 0) : 0;
                            let remainingCreditLimit = ROUND(parseFloat(borrower.totalCreditLimit) - parseFloat(totalUsedCreditLimit));
                            if (req.path.indexOf('view') != -1) {
                                path = '/api/admins/users/' + req.user.id;
                                if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                                                msg: 'There was an error when loading your account. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 200) {
                                            res.render('account/borrowers-details', {
                                                title: 'Manage Borrower Details',
                                                user: user,
                                                borrower: borrower,
                                                remainingCreditLimit: remainingCreditLimit,
                                                totalUsedCreditLimit: totalUsedCreditLimit
                                            });
                                        } else {
                                            req.flash('errors', {
                                                msg: user.message
                                            });
                                            return res.redirect('back');
                                        }
                                    }
                                );
                            } else {
                                return res
                                    .status(200)
                                    .json({
                                        borrower: borrower,
                                        remainingCreditLimit: remainingCreditLimit,
                                        totalUsedCreditLimit: totalUsedCreditLimit
                                    });
                            }
                        } else {
                            req.flash('errors', {
                                msg: loans.message
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
};

const getBorrowerLoans = (req, res) => {
    path = '/api/loans/' + req.params.loanid + '/due'
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
        }, currentDue) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading your loan current due. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/' + req.params.loanid;
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
                    }, loan) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading your loan details. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/borrowers/' + loan.requestedBy._id;
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
                                            msg: 'There was an error when loading borrower information. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/loans/borrowers/' + loan.requestedBy._id;;
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
                                            }, loans) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading loans by borrower information. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    let totalUsedCreditLimit = (loans.length >= 1) ? loans.filter(({
                                                        status
                                                    }) => status != "Declined").reduce((a, b) => parseFloat(a) + parseFloat(b.principalRemaining), 0) : 0;
                                                    let remainingCreditLimit = ROUND(parseFloat(borrower.totalCreditLimit) - parseFloat(totalUsedCreditLimit));
                                                    return res
                                                        .status(200)
                                                        .json({
                                                            loan: loan,
                                                            remainingCreditLimit: remainingCreditLimit,
                                                            currentDue: currentDue,
                                                        });
                                                } else {
                                                    req.flash('errors', {
                                                        msg: loans.message
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
                            req.flash('errors', {
                                msg: loan.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: currentDue.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getEmployeeDetails = (req, res) => {
    path = '/api/employees/' + req.params.employeeid;
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
        }, employee) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading employee information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                return res
                    .status(200)
                    .json(employee);
            } else {
                req.flash('errors', {
                    msg: employee.message
                });
                return res.redirect('back');
            }
        }
    );
};

const postLoans = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.borrowerID)) validationErrors.push({
        msg: 'Borrower Name amount cannot be blank.'
    });
    if (validator.isEmpty(req.body.loanAmount)) validationErrors.push({
        msg: 'Loan amount cannot be blank.'
    });
    if (req.body.loanAmount == 0) validationErrors.push({
        msg: 'Loan amount cannot be zero.'
    });
    if (req.body.loanAmount < 5000) validationErrors.push({
        msg: 'Required minimum loan amount is 5000.'
    });
    if (validator.isEmpty(req.body.purposeOfLoan)) validationErrors.push({
        msg: 'Purpose of loan cannot be blank.'
    });
    if (validator.isEmpty(req.body.loanTerm)) validationErrors.push({
        msg: 'Loan term amount cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/borrowers/' + req.body.borrowerID;
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
                    msg: 'There was an error when loading borrower information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/borrowers/' + req.body.borrowerID;
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
                    }, loans) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading loans by borrower information. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            //validations
                            let totalUsedCreditLimit = (loans.length >= 1) ? loans.filter(({
                                status
                            }) => status != "Declined").reduce((a, b) => parseFloat(a) + parseFloat(b.principalRemaining), 0) : 0;
                            let remainingCreditLimit = ROUND(parseFloat(borrower.totalCreditLimit) - parseFloat(totalUsedCreditLimit));
                            if (parseFloat(req.body.loanAmount) <= parseFloat(remainingCreditLimit)) {
                                path = '/api/loans'
                                requestOptions = {
                                    url: `${apiOptions.server}${path}`,
                                    method: 'POST',
                                    headers: {
                                        Authorization: 'Bearer ' + req.user.token
                                    },
                                    json: {
                                        purposeOfLoan: req.body.purposeOfLoan,
                                        loanTerm: req.body.loanTerm,
                                        loanAmount: req.body.loanAmount,
                                        monthlyInterestRate: (borrower.type == "Member") ? 3 : 5,
                                        requestedBy: req.body.borrowerID
                                    }
                                };
                                request(
                                    requestOptions,
                                    (err, {
                                        statusCode
                                    }, loan) => {
                                        if (err) {
                                            req.flash('errors', {
                                                msg: 'There was an error when creating new loan. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 201) {
                                            req.flash('success', {
                                                msg: "New Loan has been submitted successfully."
                                            });
                                            return res.redirect('back');
                                        } else {
                                            req.flash('errors', {
                                                msg: loan.message
                                            });
                                            return res.redirect('back');
                                        }
                                    }
                                );
                            } else {
                                req.flash('errors', {
                                    msg: "Invalid loan amount."
                                });
                                return res.redirect('back');
                            }
                        } else {
                            req.flash('errors', {
                                msg: loans.message
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
};

const getDeleteLoans = (req, res) => {
    path = '/api/transactions/loans/' + req.params.loanid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, transactions) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting transactions record. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                path = '/api/loans/' + req.params.loanid;
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {}
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, body) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when deleting loan application. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 204) {
                            req.flash('success', {
                                msg: "Successfully deleting loan application and all transactions."
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: body.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: transactions.message
                });
                return res.redirect('back');
            }
        }
    );
};

const postUpdateLoans = (req, res) => {
    path = '/api/loans/' + req.params.loanid + '/due'
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
        }, currentDue) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading your loan current due. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/' + req.params.loanid;
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
                    }, loan) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading loan information. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            if (loan.status != "Fully Paid" || loan.status != "Declined") {
                                const validationErrors = [];
                                if (loan.status == "Processing" && validator.isEmpty(req.body.reviewedBy)) validationErrors.push({
                                    msg: 'Assigned Loan Officer cannot be blank.'
                                });
                                if (validator.isEmpty(req.body.status)) validationErrors.push({
                                    msg: 'Loan status cannot be blank.'
                                });
                                if (req.body.status == "Loan Release" || req.body.status == "Fully Paid") {
                                    if (validator.isEmpty(req.body.postedBy)) validationErrors.push({
                                        msg: 'Assigned Loan Processor cannot be blank.'
                                    });
                                    if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
                                        msg: 'Reference No. cannot be blank.'
                                    });
                                }
                                if (validationErrors.length) {
                                    req.flash('errors', validationErrors);
                                    return res.redirect('back');
                                }
                                path = '/api/loans/' + req.params.loanid;
                                requestOptions = {
                                    url: `${apiOptions.server}${path}`,
                                    method: 'PUT',
                                    headers: {
                                        Authorization: 'Bearer ' + req.user.token
                                    },
                                    json: {
                                        status: req.body.status,
                                        reviewedBy: (loan.status == "Processing") ? req.body.reviewedBy : ''
                                    }
                                };
                                request(
                                    requestOptions,
                                    (err, {
                                        statusCode
                                    }, updatedLoan) => {
                                        if (err) {
                                            req.flash('errors', {
                                                msg: 'There was an error when updating loan application. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 200) {
                                            if (req.body.status == "Loan Release" || req.body.status == "Fully Paid") {
                                                let transaction = {};
                                                transaction.amount = (req.body.status == "Loan Release") ? '-' + loan.newProceedsAmount : ROUND(parseFloat(currentDue.principalBalance) + parseFloat(currentDue.interestBalance));
                                                transaction.type = (req.body.status == "Loan Release") ? "Release" : "Repayments";
                                                transaction.receiverNum = (req.body.status == "Loan Release") ? (loan.requestedBy.account && loan.requestedBy.account.number) ? loan.requestedBy.account.number : '' : '';
                                                transaction.senderNum = (req.body.status == "Fully Paid") ? (loan.requestedBy.account && loan.requestedBy.account.number) ? loan.requestedBy.account.number : '' : '';
                                                transaction.status = "Posted";
                                                transaction.borrowerId = loan.requestedBy._id;
                                                transaction.loanId = loan._id;
                                                transaction.postedBy = req.body.postedBy;
                                                transaction.referenceNo = req.body.referenceNo;

                                                path = '/api/employees/' + transaction.postedBy;
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
                                                    }, employee) => {
                                                        if (err) {
                                                            req.flash('errors', {
                                                                msg: 'There was an error when loading employee information. Please try again later.'
                                                            });
                                                            return res.redirect('back');
                                                        } else if (statusCode === 200) {
                                                            transaction.receiverNum = (req.body.status == "Fully Paid") ? (employee.account && employee.account.number) ? employee.account.number : '' : transaction.receiverNum;
                                                            transaction.senderNum = (req.body.status == "Loan Release") ? (employee.account && employee.account.number) ? employee.account.number : '' : transaction.senderNum;

                                                            path = '/api/transactions';
                                                            requestOptions = {
                                                                url: `${apiOptions.server}${path}`,
                                                                method: 'POST',
                                                                headers: {
                                                                    Authorization: 'Bearer ' + req.user.token
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
                                                                            msg: 'There was an error when adding new transaction. Please try again later.'
                                                                        });
                                                                        return res.redirect('back');
                                                                    } else if (statusCode === 201) {
                                                                        if (req.body.status == "Fully Paid") {
                                                                            path = '/api/loans/' + transaction.loanId + '/schedules';
                                                                            requestOptions = {
                                                                                url: `${apiOptions.server}${path}`,
                                                                                method: 'PUT',
                                                                                headers: {
                                                                                    Authorization: 'Bearer ' + req.user.token
                                                                                },
                                                                                json: {
                                                                                    transactionDate: parseDate(new Date),
                                                                                    transactionAmount: transaction.amount
                                                                                }
                                                                            };
                                                                            request(
                                                                                requestOptions,
                                                                                (err, {
                                                                                    statusCode
                                                                                }, updatedLoan) => {
                                                                                    if (err) {
                                                                                        req.flash('errors', {
                                                                                            msg: 'There was an error when adding new repayment. Please try again later.'
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    } else if (statusCode === 200) {
                                                                                        req.flash('success', {
                                                                                            msg: "Loan application has been updated successfully. New transaction has been added successfully. New repayment has been added successfully."
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    } else {
                                                                                        req.flash('errors', {
                                                                                            msg: updatedLoan.message
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    }
                                                                                }
                                                                            );
                                                                        } else {
                                                                            path = '/api/sendMail';
                                                                            requestOptions = {
                                                                                url: `${apiOptions.server}${path}`,
                                                                                method: 'POST',
                                                                                json: {
                                                                                    receiver: loan.requestedBy.profile.email,
                                                                                    subject: 'Your VMO EZ Loan application has been approved and released',
                                                                                    message: `Hello,\n\nThis is a confirmation that the loan application #${loan.loanNum} amounting of ${loan.loanAmount} has just been approved and release.\nPlease check your G-Cash wallet if it is credited.\n\nCheck our website for the list of account numbers for repayments. (${process.env.BASE_URL}/login) \n\n Thank you.\n`
                                                                                }
                                                                            };
                                                                            request(
                                                                                requestOptions,
                                                                                (err, {
                                                                                    statusCode
                                                                                }, body) => {
                                                                                    if (err) {
                                                                                        req.flash('warnings', {
                                                                                            msg: 'Loan has been updated, however we were unable to send a confirmation email to the recipient. We will be looking into it shortly.'
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    } else if (statusCode === 200) {
                                                                                        req.flash('success', {
                                                                                            msg: "Loan application has been updated successfully. New transaction has been added successfully. Email has been sent to respective email."
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    } else {
                                                                                        req.flash('errors', {
                                                                                            msg: body.message
                                                                                        });
                                                                                        return res.redirect('back');
                                                                                    }
                                                                                }
                                                                            );
                                                                        }
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
                                            } else if (req.body.status == "Declined") {
                                                path = '/api/sendMail';
                                                requestOptions = {
                                                    url: `${apiOptions.server}${path}`,
                                                    method: 'POST',
                                                    json: {
                                                        receiver: loan.requestedBy.profile.email,
                                                        subject: 'Your VMO EZ Loan application has been declined',
                                                        message: `Hello,\n\nWe are sorry to inform you that your loan application #${loan.loanNum} amounting of ${loan.loanAmount} has just been declined.\n \n\n Thank you.\n`
                                                    }
                                                };
                                                request(
                                                    requestOptions,
                                                    (err, {
                                                        statusCode
                                                    }, body) => {
                                                        if (err) {
                                                            req.flash('warnings', {
                                                                msg: 'Loan has been updated, however we were unable to send a confirmation email to the recipient. We will be looking into it shortly.'
                                                            });
                                                            return res.redirect('back');
                                                        } else if (statusCode === 200) {
                                                            req.flash('success', {
                                                                msg: "Loan application has been updated successfully. Email has been sent to respective email."
                                                            });
                                                            return res.redirect('back');
                                                        } else {
                                                            req.flash('errors', {
                                                                msg: body.message
                                                            });
                                                            return res.redirect('back');
                                                        }
                                                    }
                                                );
                                            } else {
                                                req.flash('success', {
                                                    msg: "Loan application has been updated successfully."
                                                });
                                                return res.redirect('back');
                                            }
                                        } else {
                                            req.flash('errors', {
                                                msg: updatedLoan.message
                                            });
                                            return res.redirect('back');
                                        }
                                    }
                                );
                            } else {
                                req.flash('errors', {
                                    msg: 'Cannot update the loan application.'
                                });
                                return res.redirect('back');
                            }
                        } else {
                            req.flash('errors', {
                                msg: loan.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: currentDue.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getLoanDetails = (req, res) => {
    path = '/api/borrowers/users/' + req.user.id;
    if (req.user.type == "Admin") path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/loans/' + req.params.loanid + '/due';
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
                    }, currentDue) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading your loan current due. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/loans/' + req.params.loanid;
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
                                }, loan) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading your loan details. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/transactions/loans/' + req.params.loanid;
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
                                            }, repayments) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading your repayments. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    path = '/api/employees';
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
                                                        }, employees) => {
                                                            if (err) {
                                                                req.flash('errors', {
                                                                    msg: 'There was an error when loading list of employees. Please try again later.'
                                                                });
                                                                return res.redirect('back');
                                                            } else if (statusCode === 200) {
                                                                res.render('account/loans-details', {
                                                                    title: 'Account Management - Loan Details',
                                                                    user: user,
                                                                    loan: loan,
                                                                    schedule: currentDue,
                                                                    repayments: repayments,
                                                                    employees: employees
                                                                });
                                                            } else {
                                                                req.flash('errors', {
                                                                    msg: employees.message
                                                                });
                                                                return res.redirect('back');
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    req.flash('errors', {
                                                        msg: repayments.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: loan.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: currentDue.message
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
};

const getDownloadLoansReport = (req, res) => {
    let fonts = {
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

    function downloadLoans(loans) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let loansTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF LOANS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 10,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Loan No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Type',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Purpose of Loan',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Release Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Maturity Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Monthly Payment',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Status',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        loans.forEach(d => {
            let date = (new Date(d.paymentStartDate)).toString().split(' ');
            let paymentStartDate = (d.paymentStartDate) ? date[1] + ' ' + date[2] + ', ' + date[3] : "";
            let date2 = (new Date(d.paymentEndDate)).toString().split(' ');
            let paymentEndDate = (d.paymentEndDate) ? date2[1] + ' ' + date2[2] + ', ' + date2[3] : "";
            let loanRow = [{
                    text: d.loanNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.profile.firstName + ' ' + d.requestedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.type,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.purposeOfLoan,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: paymentStartDate,
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: paymentEndDate,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanAmount,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.monthlyAmortization,
                    style: 'item',
                    border: [true, true, true, true]
                },

                {
                    text: d.principalRemaining,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.status,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            loansTable.table.body.push(loanRow);
        });
        docDefinition.content.push(loansTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loans-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadMaturityLoans(loans) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let loansTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF PAST MATURITY DATE',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 11,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Loan No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Type',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Purpose of Loan',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Release Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Maturity Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Monthly Payment',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Interest Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Total Amount Due',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        loans.forEach(d => {
            let date = (new Date(d.paymentStartDate)).toString().split(' ');
            let paymentStartDate = (d.paymentStartDate) ? date[1] + ' ' + date[2] + ', ' + date[3] : "";
            let date2 = (new Date(d.paymentEndDate)).toString().split(' ');
            let paymentEndDate = (d.paymentEndDate) ? date2[1] + ' ' + date2[2] + ', ' + date2[3] : "";
            let balance = (parseFloat(d.loanPaymentSchedule[0].principalBalance) + parseFloat(d.loanPaymentSchedule[0].interestBalance)).toFixed(2);
            let loanRow = [{
                    text: d.loanNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.profile.firstName + ' ' + d.requestedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.type,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.purposeOfLoan,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: paymentStartDate,
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: paymentEndDate,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanAmount,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.monthlyAmortization,
                    style: 'item',
                    border: [true, true, true, true]
                },

                {
                    text: d.loanPaymentSchedule[0].principalBalance,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanPaymentSchedule[0].interestBalance,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: balance,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            loansTable.table.body.push(loanRow);
        });
        docDefinition.content.push(loansTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loans-maturity-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadCurrentLoans(loans) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let loansTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF CURRENT DUE',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 12,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Loan No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Type',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Purpose of Loan',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Release Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Maturity Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Due Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Amount Due',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Interest',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Principal Balance',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        loans.forEach(d => {
            let date = (new Date(d.paymentStartDate)).toString().split(' ');
            let paymentStartDate = (d.paymentStartDate) ? date[1] + ' ' + date[2] + ', ' + date[3] : "";
            let date2 = (new Date(d.paymentEndDate)).toString().split(' ');
            let paymentEndDate = (d.paymentEndDate) ? date2[1] + ' ' + date2[2] + ', ' + date2[3] : "";
            let date3 = (new Date(d.loanPaymentSchedule[0].dueDate)).toString().split(' ');
            let dueDate = (d.loanPaymentSchedule[0].dueDate) ? date3[1] + ' ' + date3[2] + ', ' + date3[3] : "";
            let loanRow = [{
                    text: d.loanNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.profile.firstName + ' ' + d.requestedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.type,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.purposeOfLoan,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: paymentStartDate,
                    style: 'item',
                    border: [true, true, true, true]
                }, {
                    text: paymentEndDate,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanAmount,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: dueDate,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanPaymentSchedule[0].amountDue,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanPaymentSchedule[0].interest,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanPaymentSchedule[0].principal,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanPaymentSchedule[0].principalBalance,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            loansTable.table.body.push(loanRow);
        });
        docDefinition.content.push(loansTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loans-current-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    let loanType = req.params.type;
    if (loanType == 'maturityDue' || loanType == 'currentDue' || loanType == 'all') {
        path = '/api/loans';
        if (loanType == 'maturityDue') path = '/api/loans/pastMaturity/repayments';
        if (loanType == 'currentDue') path = '/api/loans/due/repayments';
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
            }, loans) => {
                if (err) {
                    req.flash('errors', {
                        msg: 'There was an error when loading list of loans. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    if (loanType == 'all') downloadLoans(loans);
                    if (loanType == 'maturityDue') downloadMaturityLoans(loans);
                    if (loanType == 'currentDue') downloadCurrentLoans(loans);
                } else {
                    req.flash('errors', {
                        msg: loans.message
                    });
                    return res.redirect('back');
                }
            }
        );
    } else {
        req.flash('errors', {
            msg: 'Not existing loan type. Please enter correct loan type.'
        });
        return res.redirect('/loans');
    }
};

const getTransactions = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/transactions';
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
                    }, transactions) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of transactions. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/employees';
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
                                }, employees) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading list of employees. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/borrowers';
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
                                            }, borrowers) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading list of borrowers. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    res.render('account/transactions', {
                                                        title: 'Manage Transactions',
                                                        user: user,
                                                        borrowers: borrowers,
                                                        employees: employees,
                                                        transactions: transactions
                                                    });
                                                } else {
                                                    req.flash('errors', {
                                                        msg: borrowers.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: employees.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: transactions.message
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
};

const postTransactions = (req, res) => {
    const validationErrors = [];
    let data = {};
    data.type = req.body.type;
    data.message = req.body.message;
    data.postedBy = req.body.postedBy;
    data.referenceNo = req.body.referenceNo;
    data.status = "Posted"
    if (validator.isEmpty(req.body.type)) validationErrors.push({
        msg: 'Transaction type cannot be blank.'
    });
    if (req.body.amount) {
        if (validator.isEmpty(req.body.amount)) validationErrors.push({
            msg: 'Amount cannot be blank.'
        });
    }
    if (req.body.type == "Contributions") {
        if (validator.isEmpty(req.body.borrowerName)) validationErrors.push({
            msg: 'Borrower Name cannot be blank.'
        });
    }
    if (validator.isEmpty(req.body.postedBy)) validationErrors.push({
        msg: 'Assigned Loan Processor cannot be blank.'
    });
    if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
        msg: 'Reference No. cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/employees/' + req.body.postedBy;
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
        }, employee) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading employee information. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                if (req.body.type == "Contributions") {
                    path = '/api/borrowers/' + req.body.borrowerName;
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
                                    msg: 'There was an error when borrowers information. Please try again later.'
                                });
                                return res.redirect('back');
                            } else if (statusCode === 200) {
                                data.amount = req.body.amount;
                                data.senderNum = (borrower.account.number) ? borrower.account.number : borrower.profile.mobileNum;
                                data.receiverNum = employee.account.number;
                                data.borrowerId = borrower._id;
                                path = '/api/transactions';
                                requestOptions = {
                                    url: `${apiOptions.server}${path}`,
                                    method: 'POST',
                                    headers: {
                                        Authorization: 'Bearer ' + req.user.token
                                    },
                                    json: data
                                };
                                request(
                                    requestOptions,
                                    (err, {
                                        statusCode
                                    }, transaction) => {
                                        if (err) {
                                            req.flash('errors', {
                                                msg: 'There was an error when adding new transaction. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 201) {
                                            req.flash('success', {
                                                msg: "Transactions has been added successfully."
                                            });
                                            return res.redirect('back');
                                        } else {
                                            req.flash('errors', {
                                                msg: transaction.message
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
                    data.amount = '-' + req.body.amount;
                    data.senderNum = employee.account.number;
                    data.receiverNum = employee.account.number;
                    path = '/api/transactions';
                    requestOptions = {
                        url: `${apiOptions.server}${path}`,
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + req.user.token
                        },
                        json: data
                    };
                    request(
                        requestOptions,
                        (err, {
                            statusCode
                        }, transaction) => {
                            if (err) {
                                req.flash('errors', {
                                    msg: 'There was an error when adding new transaction. Please try again later.'
                                });
                                return res.redirect('back');
                            } else if (statusCode === 201) {
                                req.flash('success', {
                                    msg: "Transactions has been added successfully."
                                });
                                return res.redirect('back');
                            } else {
                                req.flash('errors', {
                                    msg: transaction.message
                                });
                                return res.redirect('back');
                            }
                        }
                    );
                }
            } else {
                req.flash('errors', {
                    msg: employee.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getTransactionDetails = (req, res) => {
    path = '/api/transactions/' + req.params.transactionid;
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
        }, transactions) => {
            if (err) {
                return res
                    .status(404)
                    .json('There was an error when loading transaction record. Please try again later.');
            } else if (statusCode === 200) {
                return res
                    .status(200)
                    .json(transactions);
            } else {
                return res
                    .status(404)
                    .json(transactions.message);
            }
        }
    );
};

const postUpdateTransactions = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.status)) validationErrors.push({
        msg: 'Transaction status cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/transactions/' + req.params.transactionid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            status: req.body.status
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, transaction) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating the transaction record. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/transactions/' + req.params.transactionid;
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
                    }, updatedTransaction) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading the transaction record. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            if (updatedTransaction.type == "Repayments" && updatedTransaction.status == "Posted") {
                                path = '/api/loans/' + updatedTransaction.loanId + '/schedules';
                                requestOptions = {
                                    url: `${apiOptions.server}${path}`,
                                    method: 'PUT',
                                    headers: {
                                        Authorization: 'Bearer ' + req.user.token
                                    },
                                    json: {
                                        transactionDate: updatedTransaction.createdAt,
                                        transactionAmount: updatedTransaction.amount
                                    }
                                };
                                request(
                                    requestOptions,
                                    (err, {
                                        statusCode
                                    }, updatedLoan) => {
                                        if (err) {
                                            req.flash('errors', {
                                                msg: 'There was an error when adding new repayment. Please try again later.'
                                            });
                                            return res.redirect('back');
                                        } else if (statusCode === 200) {
                                            req.flash('success', {
                                                msg: "Transaction has been updated successfully. New repayment has been added successfully."
                                            });
                                            return res.redirect('back');
                                        } else {
                                            req.flash('errors', {
                                                msg: updatedLoan.message
                                            });
                                            return res.redirect('back');
                                        }
                                    }
                                );
                            } else {
                                req.flash('success', {
                                    msg: "Transaction has been updated successfully."
                                });
                                return res.redirect('back');
                            }
                        } else {
                            req.flash('errors', {
                                msg: updatedTransaction.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: transaction.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDeleteTransactions = (req, res) => {
    path = '/api/transactions/' + req.params.transactionid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, transactions) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting transaction record. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                req.flash('success', {
                    msg: "Successfully deleting transaction record."
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: transactions.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDownloadTransactionsReport = (req, res) => {
    let fonts = {
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

    function downloadTransactions(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF TRANSACTIONS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 9,
                    }, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Transaction Type',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Sender No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Message',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.type,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.senderNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.message,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=transactions-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadLoansRelease(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF LOANS RELEASE',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 10,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Loan No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Purpose of Loan',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower G-Cash No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanId.loanNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanId.purposeOfLoan,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.profile.firstName + ' ' + d.borrowerId.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.receiverNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=loans-release-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadRepayments(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF REPAYMENTS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 9,
                    }, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Loan No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower G-Cash No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.loanId.loanNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.profile.firstName + ' ' + d.borrowerId.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.senderNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=repayments-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadContributions(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF CONTRIBUTIONS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 10,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower G-Cash No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Message',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.borrowerNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.profile.firstName + ' ' + d.borrowerId.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.senderNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.message,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=contributions-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadWithdrawals(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF WITHDRAWAL REQUESTS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 10,
                    }, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Withdrawal Request No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Reason',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower G-Cash No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.withdrawalId.withdrawalNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.withdrawalId.reason,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.profile.firstName + ' ' + d.borrowerId.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.receiverNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=withdrawals-request-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadFees(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                body: [
                    [{
                        text: 'LIST OF MEMBERSHIP FEES',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 9,
                    }, {}, {}, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Payment Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Borrower G-Cash No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.borrowerNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.borrowerId.profile.firstName + ' ' + d.borrowerId.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.senderNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status == "Posted" && d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=fees-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    function downloadExpenses(transactions) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let transactionsTable = {
            table: {
                headerRows: 2,
                widths: ['*', '*', '*', '*', '*', '*', '*'],
                body: [
                    [{
                        text: 'LIST OF EXPENSES',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 7,
                    }, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Transaction No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Assigned Loan Processor',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Transaction Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'G-Cash Reference No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Message',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Posted Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        transactions.forEach(d => {
            let transactionRow = [{
                    text: d.transactionNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.postedBy.profile.firstName + ' ' + d.postedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (parseFloat(d.amount)).toFixed(2),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.referenceNo,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.message,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.postedDate) ? parseDate(d.postedDate, 'short') : '',
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            transactionsTable.table.body.push(transactionRow);
        });
        docDefinition.content.push(transactionsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=expenses-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    let txnType = req.params.type;
    let txnTypes = ["all", "release", "repayments", "contributions", "withdrawals", "fees", "expenses"]
    if (txnTypes.indexOf(txnType) !== -1) {
        path = '/api/transactions';
        if (txnType != 'all') path = '/api/transactions/type/' + capitalizeFirstLetter(txnType);
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
            }, transactions) => {
                if (err) {
                    req.flash('errors', {
                        msg: 'There was an error when loading list of transactions. Please try again later.'
                    });
                    return res.redirect('back');
                } else if (statusCode === 200) {
                    if (txnType == 'all') downloadTransactions(transactions);
                    if (txnType == 'release') downloadLoansRelease(transactions);
                    if (txnType == 'repayments') downloadRepayments(transactions);
                    if (txnType == 'contributions') downloadContributions(transactions);
                    if (txnType == 'withdrawals') downloadWithdrawals(transactions);
                    if (txnType == 'fees') downloadFees(transactions);
                    if (txnType == 'expenses') downloadExpenses(transactions);
                } else {
                    req.flash('errors', {
                        msg: transactions.message
                    });
                    return res.redirect('back');
                }
            }
        );
    } else {
        req.flash('errors', {
            msg: 'Not existing transaction type. Please enter correct transaction type.'
        });
        return res.redirect('/transactions');
    }
};

const getWithdrawals = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/withdrawals';
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
                    }, withdrawals) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of withdrawals. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/employees';
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
                                }, employees) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading list of employees. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        path = '/api/borrowers';
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
                                            }, borrowers) => {
                                                if (err) {
                                                    req.flash('errors', {
                                                        msg: 'There was an error when loading list of borrowers. Please try again later.'
                                                    });
                                                    return res.redirect('back');
                                                } else if (statusCode === 200) {
                                                    res.render('account/withdrawals', {
                                                        title: 'Manage Withdrawal Requests',
                                                        user: user,
                                                        borrowers: borrowers,
                                                        employees: employees,
                                                        withdrawals: withdrawals
                                                    });
                                                } else {
                                                    req.flash('errors', {
                                                        msg: borrowers.message
                                                    });
                                                    return res.redirect('back');
                                                }
                                            }
                                        );
                                    } else {
                                        req.flash('errors', {
                                            msg: employees.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: withdrawals.message
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
};

const postWithdrawals = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.receiverName)) validationErrors.push({
        msg: 'Borrower Name cannot be blank.'
    });
    if (req.body.amount == 0) validationErrors.push({
        msg: 'Withdrawal amount cannot be zero.'
    });
    if (req.body.amount < 500) validationErrors.push({
        msg: 'Required minimum withdrawal amount is 500.'
    });
    if (validator.isEmpty(req.body.reason)) validationErrors.push({
        msg: 'Reason cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }

    path = '/api/transactions/borrowers/' + req.body.receiverName + '/contributions';
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
        }, transactions) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading members contribution. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                if (parseFloat(req.body.amount) <= parseFloat(transactions[0].total.$numberDecimal)) {
                    path = '/api/withdrawals';
                    requestOptions = {
                        url: `${apiOptions.server}${path}`,
                        method: 'POST',
                        headers: {
                            Authorization: 'Bearer ' + req.user.token
                        },
                        json: {
                            amount: req.body.amount,
                            reason: req.body.reason,
                            requestedBy: req.body.receiverName
                        }
                    };
                    request(
                        requestOptions,
                        (err, {
                            statusCode
                        }, withdrawal) => {
                            if (err) {
                                req.flash('errors', {
                                    msg: 'There was an error when creating withdrawal request. Please try again later.'
                                });
                                return res.redirect('back');
                            } else if (statusCode === 201) {
                                req.flash('success', {
                                    msg: "Withdrawal Request has been added successfully."
                                });
                                return res.redirect('back');
                            } else {
                                req.flash('errors', {
                                    msg: withdrawal.message
                                });
                                return res.redirect('back');
                            }
                        }
                    );
                } else {
                    req.flash('errors', {
                        msg: "Invalid withdrawal amount."
                    });
                    return res.redirect('back');
                }
            } else {
                req.flash('errors', {
                    msg: (transactions) ? transactions.message : 'There was an error when loading members contribution. Please try again later.'
                });
                return res.redirect('back');
            }
        }
    );

};


const getWithdrawalDetails = (req, res) => {
    path = '/api/withdrawals/' + req.params.withdrawalid;
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
        }, withdrawal) => {
            if (err) {
                return res
                    .status(404)
                    .json('There was an error when loading employee information. Please try again later.');
            } else if (statusCode === 200) {
                path = '/api/transactions/borrowers/' + withdrawal.requestedBy._id + '/contributions';
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
                    }, transactions) => {
                        if (err) {
                            return res
                                .status(404)
                                .json('There was an error when loading members contribution. Please try again later.');
                        } else if (statusCode === 200) {
                            return res
                                .status(200)
                                .json({
                                    total: transactions[0].total.$numberDecimal,
                                    withdrawal: withdrawal
                                });
                        } else {
                            return res
                                .status(statusCode)
                                .json('There was an error when loading members contribution. Please try again later.');
                        }
                    }
                );
            } else {
                return res
                    .status(statusCode)
                    .json('There was an error when loading employee information. Please try again later.');
            }
        }
    );
};

const postUpdateWithdrawals = (req, res) => {
    path = '/api/withdrawals/' + req.params.withdrawalid;
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
        }, withdrawal) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading withdrawal request. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                if (withdrawal.status != "Declined" || withdrawal.status != "Cash Release") {
                    const validationErrors = [];
                    if (validator.isEmpty(req.body.status)) validationErrors.push({
                        msg: 'Status cannot be blank.'
                    });
                    if (validator.isEmpty(req.body.reviewedBy)) validationErrors.push({
                        msg: 'Assigned Loan Officer cannot be blank.'
                    });
                    if (req.body.status == "Cash Release") {
                        if (validator.isEmpty(req.body.postedBy)) validationErrors.push({
                            msg: 'Assigned Loan Officer cannot be blank.'
                        });
                        if (validator.isEmpty(req.body.referenceNo)) validationErrors.push({
                            msg: 'Assigned Loan Officer cannot be blank.'
                        });
                    }
                    if (validationErrors.length) {
                        req.flash('errors', validationErrors);
                        return res.redirect('back');
                    }
                    path = '/api/withdrawals/' + req.params.withdrawalid;
                    requestOptions = {
                        url: `${apiOptions.server}${path}`,
                        method: 'PUT',
                        headers: {
                            Authorization: 'Bearer ' + req.user.token
                        },
                        json: {
                            status: req.body.status,
                            reviewedBy: req.body.reviewedBy
                        }
                    };
                    request(
                        requestOptions,
                        (err, {
                            statusCode
                        }, updatedWithdrawal) => {
                            if (err) {
                                req.flash('errors', {
                                    msg: 'There was an error when updating withdrawal request. Please try again later.'
                                });
                                return res.redirect('back');
                            } else if (statusCode === 200) {
                                if (req.body.status == "Cash Release") {
                                    path = '/api/employees/' + req.body.postedBy;
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
                                        }, employee) => {
                                            if (err) {
                                                req.flash('errors', {
                                                    msg: 'There was an error when loading employee information. Please try again later.'
                                                });
                                                return res.redirect('back');
                                            } else if (statusCode === 200) {
                                                let transaction = {};
                                                transaction.senderNum = employee.account.number;
                                                transaction.amount = '-' + withdrawal.amount;
                                                transaction.type = "Withdrawals";
                                                transaction.receiverNum = withdrawal.requestedBy.account.number;
                                                transaction.status = "Posted";
                                                transaction.borrowerId = withdrawal.requestedBy._id;
                                                transaction.withdrawalId = withdrawal._id;
                                                transaction.postedBy = req.body.postedBy;
                                                transaction.referenceNo = req.body.referenceNo;
                                                path = '/api/transactions';
                                                requestOptions = {
                                                    url: `${apiOptions.server}${path}`,
                                                    method: 'POST',
                                                    headers: {
                                                        Authorization: 'Bearer ' + req.user.token
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
                                                                msg: 'There was an error when adding new transaction. Please try again later.'
                                                            });
                                                            return res.redirect('back');
                                                        } else if (statusCode === 201) {
                                                            path = '/api/sendMail';
                                                            requestOptions = {
                                                                url: `${apiOptions.server}${path}`,
                                                                method: 'POST',
                                                                json: {
                                                                    receiver: withdrawal.requestedBy.profile.email,
                                                                    subject: 'Your VMO EZ Withdrawal Request has been approved and release',
                                                                    message: `Hello,\n\nThis is a confirmation that the withdrawal request #${withdrawal.withdrawalNum} amounting of ${withdrawal.amount} has just been approved and release.\nPlease check your G-Cash wallet if it is credited.\n\n Thank you.\n`
                                                                }
                                                            };
                                                            request(
                                                                requestOptions,
                                                                (err, {
                                                                    statusCode
                                                                }, body) => {
                                                                    if (err) {
                                                                        req.flash('warnings', {
                                                                            msg: 'Withdrawal request has been updated, however we were unable to send a confirmation email to the recipient. We will be looking into it shortly.'
                                                                        });
                                                                        return res.redirect('back');
                                                                    } else if (statusCode === 200) {
                                                                        req.flash('success', {
                                                                            msg: "Withdrawal request has been updated successfully. New transaction has been added successfully. Email has been sent to respective email."
                                                                        });
                                                                        return res.redirect('back');
                                                                    } else {
                                                                        req.flash('errors', {
                                                                            msg: body.message
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
                                } else if (req.body.status == "Declined") {
                                    path = '/api/sendMail';
                                    requestOptions = {
                                        url: `${apiOptions.server}${path}`,
                                        method: 'POST',
                                        json: {
                                            receiver: withdrawal.requestedBy.profile.email,
                                            subject: 'Your VMO EZ Withdrawal Request has been declined',
                                            message: `Hello,\n\nWe are sorry to inform you that your withrawal request #${withdrawal.withdrawalNum} amounting of ${withdrawal.amount} has just been declined.\n \n\n Thank you.\n`
                                        }
                                    };
                                    request(
                                        requestOptions,
                                        (err, {
                                            statusCode
                                        }, body) => {
                                            if (err) {
                                                req.flash('warnings', {
                                                    msg: 'Withdrawal request has been updated, however we were unable to send a confirmation email to the recipient. We will be looking into it shortly.'
                                                });
                                                return res.redirect('back');
                                            } else if (statusCode === 200) {
                                                req.flash('success', {
                                                    msg: "Withdrawal request has been updated successfully. Email has been sent to respective email."
                                                });
                                                return res.redirect('back');
                                            } else {
                                                req.flash('errors', {
                                                    msg: body.message
                                                });
                                                return res.redirect('back');
                                            }
                                        }
                                    );
                                } else {
                                    req.flash('success', {
                                        msg: "Withdrawal request has been updated successfully."
                                    });
                                    return res.redirect('back');
                                }
                            } else {
                                req.flash('errors', {
                                    msg: updatedWithdrawal.message
                                });
                                return res.redirect('back');
                            }
                        }
                    );
                } else {
                    req.flash('errors', {
                        msg: 'Cannot update the withdrawal request.'
                    });
                    return res.redirect('back');
                }
            } else {
                req.flash('errors', {
                    msg: withdrawal.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDeleteWithdrawals = (req, res) => {
    path = '/api/transactions/withdrawals/' + req.params.withdrawalid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, transactions) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting transactions record. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                path = '/api/withdrawals/' + req.params.withdrawalid;
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Bearer ' + req.user.token
                    },
                    json: {}
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, body) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when deleting withdrawal request. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 204) {
                            req.flash('success', {
                                msg: "Successfully deleting withdrawal request and all transactions."
                            });
                            return res.redirect('back');
                        } else {
                            req.flash('errors', {
                                msg: body.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: transactions.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getContributions = (req, res) => {
    path = '/api/transactions/borrowers/' + req.params.borrowerid + '/contributions';
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
        }, transactions) => {
            if (err) {
                return res
                    .status(404)
                    .json('There was an error when loading members contribution. Please try again later.');
            } else if (statusCode === 200) {
                return res
                    .status(200)
                    .json(transactions[0].total.$numberDecimal);
            } else {
                return res
                    .status(statusCode)
                    .json('There was an error when loading members contribution. Please try again later.');
            }
        }
    );
};

const getDownloadWithdrawalsReport = (req, res) => {
    let fonts = {
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

    function downloadWithdrawals(withdrawals) {
        let docDefinition = {
            pageOrientation: 'landscape',
            pageMargins: [40, 20, 40, 40],
            content: [{
                    text: 'VMO EZ LOAN',
                    style: 'header'
                },
                {
                    text: [
                        parseDate(new Date, 'month') + '\n\n'
                    ],
                    style: 'subheader'
                }
            ],
            styles: {
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
                    fontSize: 10,
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

        let withdrawalsTable = {
            table: {
                headerRows: 2,
                widths: ['*', '*', '*', '*', '*', '*', '*'],
                body: [
                    [{
                        text: 'LIST OF WITHDRAWAL REQUESTS',
                        style: 'tableHeader',
                        alignment: 'center',
                        fillColor: 'black',
                        colSpan: 7,
                    }, {}, {}, {}, {}, {}, {}],
                    [{
                            text: 'Withdrawal Request No.',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Member Name',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Request Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Amount',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Reason',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Review Date',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        },
                        {
                            text: 'Status',
                            style: 'medium',
                            bold: true,
                            border: [true, true, true, true]
                        }
                    ]
                ]
            }
        };
        withdrawals.forEach(d => {
            let withdrawalRow = [{
                    text: d.withdrawalNum,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.requestedBy.profile.firstName + ' ' + d.requestedBy.profile.lastName,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: parseDate(d.createdAt, 'short'),
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.amount,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.reason,
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: (d.status != "Processing" && d.reviewedDate) ? parseDate(d.reviewedDate, 'short') : "",
                    style: 'item',
                    border: [true, true, true, true]
                },
                {
                    text: d.status,
                    style: 'item',
                    border: [true, true, true, true]
                }
            ];
            withdrawalsTable.table.body.push(withdrawalRow);
        });
        docDefinition.content.push(withdrawalsTable);
        // Make sure the browser knows this is a PDF.
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', `attachment; filename=withdrawal-requests-list.pdf`);
        res.set('Content-Description: File Transfer');
        res.set('Cache-Control: no-cache');
        // Create the PDF and pipe it to the response object.
        let pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    }

    path = '/api/withdrawals';
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
        }, withdrawals) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when loading list of withdrawal requests. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                downloadWithdrawals(withdrawals);
            } else {
                req.flash('errors', {
                    msg: withdrawals.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getEmployees = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/employees';
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
                    }, employees) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of employees. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/admins';
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
                                }, admins) => {
                                    if (err) {
                                        req.flash('errors', {
                                            msg: 'There was an error when loading list of admins. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        res.render('account/employees', {
                                            title: 'Manage Employees',
                                            user: user,
                                            employees: employees,
                                            admins: admins
                                        });
                                    } else {
                                        req.flash('errors', {
                                            msg: admins.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: employees.message
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
};

const postEmployees = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.type)) validationErrors.push({
        msg: 'Employee type cannot be blank.'
    });
    if (validator.isEmpty(req.body.employeeID)) validationErrors.push({
        msg: 'Employee ID cannot be blank.'
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
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });
    if (req.body.type == 'Loan Processor') {
        if (validator.isEmpty(req.body.accountName)) validationErrors.push({
            msg: 'G-Cash Account name cannot be blank.'
        });
        if (validator.isEmpty(req.body.accountNum)) validationErrors.push({
            msg: 'G-Cash Account no. cannot be blank.'
        });
    }
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    req.body.email = validator.normalizeEmail(req.body.email, {
        gmail_remove_dots: false
    });
    let username = usernameGen(req.body.firstName, req.body.lastName);
    let password = passwordGen();
    path = '/api/users';
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            username: username,
            password: CryptoJS.AES.encrypt(password, process.env.CRYPTOJS_CLIENT_SECRET).toString(),
            type: (req.body.type == "Admin") ? "Admin" : "Employee"
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when creating user account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 201) {
                path = '/api/employees';
                if (req.body.type == 'Admin') path = '/api/admins';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    },
                    json: {
                        type: req.body.type,
                        profile: {
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            dateOfBirth: req.body.dateOfBirth,
                            gender: req.body.gender,
                            email: req.body.email,
                            mobileNum: req.body.mobileNum,
                            mobileNumVerified: true
                        },
                        employeeID: (req.body.employeeID) ? req.body.employeeID : '',
                        sharesPerPayDay: (req.body.sharesPerPayDay) ? req.body.sharesPerPayDay : '0.00',
                        account: {
                            name: (req.body.accountName) ? req.body.accountName : '',
                            number: (req.body.accountNum) ? req.body.accountNum : ''
                        }
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, employee) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when creating employee account. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 201) {
                            path = '/api/sendMail';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                json: {
                                    receiver: req.body.email,
                                    subject: 'VMO EZ Loan Account',
                                    message: `Hi, \n\nTo activate your account, follow these four (3) simple steps: \n 1. Click this url to access the site. (${process.env.BASE_URL}/login) \n 2. Log-on using these access credentials:\n\t USERNAME: \t ${username} \n\t\t These are the initials of your first name, and your last name plus your 6 random alphanumeric.\n\t PASSWORD: \t ${password} \n 3. Change the initial password provided to your preferred password. \n\n Thank you and welcome to VMO EZ Loan.`
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, body) => {
                                    if (err) {
                                        req.flash('warnings', {
                                            msg: 'There was an error when sending the password to respective email. Please try again later.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        req.flash('success', {
                                            msg: 'Success! New Employee has been created and password has been sent to respective email.'
                                        });
                                        return res.redirect('back');
                                    } else {
                                        req.flash('errors', {
                                            msg: body.message
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
                    msg: user.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getInquiries = (req, res) => {
    path = '/api/admins/users/' + req.user.id;
    if (req.user.type == "Employee") path = '/api/employees/users/' + req.user.id;
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
                    msg: 'There was an error when loading your account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/inquiries';
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
                    }, inquiries) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when loading list of inquiries.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            res.render('account/inquiries', {
                                title: 'Manage Inquiries',
                                user: user,
                                inquiries: inquiries
                            });
                        } else {
                            req.flash('errors', {
                                msg: inquiries.message
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
};

const postInquiries = (req, res) => {
    getUserDetails(req, res, 'account/index', 'Account Management');
};

const getDeleteEmployees = (req, res) => {
    path = '/api/employees/' + req.params.employeeid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
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
                    msg: 'There was an error when deleting employee account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                path = '/api/users/' + req.params.userid;
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'DELETE',
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
                                msg: 'There was an error when deleting user account. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 204) {
                            req.flash('success', {
                                msg: "Successfully deleting all employee records."
                            });
                            return res.redirect('back');
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
                    msg: employee.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDeleteAdmins = (req, res) => {
    path = '/api/admins/' + req.params.adminid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, admin) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting admin account. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                path = '/api/users/' + req.params.userid;
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'DELETE',
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
                                msg: 'There was an error when deleting user account. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 204) {
                            req.flash('success', {
                                msg: "Successfully deleting all admin records."
                            });
                            return res.redirect('back');
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
                    msg: admin.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getUpdateInquiries = (req, res) => {
    const validationErrors = [];
    if (validator.isEmpty(req.body.response)) validationErrors.push({
        msg: 'Response message cannot be blank.'
    });
    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('back');
    }
    path = '/api/inquiries/' + req.params.inquiryid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {
            response: {
                message: req.body.response,
                repliedBy: req.user.id
            }
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, inquiry) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when updating inquiry. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 200) {
                path = '/api/inquiries/' + req.params.inquiryid;
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
                    }, updatedInquiry) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when updating inquiry. Please try again later.'
                            });
                            return res.redirect('back');
                        } else if (statusCode === 200) {
                            path = '/api/sendMail';
                            requestOptions = {
                                url: `${apiOptions.server}${path}`,
                                method: 'POST',
                                json: {
                                    receiver: updatedInquiry.email,
                                    subject: 'Your VMO EZ Loan Inquiry Response',
                                    message: `Hello,\n\nThis is a response for your inquiry #${updatedInquiry.inquiryNum}: ${updatedInquiry.message}, ${updatedInquiry.response.message}.\n\n Thank you.\n`
                                }
                            };
                            request(
                                requestOptions,
                                (err, {
                                    statusCode
                                }, body) => {
                                    if (err) {
                                        req.flash('warnings', {
                                            msg: 'Inquiry has been updated, however we were unable to send a confirmation email to the recipient. We will be looking into it shortly.'
                                        });
                                        return res.redirect('back');
                                    } else if (statusCode === 200) {
                                        req.flash('success', {
                                            msg: "Inquiry has been updated successfully. Email has been sent to respective email."
                                        });
                                        return res.redirect('back');
                                    } else {
                                        req.flash('errors', {
                                            msg: body.message
                                        });
                                        return res.redirect('back');
                                    }
                                }
                            );
                        } else {
                            req.flash('errors', {
                                msg: updatedInquiry.message
                            });
                            return res.redirect('back');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: inquiry.message
                });
                return res.redirect('back');
            }
        }
    );
};

const getDeleteInquiries = (req, res) => {
    path = '/api/inquiries/' + req.params.inquiryid;
    requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + req.user.token
        },
        json: {}
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, inquiry) => {
            if (err) {
                req.flash('errors', {
                    msg: 'There was an error when deleting inquiry. Please try again later.'
                });
                return res.redirect('back');
            } else if (statusCode === 204) {
                req.flash('success', {
                    msg: "Successfully deleting inquiry record."
                });
                return res.redirect('back');
            } else {
                req.flash('errors', {
                    msg: inquiry.message
                });
                return res.redirect('back');
            }
        }
    );
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
    getDownloadBorrowerInfo,
    getDownloadFiles,
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
    getCredits,
    postCredits,
    postRepayment,
    getDownloadLoanSOA,
    getDownloadLoanSchedule,
    getBorrowers,
    getDownloadBorrowersReport,
    postBorrowers,
    getDeleteBorrowers,
    postUpdateBorrowers,
    getLoans,
    postLoans,
    getBorrowerDetails,
    getBorrowerLoans,
    getEmployeeDetails,
    getDeleteLoans,
    postUpdateLoans,
    getLoanDetails,
    getDownloadLoansReport,
    getTransactions,
    postTransactions,
    getTransactionDetails,
    postUpdateTransactions,
    getDeleteTransactions,
    getDownloadTransactionsReport,
    getWithdrawals,
    postWithdrawals,
    getWithdrawalDetails,
    postUpdateWithdrawals,
    getDeleteWithdrawals,
    getContributions,
    getDownloadWithdrawalsReport,
    getEmployees,
    postEmployees,
    getInquiries,
    postInquiries,
    getDeleteEmployees,
    getDeleteAdmins,
    getUpdateInquiries,
    getDeleteInquiries
};