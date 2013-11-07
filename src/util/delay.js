define(function() {
  /**
   * Wraps setTimeout and delays the execution of a function
   * @class lavaca.util.delay
   */
   /**
   * Delays the execution of a function
   * @method delay
   * @static
   *
   * @param {Function} callback  A callback to execute on delay
   */
   /**
   * Delays the execution of a function
   * @method delay
   * @static
   * @param {Function} callback  A callback to execute on delay
   * @param {Object} thisp  The object to use as the "this" keyword
   * @return {Number}  The timeout ID
   */
   /**
   * Delays the execution of a function
   * @method delay
   * @static
   * @param {Function} callback  A callback to execute on delay
   * @param {Object} thisp  The object to use as the "this" keyword
   * @param {Number} ms  The number of milliseconds to delay execution
   * @return {Number}  The timeout ID
   */
  var delay = function(callback, thisp, ms) {
    return setTimeout(function() {
      callback.call(thisp);
    }, ms || 0);
  };

  return delay;

});
