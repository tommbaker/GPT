var express = require('express'),
    app = express(),
    server = require("http").createServer(app),
    io = require('socket.io').listen(server, {log:false}),
    exchange = require('./exchange.js'),
    db = require('./db.js'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    crc32 = require('buffer-crc32'),
    utils = require('utils');

passport.use(new LocalStrategy(
    function (username, password, done) {
        console.log(username);
        if (username != 'tom') return done({message:"Not Tom"});
        return done(null, { username:username });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    done(null, {username:username});
});

var cookieSessions = express.cookieSession({ key:'gpse.sess', secret:'samsung-wunderman-hongkong' });
app.configure(function () {
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(cookieSessions);
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
});

exchange.setDb(db);

// exchange.setStocks();
// console.log("Stocks set.");

io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});

var port = process.env.PORT || 5000;
server.listen(port);

app.get('/', function (req, res) {
    res.send("OK.");
});

app.post('/login',
    passport.authenticate('local', { failureRedirect:'http://127.0.0.1:4000/' }), function (req, res) {
        res.redirect('http://127.0.0.1:4000/game');
    });

io.sockets.on('connection', function (socket) {

    var rawCookie = utils.parseCookie(socket.handshake.headers.cookie);

console.log(rawCookie);

    if (rawCookie) {
        var unsigned = utils.parseSignedCookie(rawCookie, secret);
        if (unsigned) {
            var originalHash = crc32.signed(unsigned);
            console.log(utils.parseJSONCookie(unsigned) || {});
        }
    }

    socket.on('tradeShares', function (data) {
        console.log("tradeShares");
        console.log(data);

        exchange.tradeShares(data.userId, data.stockCode, data.amount, function (user) {
            socket.emit('updateUser', user);
        });
    });
});

setInterval(function () {
    var stocks = exchange.getStocks();
    if (stocks.length > 0) io.sockets.emit('stocks', stocks);
}, 1000);