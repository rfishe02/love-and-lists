require('dotenv').config();
require('./modules/auth');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);

var indexRouter = require('./routes/index');
var openAIRouter = require('./routes/openai');
var tasksRouter = require('./routes/tasks');
var charaRouter = require('./routes/chara');
var rewardRouter = require('./routes/rewards');
var imageRouter = require('./routes/images');
var loginRouter = require('./routes/login');
var authRouter = require('./routes/auth');

var app = express();

app.use(session({
  secret: process.env.SECRET_KEY,
  name: 'love_lists_webapp',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './' }),
  cookie: {
    secure: false,
    httpOnly: true,
    SameSite: 'strict',
    maxAge: (86400 * 1000),
  },
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { user_id: user.user_id });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/openai', openAIRouter);
app.use('/tasks', tasksRouter);
app.use('/chara', charaRouter);
app.use('/rewards',rewardRouter);
app.use('/images', imageRouter);
app.use('/login', loginRouter);
app.use('/auth', authRouter);

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
