const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/login', (req, res) => {
        res.render('login', {title: 'Login'});
    });

    router.post('/login', (req, res) => {
        const {
            user_email,
            user_password
        } = req.body;
        if (user_email && user_password) {
            db.query('SELECT * FROM accounts WHERE user_email = ? AND user_password = ?', [user_email, user_password], (error, results, fields) => {
                if (results.length > 0) {
                    req.session.user = results[0];
                    req.session.user_email = user_email;
                    req.session.user_id = results[0].id; 
                    req.session.user_name = results[0].user_name; 
                    req.session.user_type = results[0].user_type;
                    res.redirect('/dashboard');
                } else {
                    res.render('login', { error: 'Incorrect Email and/or Password!' });
                }
                res.end();
            });
        } else {
            res.send('Please enter Username and Password!');
            res.end();
        }
    });

    router.get('/logout', (req, res, next) => {
        if (req.session) {
            // Destroy session object
            req.session.destroy((err) => {
                if (err) {
                    // Forward the error to the error handling middleware
                    next(err);
                } else {
                    // Redirect to the login page after successful logout
                    res.redirect('/login');
                }
            });
        } else {
            // Session doesn't exist, redirect to the login page
            res.redirect('/login');
        }
    });
    return router;
};