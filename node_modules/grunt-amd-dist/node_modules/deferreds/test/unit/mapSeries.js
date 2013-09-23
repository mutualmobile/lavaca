define(function(require){

	var mapSeries = require('mapSeries');
	var Deferred = require('Deferred');


	module('mapSeries');


	asyncTest('mapSeries', function() {
		expect(4);

		var completed = 0;

		mapSeries([1, 2, 3], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				deferred.resolve(num * 2);
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2, 4, 6]);
			start();
		});
	});

});
