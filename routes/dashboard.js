const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/dashboard', (req, res) => {
        if (!req.session.user) {
            res.redirect('/login');
        } else {
            const user = {
                name: req.session.user_name,
                email: req.session.user_email,
                type: req.session.user_type,
            }
            res.render('dashboard', { user });
        }
    });
    return router;
};
