const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');

const employeesList = (req, res) => {
    Employee
        .find()
        .exec((err, employees) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
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
            return res
                .status(400)
                .json(err);
        }
        return res
            .status(201)
            .json(employee);
    });
};

const employeesReadOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        return res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    }
    Employee
        .findById(employeeid)
        .exec((err, employee) => {
            if (!employee) {
                return res
                    .status(404)
                    .json({
                        "message": "employee not found"
                    });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(employee);
            }
        });
};

const employeesUpdateOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        return res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    }
    Employee
        .findById(employeeid)
        .exec((err, employee) => {
            if (!employee) {
                return res
                    .status(404)
                    .json({
                        "message": "employeeid not found"
                    });
            } else if (err) {
                return res
                    .status(400)
                    .json(err);
            }
            employee.type = req.body.type;
            employee.profile = req.body.profile;
            employee.userId = req.body.userId;
            employee.save((err) => {
                if (err) {
                    res
                        .status(404)
                        .json(err);
                } else {
                    res
                        .status(200)
                        .json(employee);
                }
            });
        });
};

const employeesDeleteOne = (req, res) => {
    const {
        employeeid
    } = req.params;
    if (!employeeid) {
        return res
            .status(404)
            .json({
                "message": "Not found, employeeid is required"
            });
    }
    Employee
        .findByIdAndRemove(employeeid)
        .exec((err, employee) => {
            if (err) {
                return res
                    .status(404)
                    .json(err);
            }
            res
                .status(204)
                .json(null);
        });
};

module.exports = {
    employeesList,
    employeesCreate,
    employeesReadOne,
    employeesUpdateOne,
    employeesDeleteOne
};