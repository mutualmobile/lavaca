define(function(require){

	var whilst = require('whilst');
	var Deferred = require('Deferred');


	module('whilst');


	asyncTest('whilst', function() {
		var called = [];
		var count = 0;

		whilst(
			function() {
				called.push('test ' + count);
				return (count !== 5);
			},
			function() {
				var deferred = new Deferred();
				setTimeout(function() {
					called.push('iterator ' + count);
					count++;
					deferred.resolve();
				}, 10);
				return deferred.promise();
			}
		).then(function() {
			deepEqual(called, [
				'test 0',
				'iterator 0',
				'test 1',
				'iterator 1',
				'test 2',
				'iterator 2',
				'test 3',
				'iterator 3',
				'test 4',
				'iterator 4',
				'test 5'
			]);
			strictEqual(count, 5);
			start();
		});
	});

});
