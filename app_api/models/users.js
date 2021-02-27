const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userNum: String, //Date.now();
    username: {
        type: String,
        unique: true
    },
    password: String, //encrypted
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    lastFailedLogin: Date,
    status: {
        type: String,
        default: "Active" //Active, Inactive
    },
    type: String, //Borrower, Employee, Admin
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
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
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
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

mongoose.model('User', userSchema);