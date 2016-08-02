import {default as Disposable} from '../util/Disposable';

/**
 * Basic event dispatcher type
 * @class lavaca.events.EventDispatcher
 * @extends lavaca.util.Disposable
 * @constructor
 *
 */
var EventDispatcher = Disposable.extend(function EventDispatcher() {
  this.callbacks = [];
}, {
  /**
   * When true, do not fire events
   * @property suppressEvents
   * @type Boolean
   * @default false
   *
   */
  suppressEvents: false,
  /**
   * Bind an event handler to this object
   * @method on
   *
   * @param {String} type  The name of the event plus optional namespaces e.g.
   * "event.namespace" or "event.namespace1.namespace2"
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  on(spec, callback) {
    let parts = spec.split('.');
    let type = parts[0];
    let namespaces = parts.slice(1);

    this.callbacks.push({
      type: type,
      namespaces: namespaces,
      fn: callback
    });

    return this;
  },
  /**
   * Unbinds all event handler from this object
   * @method off
   *
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  /**
   * Unbinds all event handlers for an event and/or namespace
   * @method off
   *
   * @param {String} type  The name of the event and/or optional namespaces,
   * e.g. "event", "event.namespace", or ".namespace"
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  /**
   * Unbinds a specific event handler
   * @method off
   *
   * @param {String} type  The name of the event
   * @param {Function} callback  The function handling the event
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  off(spec, callback) {
    let hasCallbackArgument = (arguments.length === 2);

    if (arguments.length === 0) {
      this.callbacks = [];
      return this;
    }

    let parts = spec.split('.');
    let type = parts[0];
    let namespaces = parts.slice(1);

    this.callbacks = this.callbacks.filter((item) => {
      let matchesType = (item.type === type);

      if (!type) {
        matchesType = true;
      }

      let matchesNamespace = namespaces.some((ns) => {
        return item.namespaces.indexOf(ns) !== -1;
      });

      if (!namespaces.length) {
        matchesNamespace = true;
      }

      let matchesCallback = item.fn === callback;

      if (!hasCallbackArgument) {
        matchesCallback = true;
      }

      return !(matchesType && matchesNamespace && matchesCallback);
    });

    return this;
  },
  /**
   * Dispatches an event
   * @method trigger
   *
   * @param {String} type  The type of event to dispatch
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  /**
   * Dispactches an event with additional parameters
   * @method trigger
   *
   * @param {String} type  The type of event to dispatch
   * @param {Object} params  Additional data points to add to the event
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  trigger(type, params) {
    if (this.suppressEvents) {
      return this;
    }

    this.callbacks.forEach((item) => {
      if (item.type === type) {
        item.fn(params);
      }
    });

    return this;
  }
});

export default EventDispatcher;
