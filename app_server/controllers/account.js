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