var __ = require('underscore');
var db = null;
var stocks = [];

exports.setDb = function (_db) {
    db = _db;
    db.getStocks(function (dbstocks) {
        stocks = dbstocks;
    });
};

__.sum = function (obj) {
    if (!__.isArray(obj) || obj.length == 0) return 0;
    return __.reduce(obj, function (sum, n) {
        return sum += n;
    });
}

exports.getStocks = function () {
    return stocks;
};

function refreshSharePrices() {

    // factor is the amount the prices should be exaggerated by.
    var factor = 0.5;
    var totalStocks = __.sum(__.pluck(stocks, 'quantity'));
    var min = 9999;
    var max = 0;
    var avg;
    var lowerGain;
    var upperGain;


    if (totalStocks > 0) {
        __.each(stocks, function (stock) {
            var price = ((stock.quantity) / (totalStocks)) * 100;
            stock.price = price;

            if (price < min) min = price;
            if (price > max) max = price;
        });

        avg = (min + max) / 2;

        lowerGain = 1 + (((1 / (0.001 + ((avg - min) / avg))) - 1) * factor);
        upperGain = 1 + (((1 / (0.001 + ((max - avg) / (100 - avg)))) - 1) * factor);

        __.each(stocks, function (stock) {
            var distAvg = stock.price - avg;
            var newDistAvg = (distAvg > 0) ? distAvg * upperGain : distAvg * lowerGain;
            stock.price = Math.floor(100 + avg + newDistAvg);
        });
    }
}

exports.tradeShares = function (userId, stockCode, amount, callback) {

    // Get the stock being traded.
    var stock = __.find(stocks, function (stock) {
        return stock.code == stockCode;
    });

    // Exit if stock doesn't exist.
    if (stock == null) return false;

    // If stock is being sold, calculate new price first so user cannot profit from repeated buying and selling.
    // Get DB copy of user
    db.getUser(userId, function (user) {

        // Cost of trade plus .5% commission (this is overridden for sell shares later)
        var cost = stock.price * amount * 1.005;

        // find list of shares for the stock from user's portfolio
        var uStock = __.find(user.portfolio, function (ustock) {
            return ustock.code == stockCode;
        });

        // user's portfolio WITHOUT the share we are interested in (we will add the amended stock back in shortly)
        var portfolio = __.reject(user.portfolio, function (ustock) {
            return ustock.code == stockCode;
        });

        if (uStock == null) {
            uStock = {
                code:stockCode,
                quantity:0
            };
        }

        if (user.balance - cost >= 0 && uStock.quantity + amount >= 0) {

            stock.tradeShares(amount);

            refreshSharePrices();

            // recalculate cost for sales minus .5% commission
            if (amount < 0) cost = stock.price * amount * 0.995;

            user.balance -= cost;

            uStock.quantity += amount;
            portfolio.push(uStock);
            user.portfolio = portfolio;
            user.markModified('portfolio');

            stock.save(function (err) {
                if (err) console.log(err);
            });

            user.save(function (err) {
                if (err) console.log(err);
            });

            callback(user);
        }

    });
    return true;
};

exports.setStocks = function () {
    db.addStock('HAM', 1);
    db.addStock('BUT', 1);
    db.addStock('VET', 1);
    db.addStock('ALO', 1);
    db.addStock('WEB', 1);
    db.addStock('GRO', 1);
    db.addStock('HUL', 1);
};