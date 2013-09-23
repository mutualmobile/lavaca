define(function(require){

	var forEachSeries = require('forEachSeries');
	var Deferred = require('Deferred');


	module('forEachSeries');


	asyncTest('forEachSeries', function() {
		expect(4);

		var args = [];
		var completed = 0;

		forEachSeries([1, 3, 2], function(num, i) {
			var deferred = new Deferred();

			setTimeout(function(){
				strictEqual(completed, i + 1, num + ' waited for previous to complete');
				args.push(num);
				deferred.resolve();
			}, 10);

			completed++;
			return deferred.promise();
		}).then(function() {
			deepEqual(args, [1, 3, 2]);
			start();
		});
	});

});
