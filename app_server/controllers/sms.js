const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
exports.createService = function () {
    client.verify.services.create({
            friendlyName: 'VMO EZ Loan'
        })
        .then(service => {
            console.log(service.sid);
            return service.sid;
        });
}

exports.sendOTP = function (req, res, next) {
    console.log(req.body.phone);

    if (req.body.phone) {
        client.verify.services(process.env.TWILIO_SERVICESID)
            .verifications
            .create({
                to: '+63' + req.body.phone,
                channel: 'sms'
            })
            .then(verification => {
                console.log("Status: " + verification.status);
                return res.send({
                    status: verification.status,
                    message: (verification.status == "pending") ? "We sent a 6-digit verification code to your registered mobile number +639XXXXX" + (req.body.phone).substring(6, 10) + ", please check." : "Sorry " + req.body.name + ", it seems that my sms server is not responding. Please try again later!"
                });
            })
            .catch(error => {
                console.log("Error: " + error.message);
                return res.send({
                    status: "error",
                    message: error.message
                });
            });
    } else {
        return res.send({
            status: "error",
            message: "Mobile number is required."
        });
    }
}

exports.validateOTP = function (req, res, next) {
    if (req.body.phone && req.body.code) {
        client.verify.services(process.env.TWILIO_SERVICESID)
            .verificationChecks
            .create({
                to: "+63" + req.body.phone,
                code: req.body.code
            })
            .then(verification_check => {
                console.log(verification_check.status);
                return res.send({
                    status: verification_check.status,
                    message: (verification_check.status == "approved") ? "Your mobile number is verified." : "You've entered a wrong code. Please try again."
                });
            })
            .catch(error => {
                console.log(error.message);
                return res.send({
                    status: "error",
                    message: error.message
                });
            });
    } else {
        return res.send({
            status: "error",
            message: "Mobile number and verification code is required."
        });
    }
}

exports.deleteService = function () {
    client.verify.services(process.env.TWILIO_SERVICESID).remove();
}