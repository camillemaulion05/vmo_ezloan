const mongoose = require('mongoose');
const Inquiry = mongoose.model('Inquiry');

const inquiriesList = (req, res) => {
    Inquiry
        .find()
        .exec((err, inquiries) => {
            if (err) {
                console.log(err);
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                res
                    .status(200)
                    .json(inquiries);
            }
        });
};

const inquiriesCreate = (req, res) => {
    const inquiry = new Inquiry({
        firstName,
        lastName,
        email,
        message,
        response
    } = req.body);
    inquiry.inquiryNum = Date.now();
    if (req.body.response) inquiry.response.createdAt = Date.now();
    inquiry.save((err) => {
        if (err) {
            console.log(err);
            res
                .status(400)
                .json({
                    "message": err._message
                });
        } else {
            res
                .status(201)
                .json({
                    "message": "Created successfully."
                });
        }
    });
};

const inquiriesReadOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(inquiryid);
    if (!inquiryid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid inquiryid."
            });
    } else {
        Inquiry
            .findById(inquiryid)
            .populate('response.repliedBy', 'profile.firstName profile.lastName')
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "Inquiry not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    res
                        .status(200)
                        .json(inquiry);
                }
            });
    }
};

const inquiriesUpdateOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(inquiryid);
    if (!inquiryid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid inquiryid."
            });
    } else {
        Inquiry
            .findById(inquiryid)
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "Inquiry not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    inquiry.firstName = (req.body.firstName) ? req.body.firstName : inquiry.firstName;
                    inquiry.lastName = (req.body.lastName) ? req.body.lastName : inquiry.lastName;
                    inquiry.email = (req.body.email) ? req.body.email : inquiry.email;
                    inquiry.message = (req.body.message) ? req.body.message : inquiry.message;
                    inquiry.response.message = (req.body.response && req.body.response.message) ? req.body.response.message : inquiry.response.message;
                    inquiry.response.repliedBy = (req.body.response && req.body.response.repliedBy) ? req.body.response.repliedBy : inquiry.response.repliedBy;
                    inquiry.response.createdAt = (req.body.response && req.body.response.repliedBy) ? Date.now() : inquiry.response.createdAt;
                    inquiry.save((err) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            res
                                .status(200)
                                .json({
                                    "message": "Updated successfully."
                                });
                        }
                    });
                }
            });
    }
};

const inquiriesSoftDeleteOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(inquiryid);
    if (!inquiryid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid inquiryid."
            });
    } else {
        Inquiry
            .findById(inquiryid)
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "Inquiry not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    inquiry.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : inquiry.isDeleted;
                    inquiry.save((err) => {
                        if (err) {
                            console.log(err);
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            res
                                .status(204)
                                .json(null);
                        }
                    });
                }
            });
    }
};

module.exports = {
    inquiriesList,
    inquiriesCreate,
    inquiriesReadOne,
    inquiriesUpdateOne,
    inquiriesSoftDeleteOne
};