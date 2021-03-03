const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    inquiryNum: String, //Date.now();
    name: String,
    email: {
        type: String,
        required: true
    },
    phone: String,
    message: {
        type: String,
        required: true
    }, //Inquiries, Feedback
    response: {
        createdAt: Date,
        message: String,
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
}, {
    timestamps: true
});

mongoose.model('Inquiry', inquirySchema);