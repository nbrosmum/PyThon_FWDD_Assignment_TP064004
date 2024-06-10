// Require necessary modules
const express = require('express');
const router = express.Router();


    // Define the route handler for the dashboard
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard', email: req.session.user_email, type: req.session.user_type, user: req.session.user }); 
});

module.exports = router;
