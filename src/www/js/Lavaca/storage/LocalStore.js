define(function(require) {

  var Store = require('./Store'),
      docCookies = require('docCookies'),
      ArrayUtils = require('lavaca/util/ArrayUtils');

  var _isLocalStorageSupported = (function(localStorage) {
    var testKey = 'qeTest';
    if (!localStorage) {
      return false;
    }
    try {
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }(window.localStorage));

  var _storage = _isLocalStorageSupported ? localStorage : docCookies;

  function _saveManifest(store) {
    _storage.setItem(store.id + '@manifest', JSON.stringify(store.manifest));
  }

  /**
   * An object for manage local storage
   * @class lavaca.storage.LocalStore
   * @extends lavaca.storage.Store

   */
  var LocalStore = Store.extend(function(id) {
    Store.call(this, id);
     /**
     * A list of keys found in the store
     * @field {Array} manifest
     */
    this.manifest = JSON.parse(_storage.getItem(this.id + '@manifest') || '[]');
  }, {
    /**
     * Generates a storage key
     * @method key
     *
     * @param {String} id  The ID of the item for which to generate a key
     * @return {String}  The key
     */
    key: function(id) {
      return this.id + ':' + id;
    },
    /**
     * Retrieves an object from storage, given its ID
     * @method get
     *
     * @param {String} id  The ID of the stored object
     * @return {Object}  The stored object
     */
    get: function(id) {
      var str = _storage.getItem(this.key(id));
      var obj;
      if (!!str) {
        try {
          obj = JSON.parse(str);
          return obj;
        } catch(e) {
          return str;
        }
      }      
      return null;
    },
    /**
     * Stores an object locally
     * @method set
     *
     * @param {String} id  The ID of the object to store
     * @param {Object} value  The value to store
     */
    set: function(id, value) {
      _storage.setItem(this.key(id), JSON.stringify(value));
      ArrayUtils.pushIfNotExists(this.manifest, id);
      _saveManifest(this);
    },
    /**
     * Removes an object from storage
     * @method remove
     *
     * @param {String} id  The ID of the object to remove from storage
     */
    remove: function(id) {
      _storage.removeItem(this.key(id));
      ArrayUtils.remove(this.manifest, id);
      _saveManifest(this);
    },
    /**
     * Retrieves all items in this store
     * @method all
     *
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
