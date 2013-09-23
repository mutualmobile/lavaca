define(function(require) {

	var Deferred = require('./Deferred');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var partial = require('mout/function/partial');
	var anyToDeferred = require('./anyToDeferred');
	var objkeys = require('mout/object/keys');
	var size = require('mout/collection/size');


	/**
	 * Executes all passed Functions one at a time, each time passing the
	 * result to the next function in the chain.
	 * @param {Any} tasks
	 * @return {Promise}
	 */
	var pipe = function(tasks) {

		var superDeferred = new Deferred();

		if (arguments.length > 1) {
			tasks = toArray(arguments);
		}

		if (!size(tasks)) {
			superDeferred.reject();
			return superDeferred;
		}

		var completed = 0;
		var keys;
		if (!isArray(tasks)) {
			keys = objkeys(tasks);
		}

		var iterate = function() {
			var task;
			var key;

			if (isArray(tasks)) {
				key = completed;
				task = tasks[key];
			}
			else {
				key = keys[completed];
				task = tasks[key];
			}

			var args = toArray(arguments);
			args.unshift(task);
			anyToDeferred( partial.apply(task, args) ).then(
				function() {
					completed += 1;
					if (completed === size(tasks)) {
						superDeferred.resolve.apply(superDeferred, arguments);
					}
					else {
						iterate.apply(superDeferred, arguments);
					}
				},
				function() {
					superDeferred.reject.apply(superDeferred, arguments);
				}
			);
		};

		iterate();

		return superDeferred.promise();

	};


	return pipe;

});
