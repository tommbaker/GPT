var socket;
var portfolio = [];

Number.prototype.formatMoney = function(c, d, t) {
	var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c,
		d = d == undefined ? "." : d,
		t = t == undefined ? "," : t,
		s = n < 0 ? "-" : "",
		i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
		j = (j = i.length) > 3 ? j % 3 : 0;
	return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
};

$(function() {

	socket = io.connect('http://shrouded-escarpment-7034.herokuapp.com:80/');
	socket.on('stocks', function(data) {
		rootScope.stocks = data;
		updateUI();

		if(rootScope.balance == null) {
			socket.emit('tradeShares', {
				userId: 'tom',
				stockCode: data[0].code,
				amount: 0
			});
		}
	});

	socket.on('updateUser', function(user) {
		portfolio = user.portfolio;
		rootScope.balance = user.balance.formatMoney();
		updateUI();
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
		amount: 1
	};
	socket.emit('tradeShares', data);
}, 500);

var sellShares = _.throttle(function(code) {
	console.log("Sell Executed");
	var data = {
		userId: 'tom',
		stockCode: code,
		amount: -1
	};
	socket.emit('tradeShares', data);
}, 500);