const mongoose = require('mongoose');
const Activity = mongoose.model('ActivityLog');

const activitiesList = (req, res) => {
    Activity
        .find()
        .exec((err, activities) => {
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
                    .json(activities);
            }
        });
};

const activitiesCreate = (req, res) => {
    const activity = new Activity({
        description,
        tableAffected,
        recordIdAffected
    } = req.body);
    activity.activityNum = Date.now();
    activity.createdByUserId = mongoose.Types.ObjectId(req.payload._id);
    activity.lastUpdatedByUserId = mongoose.Types.ObjectId(req.payload._id);
    if ("User" == req.body.tableAffected && "Dummy" == req.body.recordIdAffected) activity.recordIdAffected = req.payload._id;
    activity.save((err) => {
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


const activitiesCreate2 = (req, res) => {
    const {
        userid
    } = req.params;
    let bytes = "",
        originalUserId = "";
    try {
        bytes = CryptoJS.AES.decrypt(userid, process.env.CRYPTOJS_SERVER_SECRET);
        originalUserId = bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.log(err);
        res
            .status(404)
            .json({
                "message": "Invalid userid."
            });
    }
    const isValid = mongoose.Types.ObjectId.isValid(originalUserId);
    if (!userid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
            });
    } else {
        const activity = new Activity({
            description,
            tableAffected
        } = req.body);
        activity.activityNum = Date.now();
        activity.createdByUserId = mongoose.Types.ObjectId(originalUserId);
        activity.lastUpdatedByUserId = mongoose.Types.ObjectId(originalUserId);
        activity.recordIdAffected = originalUserId;
        activity.save((err) => {
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
    }

};

const activitiesReadOne = (req, res) => {
    const {
        activityid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(activityid);
    if (!activityid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid activityid."
            });
    } else {
        Activity
            .findById(activityid)
            .populate('userId', 'username type lastLogin lastFailedLogin status picture')
            .exec((err, activity) => {
                if (!activity) {
                    res
                        .status(404)
                        .json({
                            "message": "Activity not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (("Employee" == req.payload.type || "Borrower" == req.payload.type) && activity.createdByUserId != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(activity);
                }
            });
    }
};

const activitiesUpdateOne = (req, res) => {
    const {
        activityid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(activityid);
    if (!activityid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid activityid."
            });
    } else {
        Activity
            .findById(activityid)
            .exec((err, activity) => {
                if (!activity) {
                    res
                        .status(404)
                        .json({
                            "message": "Activity not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    activity.description = (req.body.description) ? req.body.description : activity.description;
                    // activity.tableAffected = (req.body.tableAffected) ? req.body.tableAffected : activity.tableAffected;
                    // activity.recordIdAffected = (req.body.recordIdAffected) ? req.body.recordIdAffected : activity.recordIdAffected;
                    // activity.createdByUserId = (req.body.createdByUserId) ? req.body.createdByUserId : activity.createdByUserId;
                    activity.lastUpdatedByUserId = req.payload._id;
                    activity.save((err) => {
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

const activitiesSoftDeleteOne = (req, res) => {
    const {
        activityid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(activityid);
    if (!activityid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid activityid."
            });
    } else {
        Activity
            .findById(activityid)
            .exec((err, activity) => {
                if (!activity) {
                    res
                        .status(404)
                        .json({
                            "message": "Activity not found."
                        });
                } else if (err) {
                    console.log(err);
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    activity.isDeleted = (req.body.isDeleted) ? req.body.isDeleted : activity.isDeleted;
                    activity.save((err) => {
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

const activitiesListByUser = (req, res) => {
    const {
        userid
    } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(userid);
    if (!userid || !isValid) {
        res
            .status(404)
            .json({
                "message": "Not found, please enter a valid userid."
            });
    } else {
        Activity
            .aggregate([{
                $match: {
                    'createdByUserId': mongoose.Types.ObjectId(userid),
                }
            }])
            .exec((err, activities) => {
                if (err) {
                    console.log(err);
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    if (("Employee" == req.payload.type || "Borrower" == req.payload.type) && userid != req.payload._id) {
                        return res
                            .status(403)
                            .json({
                                "message": "You don\'t have permission to do that!"
                            });
                    }
                    res
                        .status(200)
                        .json(activities);
                }
            });
    }
};

module.exports = {
    activitiesList,
    activitiesCreate,
    activitiesCreate2,
    activitiesReadOne,
    activitiesUpdateOne,
    activitiesSoftDeleteOne,
    activitiesListByUser
};