define(function(require){

	var find = require('find');
	var Deferred = require('Deferred');


	module('find');


	asyncTest('find', function() {
		expect(1);

		find([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				var isEven = (num % 2 === 0);
				deferred.resolve(isEven);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, 2);
			start();
		});
	});


	asyncTest('find fail', function() {
		expect(1);

		find([1,2,3,4,5], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(num === 6);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, undefined);
			start();
		});
	});

});
