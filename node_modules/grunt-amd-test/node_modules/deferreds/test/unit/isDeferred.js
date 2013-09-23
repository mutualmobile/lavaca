define(function(require){

	var isDeferred = require('isDeferred');
	var Deferred = require('Deferred');


	module('isDeferred');


	test('isDeferred', function() {
		var deferred = new Deferred();
		ok(isDeferred(deferred), 'new Deferred isDeferred: true');
		ok(!isDeferred(deferred.promise()), 'Promise isDeferred: false');
		ok(!isDeferred({}), 'Empty object isDeferred: false');
	});

});
