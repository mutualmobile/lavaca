define(function(require){

	var some = require('some');
	var Deferred = require('Deferred');


	module('some');


	asyncTest('some true', function() {
		expect(1);

		some([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(num === 3);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, true);
			start();
		});
	});


	asyncTest('some false', function() {
		expect(1);

		some([1,2,3], function() {
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


	asyncTest('some early return', function() {
		var call_order = [];

		some([1,2,3], function(x) {
			var deferred = new Deferred();
			setTimeout(function(){
				call_order.push(x);
				deferred.resolve(x === 2);
			}, x*10);
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
