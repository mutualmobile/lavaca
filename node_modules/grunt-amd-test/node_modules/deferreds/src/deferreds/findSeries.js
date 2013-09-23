define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of find which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var findSeries = function(list, iterator) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, i) {
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


	return findSeries;

});
