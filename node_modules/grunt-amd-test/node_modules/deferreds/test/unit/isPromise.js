define(function(require){

	var isPromise = require('isPromise');
	var Deferred = require('Deferred');


	module('isPromise');


	test('isPromise', function() {
		var deferred = new Deferred();
		ok(isPromise(deferred), 'new Deferred isPromise: true');
		ok(isPromise(deferred.promise()), 'Promise isPromise: true');
		ok(!isPromise({}), 'Empty object isPromise: false');
	});

});
