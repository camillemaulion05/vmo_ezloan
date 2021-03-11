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

    if (validator.isEmpty(req.body.name)) validationErrors.push({
        msg: 'Please enter your name'
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
            name: req.body.name,
            sender: req.body.email,
            subject: 'Contact Form | VMO EZ Loan',
            message: req.body.message
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
                return res.redirect('/#contact');
            } else if (statusCode === 200) {
                path = '/api/inquiries';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    json: {
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        message: req.body.message
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, body) => {
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
                                msg: body.message
                            });
                            return res.redirect('/#contact');
                        }
                    }
                );
            } else {
                req.flash('errors', {
                    msg: body.message
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