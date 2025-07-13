const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/Member');

// Configure passport to use email instead of username
passport.use(new LocalStrategy({
    usernameField: 'email',  // This tells passport to use 'email' field instead of 'username' last baar hogaya  this time nakko
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return done(null, false, { message: 'No user found with that email' });
        }
        
        // Use passport-local-mongoose's authenticate method
        user.authenticate(password, (err, result) => {
            if (err) {
                return done(err);
            }
            if (!result) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        });
    } catch (error) {
        return done(error);
    }
}));

// Serialize and deserialize user for session management
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;