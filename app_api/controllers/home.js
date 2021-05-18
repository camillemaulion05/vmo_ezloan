const CryptoJS = require("crypto-js");
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const nodemailer = require('nodemailer');

const index = (req, res) => {
    return res
        .status(200)
        .json({
            "message": "Welcome to API"
        });
};

const clientEncrypt = (req, res) => {
    if (req.body.plainText) {
        let cipherText = CryptoJS.AES.encrypt(req.body.plainText, process.env.CRYPTOJS_CLIENT_SECRET).toString();
        return res
            .status(200)
            .json({
                "cipherText": cipherText
            });
    } else {
        return res
            .status(400)
            .json({
                "message": "plainText is required."
            });
    }
};

const clientDecrypt = (req, res) => {
    if (req.body.cipherText) {
        let bytes = CryptoJS.AES.decrypt(req.body.cipherText, process.env.CRYPTOJS_CLIENT_SECRET);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        return res
            .status(200)
            .json({
                "plainText": originalText
            });
    } else {
        return res
            .status(400)
            .json({
                "message": "cipherText is required."
            });
    }
};

const serverEncrypt = (req, res) => {
    if (req.body.plainText) {
        let cipherText = CryptoJS.AES.encrypt(req.body.plainText, process.env.CRYPTOJS_SERVER_SECRET).toString();
        return res
            .status(200)
            .json({
                "cipherText": cipherText
            });
    } else {
        return res
            .status(400)
            .json({
                "message": "plainText is required."
            });
    }
};

const serverDecrypt = (req, res) => {
    if (req.body.cipherText) {
        let bytes = CryptoJS.AES.decrypt(req.body.cipherText, process.env.CRYPTOJS_SERVER_SECRET);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        return res
            .status(200)
            .json({
                "plainText": originalText
            });
    } else {
        return res
            .status(400)
            .json({
                "message": "cipherText is required."
            });
    }
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
    if (req.body.mobileNum) {
        if (process.env.NODE_ENV == "development") {
            return res
                .status(200)
                .json({
                    "status": "pending",
                    "message": "We sent a 6-digit verification code to your registered mobile number +639XXXXX" + (req.body.mobileNum).substring(6, 10) + ", please check."
                });
        } else {
            client.verify.services(process.env.TWILIO_SERVICESID)
                .verifications
                .create({
                    to: '+63' + req.body.mobileNum,
                    channel: 'sms'
                })
                .then(verification => {
                    return res
                        .status(200)
                        .json({
                            "status": verification.status,
                            "message": (verification.status == "pending") ? "We sent a 6-digit verification code to your registered mobile number +639XXXXX" + (req.body.mobileNum).substring(6, 10) + ", please check." : "Sorry " + req.body.name + ", it seems that my sms server is not responding. Please try again later!"
                        });
                })
                .catch(err => {
                    console.log('ERROR: Could not send OTP code.\n', err.message)
                    return res
                        .status(404)
                        .json({
                            "status": "error",
                            "message": "Error sending the code. Please try again shortly."
                        });
                });
        }
    } else {
        return res
            .status(400)
            .json({
                "status": "error",
                "message": "Mobile number is required."
            });
    }
}

const validateOTP = function (req, res) {
    if (req.body.mobileNum && req.body.code) {
        if (process.env.NODE_ENV == "development") {
            return res
                .status(200)
                .json({
                    "status": "approved",
                    "message": "Your mobile number is verified."
                });
        } else {
            client.verify.services(process.env.TWILIO_SERVICESID)
                .verificationChecks
                .create({
                    to: "+63" + req.body.mobileNum,
                    code: req.body.code
                })
                .then(verification_check => {
                    if (verification_check.status != "approved" && !verification_check.valid) {
                        return res
                            .status(400)
                            .json({
                                "status": verification_check.status,
                                "message": 'The verification code you entered is not correct. Please try again.'
                            });
                    }
                    return res
                        .status(200)
                        .json({
                            "status": verification_check.status,
                            "message": "Your mobile number is verified."
                        });
                })
                .catch(err => {
                    console.log('ERROR: Could not validateOTP code.\n', err.message)
                    return res
                        .status(404)
                        .json({
                            "status": "error",
                            "message": "The requested resource was not found."
                        });
                });
        }
    } else {
        return res
            .status(400)
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
    if (req.body.message && req.body.subject && (req.body.sender || req.body.receiver)) {
        let transporter = nodemailer.createTransport({
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
            mailOptions.to = process.env.GMAIL_USER, req.body.sender;
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
                transporter = nodemailer.createTransport({
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
                        .status(400)
                        .json({
                            "message": "Error sending the message. Please try again shortly."
                        });
                }
            }
            console.log('ERROR: Could not send email.\n', err);
            return res
                .status(400)
                .json({
                    "message": "Error sending the message. Please try again shortly."
                });
        }
    } else {
        return res
            .status(400)
            .json({
                "status": "error",
                "message": "Required fields are empty."
            });
    }
}

module.exports = {
    index,
    clientEncrypt,
    clientDecrypt,
    serverEncrypt,
    serverDecrypt,
    createService,
    sendOTP,
    validateOTP,
    deleteService,
    sendMail
};