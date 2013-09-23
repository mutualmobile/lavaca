define(function(require){

	var forEach = require('forEach');
	var Deferred = require('Deferred');


	module('forEach');


	asyncTest('forEach', function() {
		expect(1);

		var args = [];

		forEach([1, 3, 2], function(num) {
			var deferred = new Deferred();
			setTimeout(function(){
				args.push(num);
				deferred.resolve();
			}, num * 10);
			return deferred.promise();
		}).then(function() {
			deepEqual(args, [1, 2, 3]);
			start();
		});
	});

});
