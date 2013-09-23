define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if all values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var every = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i, list) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result !== true) {
						superDeferred.resolve(false);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(true);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return every;

});
