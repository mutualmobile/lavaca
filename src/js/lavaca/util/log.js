define(function() {
  /**
   * Logs to the console (or alerts if no console exists)
   * @class lavaca.util.log
   */
   /**
   * Logs to the console (or alerts if no console exists)
   * @method log
   * @static
   *
   * @params {Object} arg  The content to be logged
   */
  var log = function() {
    if (window.console) {
      console.log.apply(console, arguments);
    } else {
      alert([].join.call(arguments, ' '));
    }
  };

  return log;

});
