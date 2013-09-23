define(function(require) {

	var forceNew = require('./forceNew');
	var isArray = require('mout/lang/isArray');
	var toArray = require('mout/lang/toArray');
	var bind = require('mout/function/bind');
	var mixin = require('mout/object/mixIn');
	var isDeferred = require('./isDeferred');
	var isPromise = require('./isPromise');
	var Promise = require('./Promise');


	//apply each callback in `callbacks` with `args`
	var _execute = function(callbacks, args) {
		if (!callbacks) {
			return;
		}

		if (!isArray(callbacks)) {
			callbacks = [callbacks];
		}

		for (var i = 0; i < callbacks.length; i++) {
			callbacks[i].apply(null, args);
		}
	};


	/**
	 * @class
	 */
	var Deferred = function() {
		if (!(this instanceof Deferred)) {
			return forceNew(Deferred, arguments, 'Deferred');
		}

		this._state = Deferred.State.PENDING;
		this._callbacks = {
			done: [],
			fail: [],
			progress: []
		};
		this._closingArguments = [];
		this._promise = new Promise(this);
	};


	mixin(Deferred.prototype, /** @lends Deferred.prototype */ {

		/**
		 * @return {Promise}
		 */
		promise: function() {
			return this._promise;
		},


		/**
		 * @return {Deferred.State}
		 */
		state: function() {
			return this._state;
		},


		/**
		 * @param {...Any} args
		 * @return this
		 */
		resolve: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.RESOLVED;
			_execute(this._callbacks.done, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @param {...Any} args
		 * @return this
		 */
		reject: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			this._state = Deferred.State.REJECTED;
			_execute(this._callbacks.fail, arguments);
			this._closingArguments = arguments;
			return this;
		},


		/**
		 * @return this
		 */
		notify: function() {
			if (this._state !== Deferred.State.PENDING) { //already resolved/rejected
				return this;
			}

			_execute(this._callbacks.progress, arguments);
			return this;
		},


		/**
		 * @param {Function} doneCallback
		 * @param {Function} [failCallback]
		 * @param {Function} [progressCallback]
		 * @return this
		 */
		then: function(doneCallback, failCallback, progressCallback) {
			if (this._state === Deferred.State.RESOLVED) {
				_execute(doneCallback, this._closingArguments);
				return this;
			}

			if (this._state === Deferred.State.REJECTED) {
				_execute(failCallback, this._closingArguments);
				return this;
			}

			if (doneCallback) {
				this._callbacks.done.push(doneCallback);
			}

			if (failCallback) {
				this._callbacks.fail.push(failCallback);
			}

			if (progressCallback) {
				this._callbacks.progress.push(progressCallback);
			}

			return this;
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		done: function(callback) {
			return this.then(callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		fail: function(callback) {
			return this.then(undefined, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		always: function(callback) {
			return this.then(callback, callback);
		},


		/**
		 * @param {Function} callback
		 * @return this
		 */
		progress: function(callback) {
			return this.then(undefined, undefined, callback);
		},


		/**
		 * @param {Function} callback
		 * @return {Promise}
		 */
		pipe: function(callback) {
			var deferred = new Deferred();

			this
				.fail(bind(deferred.reject, deferred))
				.done(function() {
					var args = toArray(arguments);

					var callbackDeferred = (function() {
						var result = callback.apply(callback, args);
						if (isDeferred(result) || isPromise(result)) {
							return result;
						}
						return new Deferred().resolve(result).promise();
					})();

					callbackDeferred
						.fail(bind(deferred.reject, deferred))
						.done(bind(deferred.resolve, deferred))
						.progress(bind(deferred.notify, deferred));
				})
				.progress(bind(deferred.notify, deferred));

			return deferred.promise();
		}

	});


	/**
	 * @enum {String}
	 * @const
	 */
	Deferred.State = {
		PENDING: "pending",
		RESOLVED: "resolved",
		REJECTED: "rejected"
	};


	return Deferred;

});
