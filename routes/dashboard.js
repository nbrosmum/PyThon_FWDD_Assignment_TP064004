// Require necessary modules
const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // Define the route handler for the dashboard
    router.get('/dashboard', (req, res) => {
            console.log(req.session);
            if (!req.session.user) { 
                // User is not logged in, redirect to login page 
                res.redirect('/login'); 
            } else { 
                // User is logged in, render the dashboard 
                console.log(req.session.user_name)
                res.render('dashboard', { user_name: req.session.user_name }); 
            
            } 
        });


    // Return the router
    return router;
};
