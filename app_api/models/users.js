import {
    promisify
} from 'util';
import {
    genSalt,
    hash as _hash,
    compare
} from 'bcrypt';
import {
    Schema,
    model
} from 'mongoose';
import {
    sign
} from 'jsonwebtoken';
import {
    AES,
    enc
} from "crypto-js";
import {
    randomBytes
} from 'crypto';
const randomBytesAsync = promisify(randomBytes);

const userSchema = new Schema({
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
    email: {
        type: String,
        unique: true,
        required: true
    },
    emailVerificationToken: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    mobileNum: {
        type: String,
        required: true
    },
    mobileNumVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
    lastFailedLogin: Date,
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Inactive"]
    },
    type: {
        type: String,
        required: true,
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
    }]
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
    let bytes = AES.decrypt(user.password, process.env.CRYPTOJS_SECRET);
    let candidatePassword = bytes.toString(enc.Utf8);
    genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        _hash(candidatePassword, salt, (err, hash) => {
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
    let bytes = AES.decrypt(encryptedPassword, process.env.CRYPTOJS_SECRET);
    let candidatePassword = bytes.toString(enc.Utf8);
    compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

/**
 * Encrypt user's security answer.
 */
userSchema.methods.encryptSecurityAnswer = function () {
    for (let i = 0; i < this.security.length; i++) {
        let bytes = AES.decrypt(this.security[i].answer, process.env.CRYPTOJS_SECRET);
        let candidateAnswer = bytes.toString(enc.Utf8);
        genSalt(10, (err, salt) => {
            _hash(candidateAnswer, salt, (err, hash) => {
                this.security[i].answer = hash;
            });
        });
    }
};

/**
 * Helper method for validating user's security answer.
 */
userSchema.methods.compareSecurityAnswer = function (security, cb) {
    for (let i = 0; i < this.security.length; i++) {
        if (security.question === this.security[i].question) {
            let bytes = AES.decrypt(security.answer, process.env.CRYPTOJS_SECRET);
            let candidateAnswer = bytes.toString(enc.Utf8);
            compare(candidateAnswer, this.security[i].answer, (err, isMatch) => {
                cb(err, isMatch);
            });
        }
    }
};

userSchema.methods.setPasswordRandomToken = function () {
    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString('hex'));
    user.passwordResetToken = createRandomToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
};

userSchema.methods.setEmailRandomToken = function () {
    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString('hex'));
    user.emailVerificationToken = createRandomToken;
};

userSchema.methods.generateJwt = function () {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);
    return sign({
        _id: this._id,
        username: this.username,
        type: this.type,
        exp: parseInt(expiry.getTime() / 1000, 10),
    }, process.env.JWT_SECRET);
};

model('User', userSchema);