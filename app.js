const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const socketIo = require("socket.io"),
    fs = require("fs"),
    mongoose = require("mongoose"),
    cors = require("cors"),
    http = require("http"),
    session = require("express-session");

const indexRouter = require('./routes/index');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const Session = require("./models/session")
mongoose.Promise = global.Promise;
const databaseUri =
    "mongodb+srv://UBH2020:UBH2020@ubh2020.8hgws.mongodb.net/UBH2020?retryWrites=true&w=majority";
mongoose
    .connect(
        databaseUri,
        { useNewUrlParser: true }
    )
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));


// view engine setup
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: false
    })
);
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

const PORT = process.env.PORT || 8000;
server.listen(PORT);