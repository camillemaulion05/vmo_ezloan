const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    inquiryNum: String,
    name: String,
    email: String,
    phone: String,
    message: String,
    response: {
        text: String,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
        }
    }
}, {
    timestamps: true
});

mongoose.model('Inquiry', inquirySchema);