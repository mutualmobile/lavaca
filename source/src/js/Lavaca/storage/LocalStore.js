/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require) {

  var Store = require('./Store');
  var StringUtils = require('lavaca/util/StringUtils');
  var ArrayUtils = require('lavaca/util/ArrayUtils');


  function _saveManifest(store) {
    localStorage.setItem(store.id + '@manifest', JSON.stringify(store.manifest));
  }

  /**
   * @class Lavaca.storage.LocalStore
   * @super Lavaca.storage.Store
   * An object for manage local storage
   */
  var LocalStore = Store.extend(function(id) {
    Store.call(this, id);
    /** 
     * @field {Array} manifest
     * A list of keys found in the store
     */
    this.manifest = JSON.parse(localStorage.getItem(this.id + '@manifest') || '[]');
  }, {
    /**
     * @method key
     * Generates a storage key
     * @param {String} id  The ID of the item for which to generate a key
     * @return {String}  The key
     */
    key: function(id) {
      return this.id + ':' + id;
    },
    /**
     * @method get
     * Retrieves an object from storage, given its ID
     * @param {String} id  The ID of the stored object
     * @return {Object}  The stored object
     */
    get: function(id) {
      var obj = localStorage.getItem(this.key(id));
      if (obj) {
        return JSON.parse(StringUtils.decompress(obj));
      } else {
        return null;
      }
    },
    /**
     * @method set
     * Stores an object locally
     * @param {String} id  The ID of the object to store
     * @param {Object} value  The value to store
     */
    set: function(id, value) {
      localStorage.setItem(this.key(id), StringUtils.compress(JSON.stringify(value)));
      ArrayUtils.pushIfNotExists(this.manifest, id);
      _saveManifest(this);
    },
    /**
     * @method remove
     * Removes an object from storage
     * @param {String} id  The ID of the object to remove from storage
     */
    remove: function(id) {
      localStorage.removeItem(this.key(id));
      ArrayUtils.remove(this.manifest, id);
      _saveManifest(this);
    },
    /**
     * @method all
     * Retrieves all items in this store
     * @return {Array}  A list of stored objects
     */
    all: function() {
      var result = [],
          i = -1,
          id;
      while (!!(id = this.manifest[++i])) {
        result.push(this.get(id));
      }
      return result;
    }
  });


  return LocalStore;

});
