const passport = require('passport');
const {
    Strategy: LocalStrategy
} = require('passport-local');
const CryptoJS = require("crypto-js");
const request = require('request');

const apiOptions = {
    server: process.env.BASE_URL
};


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy({
    usernameField: 'username',

}, (username, password, done) => {
    let path = '/api/login';
    let requestOptions = {
        url: `${apiOptions.server}${path}`,
        method: 'POST',
        json: {
            username: username,
            password: CryptoJS.AES.encrypt(password, process.env.CRYPTOJS_CLIENT_SECRET).toString()
        }
    };
    request(
        requestOptions,
        (err, {
            statusCode
        }, user) => {
            if (err) {
                return done(err);
            } else if (statusCode === 200) {
                return done(null, user);
            } else {
                return done(null, false, {
                    msg: 'Invalid username or password.'
                });
            }
        }
    );
}));

/**
 * Login Required middleware.
 */
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('errors', {
        msg: 'You must be signed in to do that!'
    });
    res.redirect('/login');
};

module.exports = {
    isAuthenticated
};