import {
  config
} from 'dotenv';
import createError from 'http-errors';
import express, {
  static
} from 'express';
import {
  join
} from 'path';
import logger from 'morgan';
import {
  initialize,
  session as _session
} from 'passport';
import compression from 'compression';
import session from 'express-session';
import {
  json,
  urlencoded
} from 'body-parser';
import {
  csrf,
  xframe,
  xssProtection
} from 'lusca';
import flash from 'express-flash';
import expressStatusMonitor from 'express-status-monitor';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
config({
  path: '.env'
});

// Route Files
import indexRouter from './app_server/routes/index';
import apiRouter from './app_api/routes/index';

// Create Express server.
const app = express();

// Express configuration.
app.set('views', join(__dirname, 'app_server', 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger('dev'));
app.use(json());
app.use(urlencoded({
  extended: true
}));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));
app.use(initialize());
app.use(_session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path.match(/\/api/g)) {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    csrf()(req, res, next);
  }
});
app.use(xframe('SAMEORIGIN'));
app.use(xssProtection(true));
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
app.use('/', static(join(__dirname, 'public'), {
  maxAge: 86400000
}));
app.use('/stylesheets', static(join(__dirname, 'node_modules/bootstrap/dist/css'), {
  maxAge: 86400000
}));
app.use('/stylesheets', static(join(__dirname, 'node_modules/font-awesome/css'), {
  maxAge: 86400000
}));
app.use('/fonts', static(join(__dirname, 'node_modules/font-awesome/fonts'), {
  maxAge: 86400000
}));
app.use('/stylesheets', static(join(__dirname, 'node_modules/bootstrap-select/dist/css'), {
  maxAge: 86400000
}));
app.use('/stylesheets', static(join(__dirname, 'node_modules/datatables.net-responsive-dt/css'), {
  maxAge: 86400000
}));
app.use('/stylesheets', static(join(__dirname, 'node_modules/datatables-bootstrap/css'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/bootstrap/dist/js'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/jquery/dist'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/jquery-validation/dist'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/jquery.easing/bower_components/jquery-easing-original'), {
  maxAge: 86400000
}));
app.use('/metismenu', static(join(__dirname, 'node_modules/metismenu/dist'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/bootstrap-select/dist/js'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/datatables.net/js'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/datatables.net-responsive/js'), {
  maxAge: 86400000
}));
app.use('/javascripts', static(join(__dirname, 'node_modules/datatables-bootstrap/js'), {
  maxAge: 86400000
}));

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

export default app;