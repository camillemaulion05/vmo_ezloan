const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    employeeNum: String, // Date.now();
    isDeleted: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        required: true,
        enum: ["Loan Officer", "Loan Processor", "HRD Authorized Officer"]
    },
    profile: {
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
        dateOfBirth: {
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
            required: true,
            unique: true
        },
        mobileNumVerified: {
            type: Boolean,
            default: false
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        emailVerificationToken: String,
        emailVerified: {
            type: Boolean,
            default: false
        }
    },
    account: {
        name: String,
        number: String
    },
    employeeID: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    signature: String
}, {
    timestamps: true
});

mongoose.model('Employee', employeeSchema);