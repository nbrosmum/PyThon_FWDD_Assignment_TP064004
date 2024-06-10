var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'PyThon', email: req.session.user_email, type: req.session.user_type, user: req.session.user });
});


module.exports = router;
