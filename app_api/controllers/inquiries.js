const mongoose = require('mongoose');
const Inquiry = mongoose.model('Inquiry');

const inquiriesList = (req, res) => {
    Inquiry
        .find()
        .exec((err, inquiries) => {
            if (err) {
                res
                    .status(404)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(inquiries);
            }
        });
};

const inquiriesCreate = (req, res) => {
    const inquiry = new Inquiry({
        name,
        email,
        phone,
        message,
        response
    } = req.body);
    inquiry.inquiryNum = Date.now();
    if (req.body.response) inquiry.response.createdAt = Date.now();
    inquiry.save((err) => {
        if (err) {
            res
                .status(400)
                .json(err);
        } else {
            res
                .status(201)
                .json(inquiry);
        }
    });
};

const inquiriesReadOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    if (!inquiryid) {
        res
            .status(404)
            .json({
                "message": "Not found, inquiryid is required"
            });
    } else {
        Inquiry
            .findById(inquiryid)
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "inquiry not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
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
    if (!inquiryid) {
        res
            .status(404)
            .json({
                "message": "Not found, inquiryid is required"
            });
    } else {
        Inquiry
            .findById(inquiryid)
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "inquiryid not found"
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json(err);
                } else {
                    inquiry.name = (req.body.name) ? req.body.name : inquiry.name;
                    inquiry.email = (req.body.email) ? req.body.email : inquiry.email;
                    inquiry.phone = (req.body.phone) ? req.body.phone : inquiry.phone;
                    inquiry.message = (req.body.message) ? req.body.message : inquiry.message;
                    inquiry.response.message = (req.body.response && req.body.response.message) ? req.body.response.message : inquiry.response.message;
                    inquiry.response.repliedBy = (req.body.response && req.body.response.repliedBy) ? req.body.response.repliedBy : inquiry.response.repliedBy;
                    inquiry.response.createdAt = (!req.body.response || inquiry.response.createdAt) ? inquiry.response.createdAt : Date.now();
                    inquiry.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json(err);
                        } else {
                            res
                                .status(200)
                                .json(inquiry);
                        }
                    });
                }
            });
    }
};

const inquiriesDeleteOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    if (!inquiryid) {
        res
            .status(404)
            .json({
                "message": "Not found, inquiryid is required"
            });
    } else {
        Inquiry
            .findByIdAndRemove(inquiryid)
            .exec((err, inquiry) => {
                if (!inquiry) {
                    res
                        .status(404)
                        .json({
                            "message": "inquiry not found"
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(204)
                        .json(null);
                }
            });
    }
};

module.exports = {
    inquiriesList,
    inquiriesCreate,
    inquiriesReadOne,
    inquiriesUpdateOne,
    inquiriesDeleteOne
};