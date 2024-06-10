var express = require('express');
var router = express.Router();

router.get('/about_us', function (req, res, next) {
    res.render('about_us', { title: 'About Us', email: req.session.user_email, type: req.session.user_type, user: req.session.user });
});

module.exports = router;