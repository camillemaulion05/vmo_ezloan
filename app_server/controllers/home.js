const validator = require('validator');
const request = require('request');
const apiOptions = {
    server: process.env.BASE_URL
};

/* GET home page. */
const index = (req, res, next) => {
    res.render('index', {
        title: 'Home'
    });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
const postContact = (req, res) => {
    const validationErrors = [];

    if (validator.isEmpty(req.body.firstName)) validationErrors.push({
        msg: 'Please enter your first name'
    });
    if (validator.isEmpty(req.body.lastName)) validationErrors.push({
        msg: 'Please enter your last name'
    });
    if (!validator.isEmail(req.body.email)) validationErrors.push({
        msg: 'Please enter a valid email address.'
    });
    if (validator.isEmpty(req.body.message)) validationErrors.push({
        msg: 'Please enter your message.'
    });

    if (validationErrors.length) {
        req.flash('errors', validationErrors);
        return res.redirect('/');
    }
    let path = '/api/sendMail';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            name: req.body.firstName + " " + req.body.lastName,
            sender: req.body.email,
            subject: 'Contact Form | VMO EZ Loan',
            message: req.body.message
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, inquiry) => {
            if (err) {
                req.flash('errors', {
                    msg: inquiry.message
                });
                return res.redirect('/#contact');
            } else if (statusCode === 200) {
                path = '/api/inquiries';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        message: req.body.message
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, email) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'Error sending the message. Please try again shortly.'
                            });
                            return res.redirect('/#contact');
                        } else if (statusCode === 201) {
                            req.flash('success', {
                                msg: 'Email has been sent successfully!'
                            });
                            return res.redirect('/#contact');
                        } else {
                            req.flash('errors', {
                                msg: email.message
                            });
                            return res.redirect('/#contact');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: inquiry.message
                });
                return res.redirect('/#contact');
            }
        }
    );
};

module.exports = {
    index,
    postContact
};