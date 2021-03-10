import {
    AES,
    enc
} from "crypto-js";
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
import {
    createTransport
} from 'nodemailer';

const index = (req, res) => {
    return res
        .status(200)
        .json({
            "message": "Welcome to API"
        });
};

const encrypt = (req, res) => {
    let cipherText = AES.encrypt(req.body.plainText, process.env.CRYPTOJS_SECRET).toString();
    return res
        .status(200)
        .json({
            "cipherText": cipherText
        });
};

const decrypt = (req, res) => {
    let bytes = AES.decrypt(req.body.cipherText, process.env.CRYPTOJS_SECRET);
    let originalText = bytes.toString(enc.Utf8);
    return res
        .status(200)
        .json({
            "plainText": originalText
        });
};

const createService = function () {
    client.verify.services.create({
            friendlyName: 'VMO EZ Loan'
        })
        .then(service => {
            return res
                .status(200)
                .json({
                    "sid": service.sid
                });
        });
}

const sendOTP = function (req, res) {
    if (req.body.phone) {
        client.verify.services(process.env.TWILIO_SERVICESID)
            .verifications
            .create({
                to: '+63' + req.body.phone,
                channel: 'sms'
            })
            .then(verification => {
                return res
                    .status(200)
                    .json({
                        "status": verification.status,
                        "message": (verification.status == "pending") ? "We sent a 6-digit verification code to your registered mobile number +639XXXXX" + (req.body.phone).substring(6, 10) + ", please check." : "Sorry " + req.body.name + ", it seems that my sms server is not responding. Please try again later!"
                    });
            })
            .catch(error => {
                return res
                    .status(404)
                    .json({
                        "status": "error",
                        "message": error.message
                    });
            });
    } else {
        return res
            .status(404)
            .json({
                "status": "error",
                "message": "Mobile number is required."
            });
    }
}

const validateOTP = function (req, res) {
    if (req.body.phone && req.body.code) {
        client.verify.services(process.env.TWILIO_SERVICESID)
            .verificationChecks
            .create({
                to: "+63" + req.body.phone,
                code: req.body.code
            })
            .then(verification_check => {
                return res
                    .status(200)
                    .json({
                        "status": verification_check.status,
                        "message": (verification_check.status == "approved") ? "Your mobile number is verified." : "You've entered a wrong code. Please try again."
                    });
            })
            .catch(error => {
                return res
                    .status(404)
                    .json({
                        "status": "error",
                        "message": error.message
                    });
            });
    } else {
        return res
            .status(404)
            .json({
                "status": "error",
                "message": "Mobile number and verification code is required."
            });
    }
}

const deleteService = function () {
    client.verify.services(process.env.TWILIO_SERVICESID).remove();
}

const sendMail = async function (req, res) {
    let transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    });
    let mailOptions = {
        subject: req.body.subject,
        text: req.body.message
    };
    if (req.body.sender) {
        mailOptions.to = process.env.GMAIL_USER;
        mailOptions.from = `${req.body.name} <${req.body.sender}>`;
    }
    if (req.body.receiver) {
        mailOptions.to = req.body.receiver;
        mailOptions.from = process.env.GMAIL_USER;
    }
    try {
        await transporter.sendMail(mailOptions);
        return res
            .status(200)
            .json({
                "message": "Email has been sent successfully!"
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
            try {
                await transporter.sendMail(mailOptions);
                return res
                    .status(200)
                    .json({
                        "message": "Email has been sent successfully!"
                    });
            } catch (err) {
                console.log('ERROR: Could not send contact email.\n', err);
                return res
                    .status(404)
                    .json({
                        "message": "Error sending the message. Please try again shortly."
                    });
            }
        }
        console.log('ERROR: Could not send contact email.\n', err);
        return res
            .status(404)
            .json({
                "message": "Error sending the message. Please try again shortly."
            });
    }
}

export default {
    index,
    encrypt,
    decrypt,
    createService,
    sendOTP,
    validateOTP,
    deleteService,
    sendMail
};