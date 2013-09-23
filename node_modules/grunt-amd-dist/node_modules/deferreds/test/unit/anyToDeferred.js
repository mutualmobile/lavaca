define(function(require){

	var anyToDeferred = require('anyToDeferred');
	var Deferred = require('Deferred');
	var isPromise = require('isPromise');


	module('anyToDeferred');


	test('anyToDeferred', function() {
		var check;

		check = Deferred();
		strictEqual(anyToDeferred(check), check, 'Deferred object: returns same Deferred object');

		check = Deferred().promise();
		strictEqual(anyToDeferred(check), check, 'Promise object: returns same Promise object');

		check = {};
		ok(isPromise(anyToDeferred(check)), 'plain object');

		check = function() {
			return {};
		};
		ok(isPromise(anyToDeferred(check)), 'function returning plain object');
		anyToDeferred(check).then(function(val) {
			deepEqual(val, {}, 'function returning plain object: resolves to return value');
		});

		var dfr = Deferred();
		check = function() {
			return dfr;
		};
		strictEqual(anyToDeferred(check), dfr, 'function returning Deferred: returns same Deferred');

		check = function() {
			return dfr.promise();
		};
		strictEqual(anyToDeferred(check), dfr.promise(), 'function returning Promise: returns same Promise');

	});

});
