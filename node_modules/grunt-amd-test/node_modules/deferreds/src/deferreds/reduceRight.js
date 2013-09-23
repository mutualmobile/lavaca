define(function(require) {

	var reduce = require('./reduce');
	var map = require('mout/collection/map');
	var pluck = require('mout/collection/pluck');


	/**
	 * Right-associative version of reduce; eqivalent to reversing a list and
	 * then running reduce on it.
	 * @param {Array|Object} list
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Promise}
	 */
	var reduceRight = function(list, iterator, memo) {
		var reversed = map(list, function(val, i) {
			return {index: i, value: val};
		}).reverse();
		reversed = pluck(reversed, 'value');
		return reduce(reversed, iterator, memo);
	};


	return reduceRight;

});
