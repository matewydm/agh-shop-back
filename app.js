var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var productRouter = require('./routes/product');
var orderRouter = require('./routes/order');
var usersRouter = require('./routes/users');

var app = express();
var socket = express();
var server = require('http').createServer(socket);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
var db = mongoose.connection;

mongoose.connect('mongodb://shop-user:aghshop123@ds121652.mlab.com:21652/agh-shop');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);

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

db.on('error', console.error.bind(console, 'błąd połączenia...'));
db.once('open', function() {
// połączenie udane!
});

io.on('connection', function() {
    console.log('Client connected...');
});

module.exports.promotion = function (msg) {
    console.log('Emiting info...' + msg);
    io.emit("promotion", { content : msg });
};
module.exports.productEdit = function (msg) {
    console.log('Emiting info...' + msg);
    io.emit("productEdit", { content : msg });
};

server.listen(5000, function(){
    console.log('Node server listening on port 5000');
});

module.exports = app;
