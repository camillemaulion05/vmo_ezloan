const validator = require('validator');
const nodemailer = require('nodemailer');
const request = require('request');
const apiOptions = {
    server: process.env.BASE_URL
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
const postInquiries = (req, res) => {
    const validationErrors = [];
    let fromName;
    let fromEmail;

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

    fromName = req.body.name;
    fromEmail = req.body.email;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    });
    const mailOptions = {
        to: process.env.GMAIL_USER,
        from: `${fromName} <${req.body.email}>`,
        subject: 'Contact Form | VMO EZ Loan',
        text: req.body.message
    };
    return transporter.sendMail(mailOptions)
        .then(() => {
            const path = '/api/inquiries';
            const requestOptions = {
                url: `${apiOptions.server}${path}`,
                method: 'POST',
                json: req.body
            };
            request(
                requestOptions,
                (err, {
                    statusCode
                }, body) => {
                    if (err) {
                        console.log('ERROR: Could not send contact email.\n', err);
                        req.flash('errors', {
                            msg: 'Error sending the message. Please try again shortly.'
                        });
                        return res.redirect('/#contact');
                    } else if (statusCode === 201) {
                        req.flash('success', {
                            msg: 'Email has been sent successfully!'
                        });
                        return res.redirect('/#contact');
                    }
                }
            );
        })
        .catch((err) => {
            console.log('ERROR: Could not send contact email.\n', err);
            req.flash('errors', {
                msg: 'Error sending the message. Please try again shortly.'
            });
            return res.redirect('/#contact');
        });
};

module.exports = {
    postInquiries
};