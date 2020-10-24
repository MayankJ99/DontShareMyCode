const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const socketIo = require("socket.io"),
    path = require("path"),
    fs = require("fs"),
    mongoose = require("mongoose"),
    cors = require("cors"),
    http = require("http"),
    session = require("express-session");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.Promise = global.Promise;
const databaseUri =
    "";
mongoose
    .connect(
        databaseUri,
        { useNewUrlParser: true }
    )
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine("html", function(path, options, callbacks) {
    fs.readFile(path, "utf-8", callback);
});
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: false
        // cookie: { path: "/", secure: false, maxAge: 20000 }
    })
);
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
