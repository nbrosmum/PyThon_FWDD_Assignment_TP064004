const express = require('express');
const router = express.Router();

module.exports = (db) => {

    router.get('/login', (req, res) => {
        const error = req.session.error;
        req.session.error = null; // Clear the error message
        res.render('login', { error });
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
                    req.session.loggedin = true;
                    req.session.user_email = user_email;
                    req.session.user_id = results[0].id; // Assign id to session
                    req.session.user_name = results[0].user_name; // Assign user_name to session
                    req.session.user_type = results[0].user_type
                    res.redirect('/homePage');
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

    router.get('/logout', (req, res) => {
        if (req.session) {
            // delete session object
            req.session.destroy(function(err) {
                if(err) {
                    return next(err);
                } else {
                    return res.redirect('/login');
                }
            });
        }
      });
    return router;
};