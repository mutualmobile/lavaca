define(function(require){

	var filterSeries = require('filterSeries');
	var Deferred = require('Deferred');


	module('filterSeries');


	asyncTest('filterSeries', function() {
		expect(4);

		var completed = 0;

		filterSeries([1,2,3], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [1, 3]);
			start();
		});
	});

});
