define(function(require){

	var forceNew = require('forceNew');
	var Chainable = require('Chainable');
	var Deferred = require('Deferred');


	module('Chainable');


	//just a quick class to return Deferred objects which resolve after a
	//timeout.
	var Delayed = function(t) {
		if (!(this instanceof Delayed)) {
			return forceNew(Delayed, arguments, 'Delayed');
		}

		this._time = t || 10;
	};

	Delayed.prototype.resolve = function(val) {
		var deferred = new Deferred();
		setTimeout(function() {
			deferred.resolve(val);
		}, 10);
		return deferred.promise();
	};


	asyncTest('map/map', function() {
		Chainable([1, 2, 3, 4, 5])
			.map(function(val) {
				return Delayed().resolve(val * 2);
			})
			.map(function(val) {
				return Delayed().resolve(val * 2);
			})
			.then(function(result) {
				deepEqual(result, [4, 8, 12, 16, 20]);
				start();
			});
	});


	asyncTest("filter/reject/sortBy", function() {
		var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		numbers = Chainable(numbers)
			.filter(function(n) {
				return Delayed().resolve(n % 2 === 0);
			})
			.reject(function(n) {
				return Delayed().resolve(n % 4 === 0);
			})
			.sortBy(function(n) {
				return Delayed().resolve(-1 * n);
			})
			.then(function(result) {
				deepEqual(result, [10, 6, 2]);
				start();
			});
	});


	asyncTest("parallel/series", function() {
		Chainable()
			.parallel([
				function() {
					return 'A';
				},
				function() {
					return 'B';
				}
			])
			.pipe(function(result) {
				deepEqual(result, ['A', 'B']);
			})
			.series(
				function() {
					return Delayed().resolve('C');
				},
				function() {
					return Delayed().resolve('D');
				}
			)
			.then(function(result1, result2) {
				strictEqual(result1, 'C');
				strictEqual(result2, 'D');
				start();
			});
	});


	asyncTest("pipes", function() {
		Chainable()
			.parallel([
				function() {
					return 'A';
				},
				function() {
					return 'B';
				}
			])
			.pipe(function(result) {
				deepEqual(result, ['A', 'B']);
			})
			.series(
				function() {
					return Delayed().resolve('C');
				},
				function() {
					return Delayed().resolve('D');
				}
			)
			.then(function(result1, result2) {
				strictEqual(result1, 'C');
				strictEqual(result2, 'D');
				start();
			});
	});

});
