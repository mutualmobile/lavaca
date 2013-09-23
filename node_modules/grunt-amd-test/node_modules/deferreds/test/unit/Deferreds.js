define(function(require){

	var Deferreds = require('Deferreds');
	var Deferred = require('Deferred');


	module('Deferreds (general tests)');


	var parallel = 'every filter find forEach map reject some'.split(' ');
	var series = 'filterSeries findSeries forEachSeries mapSeries reduce reduceRight rejectSeries'.split(' ');


	asyncTest('errors', function() {
		expect(parallel.length * 2 + series.length * 2);

		parallel.forEach(function(name) {
			var called = 0;
			Deferreds[name]([1, 2, 3], function() {
				called++;
				return Deferred().reject('error').promise();
			}).then(function() {
				ok(false, 'should not resolve');
			}).fail(function(err) {
				strictEqual(called, 3, name + ': parallel method failed, but called iterator for every item beforehand');
				strictEqual(err, 'error', name + ': fail() called');
				start();
			});
		});

		series.forEach(function(name) {
			var called = 0;
			Deferreds[name]([1, 2, 3], function() {
				called++;
				return Deferred().reject('error').promise();
			}).then(function() {
				ok(false, 'should not resolve');
			}).fail(function(err) {
				strictEqual(called, 1, name + ': series method failed fast');
				strictEqual(err, 'error', name + ': fail() called');
				start();
			});
		});
	});


	asyncTest('empty array', function() {
		var fns = parallel.concat(series);

		expect(fns.length);

		fns.forEach(function(name) {
			Deferreds[name]([], function() {
				ok(false, name + ': iterator should not be called');
			}).then(function() {
				ok(true, name + ': should call callback');
				start();
			});
		});
	});

});
