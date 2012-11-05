/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Device) {

/**
 * @class Lavaca.env.Badge
 * @super Lavaca.events.EventDispatcher
 * A badge management utility (also accessible via window.plugins.badge)
 *
 * @event change
 *
 * @constructor
 */
ns.Badge = Lavaca.events.EventDispatcher.extend({
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
        promise = new Lavaca.util.Promise();
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
    return self.increment(-(delta || 1));
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

Device.register('badge', ns.Badge);

})(Lavaca.env, Lavaca.env.Device);