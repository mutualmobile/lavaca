define(function(require) {

	var Deferred = require('./Deferred');
	var forEach = require('./forEach');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Returns the first value in `list` matching the `iterator` truth test
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var find = function(list, iterator) {

		var superDeferred = new Deferred();

		forEach(list, function(item, i) {
			return anyToDeferred(iterator(item, i, list))
				.then(function(result) {
					if (result) {
						superDeferred.resolve(item);
					}
				});
		}).then(
			function() {
				superDeferred.resolve(undefined);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return find;

});
