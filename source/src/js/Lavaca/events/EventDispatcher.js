/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Disposable) {

/** 
 * @class Lavaca.events.EventDispatcher
 * @super Lavaca.util.Disposable
 * Basic event dispatcher type
 *
 * @constructor
 */
ns.EventDispatcher = Disposable.extend({
  /**
   * @field {Boolean} suppressEvents
   * @default false
   * When true, do not fire events
   */
  suppressEvents: false,
  /**
   * @method on
   *
   * Bind an event handler to this object
   *
   * @sig
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   *
   * @sig
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @param {Object} thisp  The context of the handler
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  on: function(type, callback, thisp) {
    var calls = this.callbacks || (this.callbacks = {}),
        list = calls[type] || (calls[type] = []);
    list[list.length] = {fn: callback, thisp: thisp};
    return this;
  },
  /**
   * @method off
   *
   * @sig
   * Unbinds all event handler from this object
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   *
   * @sig
   * Unbinds all event handlers for an event
   * @param {String} type  The name of the event
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   *
   * @sig
   * Unbinds a specific event handler
   * @param {String} type  The name of the event
   * @param {Function} callback  The function handling the event
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   *
   * @sig
   * Unbinds a specific event handler
   * @param {String} type  The name of the event
   * @param {Function} callback  The function handling the event
   * @param {Object} thisp  The context of the handler
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  off: function(type, callback, thisp) {
    var calls = this.callbacks,
        list,
        handler,
        i = -1,
        newList,
        isCallback,
        isThisp;
    if (!type) {
      delete this.callbacks;
    } else if (calls) {
      if (!callback) {
        delete calls[type];
      } else {
        list = calls[type];
        if (list) {
          newList = calls[type] = [];
          while (handler = list[++i]) {
            isCallback = handler.fn == callback || handler.fn.fn == callback;
            isThisp = thisp && (handler.thisp == thisp || handler.fn.thisp == thisp);
            if (!isCallback || (isCallback && (!thisp || !isThisp))) {
              newList[newList.length] = handler;
            }
          }
        }
      }
    }
    return this;
  },
  /**
   * @method trigger
   * Dispatches an event
   *
   * @sig
   * @param {String} type  The type of event to dispatch
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   *
   * @sig
   * @param {String} type  The type of event to dispatch
   * @param {Object} params  Additional data points to add to the event
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  trigger: function(type, params) {
    if (!this.suppressEvents && this.callbacks) {
      var list = this.callbacks[type],
          event = this.createEvent(type, params),
          i = -1,
          handler;
      if (list) {
        while (handler = list[++i]) {
          handler.fn.apply(handler.thisp || this, [event]);
        }
      }
    }
    return this;
  },
  /**
   * @method createEvent
   * Creates an event object
   *
   * @sig
   * @param {String} type  The type of event to create
   * @return {Object}  The event object
   *
   * @sig
   * @param {String} type  The type of event to create
   * @param {Object} params  Additional data points to add to the event
   * @return {Object}  The event object
   */
  createEvent: function(type, params) {
    return Lavaca.merge({}, params || {}, {
      type: type,
      target: params && params.target ? params.target : this,
      currentTarget: this
    });
  }
});

})(Lavaca.resolve('Lavaca.events', true), Lavaca.util.Disposable);