var socket;
var shares = [];

$(function() {

	socket = io.connect('http://shrouded-escarpment-7034.herokuapp.com:80/');
	socket.on('stocks', function(data) {
		rootScope.stocks = data;
		updateUI();
	});

	socket.on('confirmTrade', function(data) {
		var share = _.find(shares, function(share) {
			return share.code == data.code;
		});
		if(!share) {
			shares.push({
				code: data.code,
				amount: data.amount
			});
		} else {
			share.amount += data.amount;
		}
		updateUI();
	});

});

function updateUI() {
	_.each(rootScope.stocks, function(stock) {
		var share = _.find(shares, function(share) {
			return share.code == stock.code;
		});
		if(!share) {
			stock.shares = 0;
		} else {
			stock.shares = share.amount;
		}
	});
	rootScope.$apply();
}

var buyShares = _.throttle(function(code) {
	console.log("Buy Executed");
	var data = {
		code: code,
		amount: 10
	};
	socket.emit('tradeShares', data);
}, 500);

var sellShares = _.throttle(function(code) {
	var data = {
		code: code,
		amount: -10
	};
	socket.emit('tradeShares', data);
}, 500);