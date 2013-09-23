define(function(require) {

	var Deferred = require('./Deferred');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Boils a `list` of values into a single value.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Promise}
	 */
	var reduce = function(list, iterator, memo) {

		var superDeferred = new Deferred();

		forEachSeries(list, function(item, key) {
			return anyToDeferred(iterator(memo, item, key, list))
				.then(function(result) {
					memo = result;
				});
		}).then(
			function() {
				superDeferred.resolve(memo);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return reduce;

});
