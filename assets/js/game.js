var socket;
var portfolio = [];

$(function() {

	socket = io.connect('http://shrouded-escarpment-7034.herokuapp.com:80/');
	socket.on('stocks', function(data) {
		rootScope.stocks = data;
		updateUI();
	});

	socket.on('updateUser', function(user) {
		portfolio = user.portfolio;

		updateUI();
	});

	socket.emit('tradeShares', {
		userId: 'tom',
		stockCode: 'HAM',
		amount: 0
	});

});

function updateUI() {
	_.each(rootScope.stocks, function(stock) {
		var shares = _.find(portfolio, function(s) {
			return s.code == stock.code;
		});
		if(!shares) {
			stock.shares = 0;
		} else {
			stock.shares = shares.quantity;
		}
	});
	rootScope.$apply();
}

var buyShares = _.throttle(function(code) {
	console.log("Buy Executed");
	var data = {
		userId: 'tom',
		stockCode: code,
		amount: 10
	};
	socket.emit('tradeShares', data);
}, 500);

var sellShares = _.throttle(function(code) {
	console.log("Sell Executed");
	var data = {
		userId: 'tom',
		stockCode: code,
		amount: -10
	};
	socket.emit('tradeShares', data);
}, 500);