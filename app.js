var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'pythondb',
});
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database');
    }
});

var app = express();

app.use(session({
  secret: 'pythondb',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const loginRoute = require('./routes/login')(db);
app.use('/',loginRoute);

const registerRoute = require('./routes/register')(db);
app.use('/',registerRoute);

var checkEmailRoute = require('./routes/email')(db);
app.use('/', checkEmailRoute);

app.get('/about_Us', (req, res) => {
    res.render('about_Us');
});

app.get('/homePage', (req, res) => { 
  if (!req.session.user) { 
    // User is not logged in, redirect to login page 
    res.redirect('/login'); 
  } else { 
    // User is logged in, render the dashboard 
    res.render('homePage', { user_name: req.session.user_name }); 
  } 
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
