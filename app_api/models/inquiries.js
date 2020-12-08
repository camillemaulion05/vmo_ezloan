const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    inquiryNum: String,
    name: String,
    email: String,
    phone: String,
    message: String,
    response: {
        createdAt: Date,
        text: String,
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
}, {
    timestamps: true
});

mongoose.model('Inquiry', inquirySchema);