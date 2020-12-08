const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css'), {
  maxAge: 31557600000
}));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/font-awesome/css'), {
  maxAge: 31557600000
}));
app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts'), {
  maxAge: 31557600000
}));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap-select/dist/css'), {
  maxAge: 31557600000
}));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive-dt/css'), {
  maxAge: 31557600000
}));
app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/datatables-bootstrap/css'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery-validation/dist'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery.easing/bower_components/jquery-easing-original'), {
  maxAge: 31557600000
}));
app.use('/metismenu', express.static(path.join(__dirname, 'node_modules/metismenu/dist'), {
  maxAge: 31557600000
}));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap-select/dist/js'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables.net/js'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive/js'), {
  maxAge: 31557600000
}));
app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables-bootstrap/js'), {
  maxAge: 31557600000
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;