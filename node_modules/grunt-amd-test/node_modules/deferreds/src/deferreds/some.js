define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns `true` if any values in `list` pass `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var some = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						superDeferred.resolve(true);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(false);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return some;

});
