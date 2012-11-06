/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Disposable) {

var UNDEFINED;

/** 
 * @class Lavaca.util.Cache
 * @super Lavaca.util.Disposable
 * Object for storing data
 */
ns.Cache = Disposable.extend({
  /**
   * @method get
   * Retrieves an item from the cache
   *
   * @sig
   * @param {String} id  The key under which the item is stored
   * @return {Object}  The stored item (or null if no item is stored)
   *
   * @sig
   * @param {String} id  The key under which the item is stored
   * @param {Object} def  A default value that will be added, if there is no item stored
   * @return {Object}  The stored item (or null if no item is stored and no default)
   */
  get: function(id, def) {
    var result = this['@' + id];
    if (result === UNDEFINED && def !== UNDEFINED) {
      result = this['@' + id] = def;
    }
    return result === UNDEFINED ? null : result;
  },
  /**
   * @method set
   * Assigns an item to a key in the cache
   *
   * @param {String} id  The key under which the item will be stored
   * @param {Object} value  The object to store in the cache
   */
  set: function(id, value) {
    this['@' + id] = value;
  },
  /**
   * @method add
   * Adds an item to the cache
   *
   * @param {Object} value  The object to store in the cache
   * @return {String}  The auto-generated ID under which the value was stored
   */
  add: function(value) {
    var id = Lavaca.uuid();
    this.set(id, value);
    return id;
  },
  /**
   * @method remove
   * Removes an item from the cache (if it exists)
   *
   * @param {String} id  The key under which the item is stored
   */
  remove: function(id) {
    delete this['@' + id];
  },
  /**
   * @method each
   * Executes a callback for each cached item
   *
   * @sig
   * @param {Function} callback  A function to execute for each item, callback(key, item)
   *
   * @sig
   * @param {Function} callback  A function to execute for each item, callback(key, item)
   * @param {Object} thisp  The context of the callback
   */
  each: function(cb, thisp) {
    var prop;
    for (prop in this) {
      if (this.hasOwnProperty(prop) && prop.indexOf('@') == 0) {
        cb.call(thisp || this, prop.slice(1), this[prop]);
      }
    }
  },
  /**
   * @method toObject
   * Serializes the cache to a hash
   *
   * @return {Object}  The resulting key-value hash
   */
  toObject: function() {
    var result = {};
    this.each(function(prop, value) {
      result[prop] = (value && typeof value.toObject === 'function') ? value.toObject() : value;
    });
    return result;
  },
  /**
   * @method toJSON
   * Serializes the cache to JSON
   *
   * @return {String}  The JSON string
   */
  toJSON: function() {
    return JSON.stringify(this.toObject());
  }
});

})(Lavaca.util, Lavaca.util.Disposable);