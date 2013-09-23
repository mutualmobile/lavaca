define(function(require){

	var reduceRight = require('reduceRight');
	var Deferred = require('Deferred');


	module('reduceRight');


	asyncTest('reduceRight', function() {
		expect(2);

		var called = [];

		reduceRight([1, 2, 3], function(memo, num) {
			var deferred = new Deferred();
			setTimeout(function(){
				called.push(num);
				deferred.resolve(num + memo);
			}, 10);
			return deferred.promise();
		}, 0).then(function(result) {
			deepEqual(called, [3, 2, 1]);
			strictEqual(result, 6);
			start();
		});
	});

});
