const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');

const employeesList = (req, res) => {
    Employee
        .find({}, {
            "profile.firstName": 1,
            "profile.lastName": 1,
            "type": 1,
            "employeeNum": 1,
            "userId": 1
        })
        .populate('userId', 'status email mobileNum')
        .exec((err, employees) => {
            if (err) {
                res
                    .status(404)
                    .json({
                        "message": err._message
                    });
            } else {
                res
                    .status(200)
                    .json(employees);
            }
        });
};

const employeesCreate = (req, res) => {
    const employee = new Employee({
        type,
        profile,
        userId,
    } = req.body);
    employee.employeeNum = Date.now();
    employee.save((err) => {
        if (err) {
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

const employeesReadOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    } else {
        Employee
            .findById(employeeid)
            .populate('userId', 'status email mobileNum')
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
                    res
                        .status(404)
                        .json({
                            "message": err._message
                        });
                } else {
                    res
                        .status(200)
                        .json(employee);
                }
            });
    }
};

const employeesUpdateOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    } else {
        Employee
            .findById(employeeid)
            .populate('userId', 'status email mobileNum')
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
                    res
                        .status(400)
                        .json({
                            "message": err._message
                        });
                } else {
                    employee.type = (req.body.type) ? req.body.type : employee.type;
                    employee.profile = (req.body.profile) ? req.body.profile : employee.profile;
                    employee.userId = (req.body.userId) ? req.body.userId : employee.userId;
                    employee.save((err) => {
                        if (err) {
                            res
                                .status(404)
                                .json({
                                    "message": err._message
                                });
                        } else {
                            res
                                .status(200)
                                .json(employee);
                        }
                    });
                }
            });
    }
};

const employeesDeleteOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    } else {
        Employee
            .findByIdAndRemove(employeeid)
            .exec((err, employee) => {
                if (!employee) {
                    res
                        .status(404)
                        .json({
                            "message": "Employee not found."
                        });
                } else if (err) {
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
};

module.exports = {
    employeesList,
    employeesCreate,
    employeesReadOne,
    employeesUpdateOne,
    employeesDeleteOne
};