const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/checkEmail', (req, res) => {
        const email = req.query.email;
        console.log('Received email to check:', email); // Log the received email

        db.query("SELECT * FROM accounts WHERE user_email = ?", [email], (err, result) => {
            if (err) {
                console.error('Error checking email availability:', err);
                return res.status(500).json({ error: 'Internal Server Error', details: err.message });
            }
            const exists = result.length > 0;
            console.log('Email exists:', exists); // Log the existence check result
            res.json({ exists: exists });
        });
    });

    return router;
};
