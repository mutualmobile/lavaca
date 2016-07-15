import { contains } from 'mout/array';
import { merge, forOwn } from 'mout/object';
import { default as EventDispatcher } from '../events/EventDispatcher';
import Observable from '../util/Observable';
/**
 * Basic model type
 * @class lavaca.mvc.Model
 * @extends lavaca.events.EventDispatcher
 *
 * Place the events where they are triggered in the code, see the yuidoc syntax reference and View.js for rendersuccess trigger
 * @event change
 * @event invalid
 *
 * @constructor
 * @param {Object} [map]  A parameter hash to apply to the model
 */
var Model = EventDispatcher.extend(function Model(map) {
  EventDispatcher.call(this);
  this.attributes = new Observable(map);
}, {
  /**
   * Gets the value of a attribute
   * @method get
   *
   * @param {String} attribute  The name of the attribute
   * @return {Object}  The value of the attribute, or null if there is no value
   */
  get(attribute) {
    var attr = this.attributes[attribute];
    if (typeof attr === 'function') {
      return attr.call(this);
    }
    return attr;
  },
  
  /**
   * Sets a value and calls $apply() to trigger a change event
   * @method set
   * @param {String} key  The property name you want to change/set
   * @param {Object} value  Sets the value in of the property
   */
  /**
   * Sets a value and calls $apply() to trigger a change event
   * @method set
   * @param {String} key  The property name you want to change/set
   * @param {Object} value  Sets the value in of the property
   * @param {Function} fn  An optional function to modify how the values are added (merge, append, fillIn... etc)
   */
  /**
   * Sets a value and calls $apply() to trigger a change event
   * @method set
   * @param {String} key  The property name you want to change/set
   * @param {Object} value  Sets the value in of the property
   * @param {Boolean} fn  Merge attributes by default
   */
  set(key, value, fn){
    if(typeof key == 'object'){
      for(let k in key){
        this.set(k, key[k], fn);
      }
    }
    else{
      try{
        this.attributes[key] = typeof fn == 'function' ? fn(this.attributes[key] ,value) : (fn ? merge(this.attributes[key] ,value) : value);
      }catch(e){}
    }
    this.attributes.$apply();
  },
  /**
   * Determines whether or not this model has a named attribute
   * @method has
   *
   * @param {String} attribute  The name of the attribute
   * @return {Boolean}  True if the attribute exists and has a value
   */
  has(attribute) {
    return this.get(attribute) !== undefined;
  },
  /**
   * Sets each attribute of this model according to the map
   * @method apply
   *
   * @param {Object} map  The string or key-value map to parse and apply
   */
  /**
   * Sets each attribute of this model according to the map
   * @method apply
   *
   * @param {Object} map  The string or key-value map to parse and apply
   * @param {Boolean} suppress  When true, validation, events and tracking are suppressed
   */
  apply(map) {
    return this.attributes.$apply(map);
  },
  /**
   * Removes all data from the model or removes selected flag from model.
   * @method clear
   *
   * @sig
   * Removes all flagged data from the model
   */
  clear() {
    this.attributes = new Observable();
  },
  /**
   * Makes a copy of this model
   * @method clone
   *
   * @return {Lavaca.mvc.Model}  The copy
   */
  clone() {
    return new this.constructor(this.attributes);
  },
  /**
   * Converts this model to a key-value hash
   * @method toObject
   *
   * @return {Object}  The key-value hash
   */
  toObject() {
    var obj = this.attributes,
        flags;
    for(var key in obj) {
      if(typeof obj[key] === "function") {
        flags = this.flags[Model.d];
        if (!flags || flags.indexOf(key) === -1) {
          obj[key] = obj[key].call(this);
        }
      }
    }
    return obj;
  },
  /**
   * Converts this model to JSON
   * @method toJSON
   *
   * @return {String}  The JSON string representing the model
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  },
  /**
   * Bind an event handler to this object
   * @method on
   *
   *
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  on(key,callback) {
    if(key.split('.')[0] == 'change'){
      return this.attributes.$on(key,callback);
    }
    return EventDispatcher.prototype.on.call(this, key, callback);
  },
  /**
   * Bind an event handler to this object
   * @method off
   *
   *
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  off(key,callback) {
    if(key.split('.')[0] == 'change'){
      return this.attributes.$off(key,callback);
    }
    return EventDispatcher.prototype.off.call(this, key, callback);
  }
});
export default Model;