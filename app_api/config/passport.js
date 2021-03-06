const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({
    usernameField: 'username'
}, (username, password, done) => {
    User.findOne({
        username: username
    }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                msg: `Username ${username} not found.`
            });
        }
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, {
                msg: 'Invalid username or password.'
            });
        });
    });
}));