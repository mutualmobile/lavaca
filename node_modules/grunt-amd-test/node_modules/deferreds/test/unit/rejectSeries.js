define(function(require){

	var rejectSeries = require('rejectSeries');
	var Deferred = require('Deferred');


	module('rejectSeries');


	asyncTest('rejectSeries', function() {
		expect(4);

		var completed = 0;

		rejectSeries([1,2,3], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				var isOdd = (num % 2 !== 0);
				deferred.resolve(isOdd);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2]);
			start();
		});
	});

});
