const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");


const userSchema = mongoose.Schema({
    userNum: String, //Date.now();
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }, //encrypted
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    lastFailedLogin: Date,
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Inactive"]
    },
    type: {
        type: String,
        default: "Borrower",
        enum: ["Borrower", "Employee", "Admin"]
    },
    security: [{
        question: {
            type: String,
            enum: [
                "What is your close friend's name?",
                "What is your Driving License Number?",
                "What is your favorite color?",
                "What is your favorite pet`s name?",
                "What is your favorite sports team?",
                "What is your mother's maiden name?",
                "What is your Passport No.?",
                "What is your SSS No.?",
                "What was your first car?",
                "Where did you first meet your spouse?",
                "Who was your childhood hero?"
            ]
        },
        answer: String //encrypted
    }],
    picture: {
        originalname: String,
        filename: String,
        contentType: String
    }
}, {
    timestamps: true
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    let bytes = CryptoJS.AES.decrypt(user.password, process.env.CRYPTOJS_CLIENT_SECRET);
    let candidatePassword = bytes.toString(CryptoJS.enc.Utf8);
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(candidatePassword, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (encryptedPassword, cb) {
    let bytes = CryptoJS.AES.decrypt(encryptedPassword, process.env.CRYPTOJS_CLIENT_SECRET);
    let candidatePassword = bytes.toString(CryptoJS.enc.Utf8);
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

/**
 * User's security answer hash middleware.
 */
userSchema.methods.encryptSecurityAnswer = function () {
    for (let i = 0; i < this.security.length; i++) {
        let bytes = CryptoJS.AES.decrypt(this.security[i].answer, process.env.CRYPTOJS_CLIENT_SECRET);
        let originalAnswer = bytes.toString(CryptoJS.enc.Utf8);
        this.security[i].answer = CryptoJS.AES.encrypt(originalAnswer, process.env.CRYPTOJS_SERVER_SECRET).toString();
    }
};

/**
 * Helper method for validating user's security answer.
 */
userSchema.methods.compareSecurityAnswer = function (security, cb) {
    for (let i = 0; i < this.security.length; i++) {
        if (security.question === this.security[i].question) {
            let bytes = CryptoJS.AES.decrypt(security.answer, process.env.CRYPTOJS_CLIENT_SECRET);
            let candidateAnswer = bytes.toString(CryptoJS.enc.Utf8);

            let bytes2 = CryptoJS.AES.decrypt(this.security[i].answer, process.env.CRYPTOJS_SERVER_SECRET);
            let originalAnswer = bytes2.toString(CryptoJS.enc.Utf8);

            if (candidateAnswer == originalAnswer) {
                cb(false, true);
            } else {
                cb(false, false);
            }
        }
    }
};

userSchema.methods.generateJwt = function () {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return jwt.sign({
        _id: this._id,
        username: this.username,
        type: this.type,
        exp: parseInt(expiry.getTime() / 1000, 10),
    }, process.env.JWT_SECRET);
};

mongoose.model('User', userSchema);