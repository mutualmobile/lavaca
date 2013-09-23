define(function(require) {

	var forceNew = require('./forceNew');
	var anyToDeferred = require('./anyToDeferred');
	var Deferred = require('./Deferred');
	var Promise = require('./Promise');
	var Deferreds = require('./Deferreds');
	var forEach = require('mout/array/forEach');
	var toArray = require('mout/lang/toArray');
	var bind = require('mout/function/bind');
	var keys = require('mout/object/keys');


	var _inherits = function(childCtor, parentCtor) {
		var tempCtor = function() {};
		tempCtor.prototype = parentCtor.prototype;
		childCtor.prototype = new tempCtor();
		childCtor.prototype.constructor = childCtor;
	};


	/**
	 * @class
	 * @extends {Deferred}
	 * @param {Any} [wrapped]
	 */
	var Chainable = function(value) {
		if (!(this instanceof Chainable)) {
			return forceNew(Chainable, arguments, 'Chainable');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);

		//special: pass "undefined" for internal use in pipe().
		//this prevents resolve() from being called until pipe() has resolved.
		if (arguments.length === 1 && value === undefined) {
			return this;
		}

		anyToDeferred(value).then(bind(function() {
			if (arguments.length) {
				this.resolve.apply(this, arguments);
			}
			else {
				this.resolve();
			}
		}, this));
	};


	_inherits(Chainable, Deferred);


	/**
	 * @override
	 * @return {Chainable}
	 */
	Chainable.prototype.pipe = function(callback) {
		var chain = new Chainable(undefined);
		Deferred.prototype.pipe.call(this, callback).then(function() {
			chain.resolve.apply(chain, arguments);
		});
		return chain;
	};


	var chained = keys(Deferreds).filter(function(key) {
		return key !== 'pipe';
	});


	forEach(chained, function(key) {
		Chainable.prototype[key] = function() {
			var args = toArray(arguments);

			return this.pipe(function(prev) {
				if (prev !== undefined) {
					args.unshift(prev);
				}
				return Deferreds[key].apply(undefined, args);
			});
		};
	});


	/**
	 * @name Deferreds.chain
	 * @method
	 * @param {Any} [wrapped]
	 * @return {Chainable}
	 */
	Deferreds.chain = Chainable;


	return Chainable;


	/**
	 * @name Chainable#every
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filter
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#filterSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#find
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#findSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEach
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#forEachSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#map
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#mapSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#parallel
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduce
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reduceRight
	 * @method
	 * @param {Function} iterator
	 * @param {Any} memo
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#reject
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#rejectSeries
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#series
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#some
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#sortBy
	 * @method
	 * @param {Function} iterator
	 * @return {Chainable}
	 */

	/**
	 * @name Chainable#pipe
	 * @method
	 * @param {Any} tasks
	 * @return {Chainable}
	 */


});
