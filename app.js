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


io.on("connection", socket => {


    socket.on("room", connection => {
        Session.findById(connection.id, function(err, session) {
            if (!err) {
                if (session) {
                    session.users = session.users + 1;
                    socket.emit("on_page_load_users", session.nicknames);
                    socket.emit("on_page_load_code", session.content);
                    socket.emit("on_page_load_messages", session.messages);
                    session.nicknames.push(connection.nickname);
                    session.save();
                } else {
                    let new_session = new Session({
                        _id: connection.id,
                        nicknames: [connection.nickname]
                    });
                    new_session.save();
                }
            }

            socket.join(connection.id);
            socket.room = connection.id;
            socket.nickname = connection.nickname;
            socket.in(connection.id).emit("new_joiner", connection.nickname);
        });
    });


    socket.on("code", connection => {
        Session.findById(connection.id, function(err, session) {
            if (!err) {
                if (!session) {
                } else {
                    session.content = connection.code;
                    session.save();
                }
            }
        });
        socket.in(connection.id).emit("code", connection.code);
    });

    socket.on("message", msg => {
        console.log(msg)
        Session.findById(socket.room, function(err, session) {
            if (!err) {
                if (!session) {
                } else {
                    session.messages.push({
                        from: socket.nickname,
                        message: msg
                    });
                    session.save();
                }
            }
        });
        socket.in(socket.room).emit("message", {
            from: socket.nickname,
            message: msg
        });
    });


    socket.on("disconnect", () => {
        Session.findById(socket.room, function(err, session) {
            if (!err) {
                if (!session) {
                } else {
                    session.users = session.users - 1;
                    var index = session.nicknames.indexOf(socket.nickname);
                    session.nicknames.splice(index, 1);
                    if (session.users == 0) {
                        session.delete();
                    } else {
                        socket.in(socket.room).emit("user_left", socket.nickname);
                        session.save();
                    }
                }
            }
        });
    });

})
const PORT = process.env.PORT || 8000;
server.listen(PORT);