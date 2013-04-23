define(function(require) {

  var Device = require('lavaca/env/Device'),
      EventDispatcher = require('lavaca/events/EventDispatcher'),
      Promise = require('lavaca/util/Promise');

  /**
   * @class Lavaca.env.Badge
   * @super Lavaca.events.EventDispatcher
   * A badge management utility (also accessible via window.plugins.badge)
   *
   * @event change
   *
   * @constructor
   */
  var Badge = EventDispatcher.extend({
    /**
     * @method get
     * Gets the current badge count
     *
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the current badge count
     */
    get: function() {
      return Device.exec('Badge', 'get');
    },
    /**
     * @method set
     * Sets the current badge count
     *
     * @param {Number} value  The new badge count
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     */
    set: function(value) {
      var self = this;
      return Device.exec('Badge', 'set', [value]).success(function(v) {
        self.trigger('change', {count: v});
      });
    },
    /**
     * @method increment
     *
     * @sig
     * Increases the current badge count by 1
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     *
     * @sig
     * Increases the current badge count by an amount
     * @param {Number} delta  The amount by which to increase the count
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     */
    increment: function(delta) {
      delta = delta || 1;
      var self = this,
          promise = new Promise();
      this.get()
        .success(function(v) {
          self.set(v + delta)
            .success(promise.resolver())
            .error(promise.rejector());
        })
        .error(promise.rejector());
      return promise;
    },
    /**
     * @method decrement
     *
     * @sig
     * Decreases the current badge count by 1
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     *
     * @sig
     * Decreases the current badge count by an amount
     * @param {Number} delta  The amount by which to decrease the count
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     */
    decrement: function(delta) {
      return this.increment(-(delta || 1));
    },
    /**
     * @method clear
     * Removes the badge
     *
     * @return {Lavaca.util.Promise}  A promise whose success callbacks will receive the new badge count
     */
    clear: function() {
      return this.set(0);
    }
  });

  Device.register('badge', Badge);

  return Badge;

});
