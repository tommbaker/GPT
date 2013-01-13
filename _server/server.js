var app = require('express')(),
  server = require("http").createServer(app),
  io = require('socket.io').listen(server, {log: false});
var exchange = require('./exchange.js');
var db = require('./db.js');

exchange.setDb(db);

// exchange.setStocks();
// console.log("Stocks set.");

io.configure(function() {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

var port = process.env.PORT || 5000;
server.listen(port);

app.get('/', function(req, res) {
  res.send("OK.");
});

io.sockets.on('connection', function(socket) {

  socket.on('tradeShares', function(data) {
    console.log("tradeShares");
    console.log(data);

    exchange.tradeShares(data.userId, data.stockCode, data.amount, function(user) {
      socket.emit('updateUser', user);
    });
  });
});

setInterval(function() {
  var stocks = exchange.getStocks();
  if(stocks.length > 0) io.sockets.emit('stocks', stocks);
}, 1000);