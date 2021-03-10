import {
    Schema,
    model
} from 'mongoose';

const inquirySchema = new Schema({
    inquiryNum: String, //Date.now();
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
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
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }
}, {
    timestamps: true
});

model('Inquiry', inquirySchema);