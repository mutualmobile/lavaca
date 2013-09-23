define(function(require){

	var reduce = require('reduce');
	var Deferred = require('Deferred');


	module('reduce');


	asyncTest('reduce', function() {
		expect(1);

		reduce([1, 2, 3], function(memo, num) {
			var deferred = new Deferred();
			setTimeout(function(){
				deferred.resolve(num + memo);
			}, 10);
			return deferred.promise();
		}, 0).then(function(result) {
			strictEqual(result, 6);
			start();
		});
	});


});
