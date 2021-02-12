const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employeeNum: String, // Date.now();
    type: String, // Loan Officer or Loan Processor
    profile: {
        email: String,
        emailVerificationToken: String,
        emailVerified: Boolean,
        firstName: String,
        middleName: String,
        lastName: String,
        gender: String, //Male, Female
        birthday: Date,
        address: {
            present: {
                address: String,
                city: String,
                zipCode: String
            },
            permanent: {
                address: String,
                city: String,
                zipCode: String
            }
        },
        mobileNum: String,
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