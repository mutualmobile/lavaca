define(function(require) {

	var Deferred = require('./Deferred');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of filter which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var filterSeries = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = map(list, function(val, i) {
			return {index: i, value: val};
		});

		forEachSeries(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(function(result) {
					if (result === true) {
						results.push(item);
					}
				});
		}).then(
			function() {
				results = results.sort(function(a, b) {
					return a.index - b.index;
				});
				results = pluck(results, 'value');
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return filterSeries;

});
