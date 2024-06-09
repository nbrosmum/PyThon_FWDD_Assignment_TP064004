const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/register', (req, res) => {
        res.render('register');
    });

    router.post('/register', (req, res) => {
        const { user_name, user_email, user_password } = req.body;

        // Add user_type to the data to be inserted
        const user_type = 'user'; // Assuming all registered users are initially 'user'

        const query = 'INSERT INTO accounts (user_name, user_email, user_password, user_type) VALUES (?, ?, ?, ?)';
        db.query(query, [user_name, user_email, user_password, user_type], (err, results) => {
            if (err) throw err;
            res.redirect('/login');
        });
    });    
    return router;
};
