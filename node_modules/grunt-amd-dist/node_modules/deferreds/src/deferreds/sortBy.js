define(function(require) {

	var Deferred = require('./Deferred');
	var map = require('./map');
	var pluck = require('mout/collection/pluck');
	var anyToDeferred = require('./anyToDeferred');


	/**
	 * Produces a sorted copy of `list`, ranked by the results of running each
	 * item through `iterator`
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @return {Promise}
	 */
	var sortBy = function(list, iterator) {

		var superDeferred = new Deferred();

		map(list, function(item, i) {

			var deferred = new Deferred();
			anyToDeferred(iterator(item, i, list))
				.then(function(criteria) {
					deferred.resolve({
						index: i,
						value: item,
						criteria: criteria
					});
				});
			return deferred.promise();

		}).then(
			function(result) {
				result = result.sort(function(left, right) {
					var a = left.criteria;
					var b = right.criteria;

					if (a !== b) {
						if (a > b || a === undefined) {
							return 1;
						}
						if (a < b || b === undefined) {
							return -1;
						}
					}

					if (left.index < right.index) {
						return -1;
					}

					return 1;
				});

				result = pluck(result, 'value');
				superDeferred.resolve(result);
			},
			function() {
				superDeferred.reject.apply(superDeferred, arguments);
			}
		);

		return superDeferred.promise();

	};


	return sortBy;

});
