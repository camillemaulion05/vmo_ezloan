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
    passReqToCallback: true
}, (req, username, password, done) => {
    let path = '/api/login/' + req.userType;
    delete req.userType;
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
                path = '/api/activities';
                requestOptions = {
                    url: `${apiOptions.server}${path}`,
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + user.token
                    },
                    json: {
                        description: user.type + " logged in.",
                        tableAffected: "User",
                        recordIdAffected: user.id
                    }
                };
                request(
                    requestOptions,
                    (err, {
                        statusCode
                    }, activity) => {
                        if (err) {
                            req.flash('errors', {
                                msg: 'There was an error when logging your sign in. Please try again later.'
                            });
                            return done(err);
                        } else if (statusCode === 201) {
                            return done(null, user);
                        } else {
                            req.flash('errors', {
                                msg: activity.message
                            });
                            return done(err);
                        }
                    }
                );
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