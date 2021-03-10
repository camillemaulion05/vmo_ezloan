import {
    Schema,
    model
} from 'mongoose';

const employeeSchema = new Schema({
    employeeNum: String, // Date.now();
    type: {
        type: String,
        required: true,
        enum: ["Loan Officer", "Loan Processor"]
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
        }
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

model('Employee', employeeSchema);