define(function(require) {

  var extend = require('./extend');

  /**
   * Utility type for asynchronous programming
   * @class lavaca.util.Promise
   *
   * @constructor
   *
   * @param {Object} thisp  What the "this" keyword resolves to in callbacks
   */
  var Promise = extend(function(thisp) {
    /**
     * What the "this" keyword resolves to in callbacks
     * @property {Object} thisp
     * @default null
     */
    this.thisp = thisp;
    /**
     * Pending handlers for the success event
     * @property {Array} resolvedQueue
     * @default []
     */
    this.resolvedQueue = [];
    /**
     * Pending handlers for the error event
     * @property {Array} rejectedQueue
     * @default []
     */
    this.rejectedQueue = [];
  }, {
    /**
     * Flag indicating that the promise completed successfully
     * @property {Boolean} succeeded
     * @default false
     */
    succeeded: false,
    /**
     * Flag indicating that the promise failed to complete
     * @property {Boolean} failed
     * @default false
     */
    failed: false,
    /**
     * Queues a callback to be executed when the promise succeeds
     * @method success
     *
     * @param {Function} callback  The callback to execute
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    success: function(callback) {
      if (callback) {
        if (this.succeeded) {
          callback.apply(this.thisp, this.resolveArgs);
        } else {
          this.resolvedQueue.push(callback);
        }
      }
      return this;
    },
    /**
     * Queues a callback to be executed when the promise fails
     * @method error
     *
     * @param {Function} callback  The callback to execute
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    error: function(callback) {
      if (callback) {
        if (this.failed) {
          callback.apply(this.thisp, this.rejectArgs);
        } else {
          this.rejectedQueue.push(callback);
        }
      }
      return this;
    },
    /**
     * Queues a callback to be executed when the promise is either rejected or resolved
     * @method always
     * 
     * @param {Function} callback  The callback to execute
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    always: function(callback) {
      return this.then(callback, callback);
    },
    /**
     * Queues up callbacks after the promise is completed
     * @method then
     *
     * @param {Function} resolved  A callback to execute when the operation succeeds
     * @param {Function} rejected  A callback to execute when the operation fails
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    then: function(resolved, rejected) {
      return this
        .success(resolved)
        .error(rejected);
    },
    /**
     * Resolves the promise successfully
     * @method resolve
     *
     * @params {Object} value  Values to pass to the queued success callbacks
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    resolve: function(/* value1, value2, valueN */) {
      if (!this.succeeded && !this.failed) {
        this.succeeded = true;
        this.resolveArgs = [].slice.call(arguments, 0);
        var i = -1,
            callback;
        while (!!(callback = this.resolvedQueue[++i])) {
          callback.apply(this.thisp, this.resolveArgs);
        }
      }
      return this;
    },
    /**
     * Resolves the promise as a failure
     * @method reject
     *
     * @params {String} err  Failure messages
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    reject: function(/* err1, err2, errN */) {
      if (!this.succeeded && !this.failed) {
        this.failed = true;
        this.rejectArgs = [].slice.call(arguments, 0);
        var i = -1,
            callback;
        while (!!(callback = this.rejectedQueue[++i])) {
          callback.apply(this.thisp, this.rejectArgs);
        }
      }
      return this;
    },
    /**
     * Queues this promise to be resolved only after several other promises
     *   have been successfully resolved, or immediately rejected when one
     *   of those promises is rejected
     * @method when
     *
     * @params {Lavaca.util.Promise}  promise  One or more other promises
     * @return {Lavaca.util.Promise}  This promise (for chaining)
     */
    when: function(/* promise1, promise2, promiseN */) {
      var self = this,
          values = [],
          i = -1,
          pendingPromiseCount = arguments.length,
          promise;
      while (!!(promise = arguments[++i])) {
        (function(index) {
          promise
            .success(function(v) {
              values[index] = v;
              if (--pendingPromiseCount < 1) {
                self.resolve.apply(self, values);
              }
            })
            .error(function() {
              self.reject.apply(self, arguments);
            });
        })(i);
      }
      promise = null;
      return this;
    },
    /**
     * Produces a callback that resolves the promise with any number of arguments
     * @method resolver
     * @return {Function}  The callback
     */
    resolver: function() {
      var self = this;
      return function() {
        self.resolve.apply(self, arguments);
      };
    },
    /**
     * Produces a callback that rejects the promise with any number of arguments
     * @method rejector
     *
     * @return {Function}  The callback
     */
    rejector: function() {
      var self = this;
      return function() {
        self.reject.apply(self, arguments);
      };
    }
  });
  /**
   *
   * Creates a promise to be resolved only after several other promises
   *   have been successfully resolved, or immediately rejected when one
   *   of those promises is rejected
   * @method when
   * @static
   * @params {Lavaca.util.Promise}  promise  One or more other promises
   * @return {Lavaca.util.Promise}  The new promise
   */
   /**
   * Creates a promise to be resolved only after several other promises
   *   have been successfully resolved, or immediately rejected when one
   *   of those promises is rejected
   * @method when
   * @static
   * @param {Object} thisp  The execution context of the promise
   * @params {Lavaca.util.Promise}  promise  One or more other promises
   * @return {Lavaca.util.Promise}  The new promise
   */
  Promise.when = function(thisp/*, promise1, promise2, promiseN */) {
    var thispIsPromise = thisp instanceof Promise,
        promise = new Promise(thispIsPromise ? window : thisp),
        args = [].slice.call(arguments, thispIsPromise ? 0 : 1);
    return promise.when.apply(promise, args);
  };

  return Promise;

});
