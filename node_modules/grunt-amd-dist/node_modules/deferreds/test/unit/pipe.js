define(function(require){

	var pipe = require('pipe');
	var Deferred = require('Deferred');


	module('pipe');


	asyncTest('Basics', function() {
		expect(6);

		var call_order = [];
		pipe([
			function() {
				var deferred = new Deferred();
				setTimeout(function() {
					call_order.push('fn1');
					deferred.resolve('one', 'two');
				}, 0);
				return deferred.promise();
			},

			function(arg1, arg2) {
				var deferred = new Deferred();
				strictEqual(arg1, 'one');
				strictEqual(arg2, 'two');
				setTimeout(function() {
					call_order.push('fn2');
					deferred.resolve(arg1, arg2, 'three');
				}, 25);
				return deferred.promise();
			},

			function(arg1, arg2, arg3) {
				call_order.push('fn3');
				strictEqual(arg1, 'one');
				strictEqual(arg2, 'two');
				strictEqual(arg3, 'three');
				return 'four';
			},

			function() {
				call_order.push('fn4');
				deepEqual(call_order, ['fn1','fn2','fn3','fn4']);
			}
		]).then(function(){
			start();
		});

	});


	asyncTest('async', function() {
		var call_order = [];
		pipe([
			function() {
				var deferred = new Deferred();
				call_order.push(1);
				deferred.resolve();
				call_order.push(2);
				return deferred.promise();
			},
			function(){
				var deferred = new Deferred();
				call_order.push(3);
				deferred.resolve();
				return deferred.promise();
			},
			function(){
				deepEqual(call_order, [1,2,3]);
				start();
			}
		]);
	});


	asyncTest('error', function() {
		expect(1);

		pipe([
			function() {
				return Deferred().reject('error');
			},
			function(callback) {
				test.ok(false, 'next function should not be called');
				callback();
			}
		]).fail(function(err) {
			strictEqual(err, 'error');
		});

		setTimeout(start, 50);
	});

});
