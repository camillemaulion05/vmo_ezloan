const dotenv = require('dotenv');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const lusca = require('lusca');
const MongoStore = require('connect-mongo').default;
const flash = require('express-flash');
const expressStatusMonitor = require('express-status-monitor');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({
  path: '.env'
});

// Route Files
// const indexRouter = require('./app_server/routes/index');
const apiRouter = require('./app_api/routes/index');

// Create Express server.
const app = express();

// Express configuration.
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
// app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 86400000
  }, // 1 day in milliseconds
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path.match(/\/api/g)) {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  //After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user && req.path === '/account') {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

// Set Public Folder
app.use('/', express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));
// app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css'), {
//   maxAge: 31557600000
// }));
// app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/font-awesome/css'), {
//   maxAge: 31557600000
// }));
// app.use('/fonts', express.static(path.join(__dirname, 'node_modules/font-awesome/fonts'), {
//   maxAge: 31557600000
// }));
// app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/bootstrap-select/dist/css'), {
//   maxAge: 31557600000
// }));
// app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive-dt/css'), {
//   maxAge: 31557600000
// }));
// app.use('/stylesheets', express.static(path.join(__dirname, 'node_modules/datatables-bootstrap/css'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery/dist'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery-validation/dist'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/jquery.easing/bower_components/jquery-easing-original'), {
//   maxAge: 31557600000
// }));
// app.use('/metismenu', express.static(path.join(__dirname, 'node_modules/metismenu/dist'), {
//   maxAge: 31557600000
// }));
// app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap-select/dist/js'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables.net/js'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive/js'), {
//   maxAge: 31557600000
// }));
// app.use('/javascripts', express.static(path.join(__dirname, 'node_modules/datatables-bootstrap/js'), {
//   maxAge: 31557600000
// }));

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res
      .status(401)
      .json({
        "message": err.name + ": " + err.message
      });
  }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;