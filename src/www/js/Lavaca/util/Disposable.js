define(function(require) {

  var extend = require('./extend');

  /**
   * @class Lavaca.util.Disposable
   * Abstract type for types that need to ready themselves for GC
   *
   * @constructor
   */
  var Disposable = extend({
    /**
     * @method dispose
     * Readies the object to be garbage collected
     */
    dispose: function() {
    }
  });

  return Disposable;

});
