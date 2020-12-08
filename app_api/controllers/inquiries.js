const mongoose = require('mongoose');
const Inquiry = mongoose.model('Inquiry');
const User = mongoose.model('User');

const getAuthor = (req, res, callback) => {
    if (req.body.username) {
        User
            .findOne({
                isAdmin: true,
                username: req.body.username
            })
            .exec((err, user) => {
                if (!user) {
                    return res
                        .status(404)
                        .json({
                            "message": "User not found"
                        });
                } else if (err) {
                    console.log(err);
                    return res
                        .status(404)
                        .json(err);
                }
                callback(req, res, {
                    "id": user._id,
                    "username": user.username
                });
            });
    } else {
        return res
            .status(404)
            .json({
                "message": "User not found"
            });
    }
};

const inquiriesList = (req, res) => {
    Inquiry
        .find()
        .exec((err, inquiries) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
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
        message
    } = req.body);
    inquiry.inquiryNum = Date.now();
    inquiry.save((err) => {
        if (err) {
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(inquiry);
    });
};

const inquiriesReadOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    if (!inquiryid) {
        return res
            .status(404)
            .json({
                "message": "Not found, inquiryid is required"
            });
    }
    Inquiry
        .findById(inquiryid)
        .exec((err, inquiry) => {
            if (!inquiry) {
                return res
                    .status(404)
                    .json({
                        "message": "inquiry not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(inquiry);
            }
        });
};

const inquiriesUpdateOne = (req, res) => {
    getAuthor(req, res,
        (req, res, author) => {
            const {
                inquiryid
            } = req.params;
            if (!inquiryid) {
                return res
                    .status(404)
                    .json({
                        "message": "Not found, inquiryid is required"
                    });
            }
            Inquiry
                .findById(inquiryid)
                .exec((err, inquiry) => {
                    if (!inquiry) {
                        return res
                            .status(404)
                            .json({
                                "message": "inquiryid not found"
                            });
                    } else if (err) {
                        return res
                            .status(400)
                            .json(err);
                    }
                    inquiry.response.author = author;
                    inquiry.response.text = req.body.text;
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
                });
        });
};

const inquiriesDeleteOne = (req, res) => {
    const {
        inquiryid
    } = req.params;
    if (inquiryid) {
        Inquiry
            .findByIdAndRemove(inquiryid)
            .exec((err, inquiry) => {
                if (err) {
                    return res
                        .status(404)
                        .json(err);
                }
                res
                    .status(204)
                    .json(null);
            });
    } else {
        res
            .status(404)
            .json({
                "message": "No inquiry"
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