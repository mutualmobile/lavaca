define(function(require) {

  var Disposable = require('lavaca/util/Disposable'),
      uuid = require('lavaca/util/uuid');

  /**
   * Object for storing data
   * @class lavaca.util.Cache
   * @extends lavaca.util.Disposable
   */
  var Cache = Disposable.extend({
    /**
     *
     * Retrieves an item from the cache
     * @method get
     * @param {String} id  The key under which the item is stored
     * @return {Object}  The stored item (or null if no item is stored)
     */
     /**
     * Retrieves an item from the cache
     * @method get
     * @param {String} id  The key under which the item is stored
     * @param {Object} def  A default value that will be added, if there is no item stored
     * @return {Object}  The stored item (or null if no item is stored and no default)
     */
    get: function(id, def) {
      var result = this['@' + id];
      if (result === undefined && def !== undefined) {
        result = this['@' + id] = def;
      }
      return result === undefined ? null : result;
    },
    /**
     * Assigns an item to a key in the cache
     * @method set
     *
     * @param {String} id  The key under which the item will be stored
     * @param {Object} value  The object to store in the cache
     */
    set: function(id, value) {
      this['@' + id] = value;
    },
    /**
     * Adds an item to the cache
     * @method add
     *
     * @param {Object} value  The object to store in the cache
     * @return {String}  The auto-generated ID under which the value was stored
     */
    add: function(value) {
      var id = uuid();
      this.set(id, value);
      return id;
    },
    /**
     * Removes an item from the cache (if it exists)
     * @method remove
     *
     * @param {String} id  The key under which the item is stored
     */
    remove: function(id) {
      delete this['@' + id];
    },
    /**
     * Executes a callback for each cached item. To stop iteration immediately,
     * return false from the callback.
     * @method each
     * @param {Function} callback  A function to execute for each item, callback(key, item)
     */
     /**
     * Executes a callback for each cached item. To stop iteration immediately,
     * return false from the callback.
     * @method each
     * @param {Function} callback  A function to execute for each item, callback(key, item)
     * @param {Object} thisp  The context of the callback
     */
    each: function(cb, thisp) {
      var prop, returned;
      for (prop in this) {
        if (this.hasOwnProperty(prop) && prop.indexOf('@') === 0) {
          returned = cb.call(thisp || this, prop.slice(1), this[prop]);
          if (returned === false) {
            break;
          }
        }
      }
    },
    /**
     * Serializes the cache to a hash
     * @method toObject
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
     * Serializes the cache to JSON
     * @method toJSON
     *
     * @return {String}  The JSON string
     */
    toJSON: function() {
      return JSON.stringify(this.toObject());
    },
     /**
     * Serializes the cache to an array
     * @method toArray
     *
     * @return {Object}  The resulting array with elements being index based and keys stored in an array on the 'ids' property
     */
    toArray: function() {
      var results = [];
      results['ids'] = [];
      this.each(function(prop, value) {
        results.push(typeof value.toObject === 'function' ? value.toObject() : value);
        results['ids'].push(prop); 
      });
      return results;
    },

    /**
     * removes all items from the cache
     * @method clear
     */
    clear: function() {
       this.each(function(key, item) {
         this.remove(key);
       }, this);
    },

    /**
     * returns number of items in cache
     * @method count
     */
    count: function() {
      var count = 0;
      this.each(function(key, item) {
        count++;
      }, this);
      return count;
    },

    /**
     * Clears all items from the cache on dispose
     * @method dispose
     */
    dispose: function() {
      this.clear();
      Disposable.prototype.dispose.apply(this, arguments);
    }
  });

  return Cache;

});
