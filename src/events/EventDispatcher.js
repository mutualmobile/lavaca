import { default as Disposable } from '../util/Disposable'
import {deepMixIn} from 'mout/object'

/**
 * Basic event dispatcher type
 * @class lavaca.events.EventDispatcher
 * @extends lavaca.util.Disposable
 * @constructor
 *
 */
var EventDispatcher = Disposable.extend({
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
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  /**
   * Bind an event handler to this object
   * @method on
   *
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
   * Unbinds all event handler from this object
   * @method off
   *
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  /**
   * Unbinds all event handlers for an event
   * @method off
   *
   * @param {String} type  The name of the event
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
  /**
   * Unbinds a specific event handler
   * @method off
   *
   * @param {String} type  The name of the event
   * @param {Function} callback  The function handling the event
   * @param {Object} thisp  The context of the handler
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  off: function(type, callback, thisp) {
    var calls = this.callbacks,
        list,
        isThisp;
    if (!type) {
      delete this.callbacks;
    } else if (calls) {
      if (!callback) {
        delete calls[type];
      } else {
        list = calls[type];
        if (list) {
          for(let i = list.length-1; i >= 0; i--) {
            isThisp = thisp && (list[i].thisp === thisp || list[i].fn.thisp === thisp);
            if (_checkIfSameCallback(list[i].fn,callback) || (thisp && !isThisp)){
              calls[type].splice(i,1);
            }
          }
        }
      }
    }
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
  trigger: function(type, params) {
    if (!this.suppressEvents && this.callbacks) {
      var list = _getMatchingCallbacks.call(this,type),
          event = this.createEvent(type, params),
          e = -1,
          ev,
          handler;
      if (list) {
        while (!!(ev = list[++e])) {
          var i = -1;
          while (!!(handler = ev[++i])) {
              handler.fn.apply(handler.thisp || this, [event]);
          }
        }
      }
    }
    return this;
  },
  /**
   * Creates an event object
   * @method createEvent
   *
   * @param {String} type  The type of event to create
   * @return {Object}  The event object
   */
   /**
   * Creates an event object with additional params
   * @method createEvent
   *
   * @param {String} type  The type of event to create
   * @param {Object} params  Additional data points to add to the event
   * @return {Object}  The event object
   */
  createEvent: function(type, params) {
    return deepMixIn({}, params || {}, {
      type: type,
      target: params && params.target ? params.target : this,
      currentTarget: this
    });
  }
});
  /**
   * Returns all callbacks that match a specific trigger event
   * @method _getMatchingCallbacks (private)
   *
   * @param {String} The trigger event type as a string
   * @return {Array}  returns Array matching all callbacks
   */

  /*
    Returns all callbacks that match a specific trigger event
  */
var _getMatchingCallbacks = function(type){
  var returnCallbacks = [];
  if(type == 'contentLoaded'){
    //debugger;
  }
  for(let x in this.callbacks){
    if(x.split){
      if(x.split('.')[0] === type){
        returnCallbacks.push(this.callbacks[x]);
      }
    }
  }
  return returnCallbacks;
}


  /**
   * Checks if two callbacks are the same
   * @method _checkIfSameCallback (private)
   *
   * @param {Function} a first function
   * @param {Function} b function to compare a to
   * @return {Boolean}  returns true or false
   */

  /*
    checks if callback a matches b, then checks if a.fn matches b, 
    then checks if it is jQuery/zepto proxy of callback
   */
  let _checkIfSameCallback = (a, b)=>{
  if((a === b || 
     a.fn === b ||
     (a.fn && !!a.fn.guid && a.fn.guid === b.guid ||
      a.fn && !!a.fn._zid && a.fn._zid === b._zid))){
    return true;
  }
  else{
    return false;
  }
}

export default EventDispatcher;