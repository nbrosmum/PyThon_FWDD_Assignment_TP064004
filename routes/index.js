var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'PyThon' });
});
router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login' });
});
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/dashboard', function (req, res, next) {
  res.render('dashboard', { title: 'Dashboard' });
});

router.get('/about_us', function (req, res, next) {
  res.render('about_us', { title: 'About Us' });
});

module.exports = router;
