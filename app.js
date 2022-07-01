var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');
const expressSession = require("express-session");

var userapiRouter = require('./routes/userapi');
var instrumentapiRouter = require('./routes/instrumentapi')
var trainerapiRouter = require('./routes/trainerapi');
var blogsapiRouter= require('./routes/blogsapi');
var app = express();

//mongoose connection 
const mongoose = require('mongoose');
main().catch(err => console.log(err));

async function main() {
  try{
  await mongoose.connect('mongodb://localhost:27017/music');
  console.log('connected to mongoose')
  }
  catch(err)
  {
    console.log(err)
  }
}

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
  secret: "sushanth",
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});


app.use('/users', userapiRouter);
app.use('/instruments',instrumentapiRouter);
app.use('/trainer',trainerapiRouter);
app.use('/blogs',blogsapiRouter)
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
  //res.send(err)
  res.render('error',{error:err.message});
});



module.exports = app;
