define(function(require){

	var every = require('every');
	var Deferred = require('Deferred');


	module('every');


	asyncTest('every true', function() {
		expect(1);

		every([1,2,3], function() {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(true);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, true);
			start();
		});
	});


	asyncTest('every false', function() {
		expect(1);

		every([1,2,3], function() {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(false);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, false);
			start();
		});
	});


	asyncTest('every early return', function() {
		var call_order = [];

		every([1,2,3], function(x) {
			var deferred = new Deferred();
			setTimeout(function(){
				call_order.push(x);
				deferred.resolve(x === 1);
			}, x*25);
			return deferred.promise();
		}).then(function() {
			call_order.push('callback');
		});

		setTimeout(function(){
			deepEqual(call_order, [1,2,'callback',3]);
			start();
		}, 100);
	});

});
