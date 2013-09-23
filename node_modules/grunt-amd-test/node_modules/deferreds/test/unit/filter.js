define(function(require){

	var filter = require('filter');
	var Deferred = require('Deferred');


	module('filter');


	asyncTest('filter', function() {
		expect(1);

		filter([1,2,3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [1, 3]);
			start();
		});
	});

});
