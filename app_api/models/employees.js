const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeNum: String, // Date.now();
    type: {
        type: String,
        required: true,
        enum: ["Loan Officer", "Loan Processor"]
    },
    profile: {
        email: {
            type: String,
            unique: true,
            required: true
        },
        emailVerificationToken: String,
        emailVerified: Boolean,
        firstName: {
            type: String,
            required: true
        },
        middleName: String,
        lastName: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female"]
        },
        birthday: {
            type: Date,
            required: true
        },
        address: {
            present: {
                unitNo: String,
                houseNo: String,
                street: String,
                subdivision: String,
                barangay: String,
                city: String,
                province: String,
                zipCode: String
            },
            permanent: {
                unitNo: String,
                houseNo: String,
                street: String,
                subdivision: String,
                barangay: String,
                city: String,
                province: String,
                zipCode: String
            }
        },
        mobileNum: {
            type: String,
            required: true
        },
        mobileNumVerified: Boolean
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

mongoose.model('Employee', employeeSchema);