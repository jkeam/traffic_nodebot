var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
//var users = require('./routes/user');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// logic
var traffic = require('./models/traffic');
var debug = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});



io.on('connection', function(socket){
  if (debug) {
    console.log('user connected');
  }
  socket.on('disconnect', function(){
    if (debug) {
      console.log('user disconnected');
    }
  });

  socket.on('traffic_request', function(msg) {
    if (debug) {
      console.log(msg);
    }
    var address = msg.address;
    var mileRadius = parseFloat(msg.radius);
    traffic.process(io, address, mileRadius);
  });
});



module.exports = {
    server: server,
    app: app
}
