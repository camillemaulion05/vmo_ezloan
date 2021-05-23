const mongoose = require('mongoose');

const inquirySchema = mongoose.Schema({
    inquiryNum: String, //Date.now();
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }, //Inquiries, Feedback
    response: {
        createdAt: Date,
        message: String,
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        }
    }
}, {
    timestamps: true
});

mongoose.model('Inquiry', inquirySchema);