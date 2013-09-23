define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var anyToDeferred = require('./anyToDeferred');
	var forEach = require('./forEach');
	var map = require('./map');


	/**
	 * Executes all passed Functions in parallel.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var parallel = function(tasks) {

		var superDeferred = new Deferred();

		var isArguments = false;
		if (arguments.length > 1) {
			isArguments = true;
			tasks = toArray(arguments);
		}

		if (isArray(tasks)) {
			map(tasks, function(task) {
				return anyToDeferred(task);
			}).then(
				function(results) {
					if (isArguments) {
						superDeferred.resolve.apply(superDeferred, results);
					}
					else {
						superDeferred.resolve(results);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}
		else {
			var results = {};
			forEach(tasks, function(task, key) {
				var deferred = anyToDeferred(task);
				return deferred.then(function(result) {
					results[key] = result;
				});
			}).then(
				function() {
					superDeferred.resolve(results);
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		}

		return superDeferred.promise();

	};


	return parallel;

});
