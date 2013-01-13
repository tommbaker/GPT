var mongoose = require('mongoose');
var __ = require('underscore');
var async = require('async');

mongoose.connect('heroku:fossil-bag-brown@linus.mongohq.com:10095/app10625944');


var userSchema = mongoose.Schema({
	id: String,
	balance: Number,
	portfolio: Array
});

var stockSchema = mongoose.Schema({
	code: String,
	quantity: Number,
	price: Number
});

stockSchema.methods.tradeShares = function(amount) {
	this.quantity += amount;
};

var stock = mongoose.model('stock', stockSchema);
var user = mongoose.model('user', userSchema);

exports.addStock = function(code, quantity) {
	var newStock = new stock({
		code: code,
		quantity: quantity,
		price: 0
	});

	newStock.save(function(err) {
		if(err) // ...
		console.log(err);
	});
};

exports.getStocks = function(callback) {
	stock.find(function(err, dbStocks) {
		if (err) console.log(err);
		callback(dbStocks);
	});
};

exports.addUser = function(userId, callback) {
	var newUser = new user({
		id: userId,
		balance: 100000,
		portfolio: []
	});

	newUser.save(function(err, user) {
		if(err) { console.log(err); return false }
        callback(user);
        return true;
	});

	return newUser;
};

exports.getUser = function(userId, callback) {
	user.find({
		id: userId
	}, function(err, user) {
		if (err) { console.log(err); return false; }

		if (user.length > 0) {
			callback(user[0]);
		} else {
			exports.addUser(userId, callback);
		}

        return true;
	});
};