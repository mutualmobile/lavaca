define(function(require){

	var findSeries = require('findSeries');
	var Deferred = require('Deferred');


	module('findSeries');


	asyncTest('findSeries', function() {
		expect(4);

		var completed = 0;

		findSeries([1,2,3], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				var isEven = (num % 2 === 0);
				deferred.resolve(isEven);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, 2);
			start();
		});
	});


	asyncTest('findSeries fail', function() {
		expect(6);

		var completed = 0;

		findSeries([1,2,3,4,5], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				deferred.resolve(num === 6);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			strictEqual(result, undefined);
			start();
		});
	});

});
