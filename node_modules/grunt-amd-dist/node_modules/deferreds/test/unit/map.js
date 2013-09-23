define(function(require){

	var map = require('map');
	var Deferred = require('Deferred');


	module('map');


	asyncTest('map', function() {
		expect(1);

		map([1, 2, 3], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(num * 2);
			}, 10);
			return deferred.promise();
		}).then(function(result) {
			deepEqual(result, [2, 4, 6]);
			start();
		});
	});

});
