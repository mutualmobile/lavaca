define(function(require) {

	var Deferred = require('./Deferred');
	var cmap = require('mout/collection/map');
	var forEachSeries = require('./forEachSeries');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Version of map which is guaranteed to process items in order
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var mapSeries = function(list, iterator) {

		var superDeferred = new Deferred();
		var results = [];

		list = cmap(list, function (val, i) {
			return {index: i, value: val};
		});

		forEachSeries(list, function(item) {
			return anyToDeferred(iterator(item.value, item.index, list))
				.then(
					function(transformed) {
						results[item.index] = transformed;
					},
					function(err) {
						results[item.index] = err;
					}
				);
		}).then(
			function() {
				superDeferred.resolve(results);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return mapSeries;

});
