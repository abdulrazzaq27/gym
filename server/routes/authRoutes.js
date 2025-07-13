const express = require('express')
const router = express.Router()
const passport = require('passport')
const Member = require('../models/Member')

//register route 
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new Member({ email, username })
        const registeredMember = await Member.register(user, password)

        //auto-login after registration 
        req.login(registeredMember, (err) => {
            if (err) {
                console.error('Auto-login after registration failed:', err);
                return next(err);
            }
            console.log('Member registered and logged in:', registeredMember.username);
            res.json({
                message: 'Successfully registered! ',
                user: { id: registeredMember._id, username: registeredMember.username, email: registeredMember.email }
            })
        })
    }
    catch (e) {
        console.error('Registration error:', e.message);
        res.status(400).json({ error: e.message })
    }
});

//login route
router.post('/login', (req, res, next) => {    
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Passport authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication failed:', info);
            return res.status(401).json({ error: info?.message || 'Invalid credentials' });
        }

        console.log('Passport authentication successful for:', user.email);
        
        req.login(user, (err) => {
            if (err) {
                console.error('Session login error:', err);
                return next(err);
            }
            console.log('User logged into session:', user.email);
            console.log('Session after login:', req.sessionID);
            console.log('req.user after login:', req.user ? req.user.email : 'No user');
            
            res.json({
                message: 'Successfully logged in!',
                user: { id: user._id, username: user.username, email: user.email }
            })
        })
    })(req, res, next);
})

//logout route
router.post('/logout', (req, res, next) => {
    console.log('Logout attempt for:', req.user ? req.user.username : 'No user');
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        console.log('Member logged out successfully');
        res.json({ message: 'Successfully logged out!' })
    })
})

//current user
router.get('/me', (req, res) => {
    console.log('Auth check - Session ID:', req.sessionID);
    console.log('Auth check - Authenticated:', req.isAuthenticated());
    console.log('Auth check - User:', req.user ? req.user.username : 'No user');
    
    if (req.user) {
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email
            }
        })
    }
    else {
        res.status(401).json({ error: 'Not authenticated' })
    }
})

module.exports = router;