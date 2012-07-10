(function(ns, StringUtils, ArrayUtils) {

function _saveManifest(store) {
  localStorage.setItem(store.id + '@manifest', JSON.stringify(store.manifest));
}

/**
 * @class Lavaca.storage.LocalStore
 * @super Lavaca.storage.Store
 * An object for manage local storage
 */
ns.LocalStore = ns.Store.extend(function(id) {
  ns.Store.call(this, id);
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
    while (id = this.manifest[++i]) {
      result.push(this.get(id));
    }
    return result;
  }
});

})(Lavaca.resolve('Lavaca.storage'), Lavaca.util.StringUtils, Lavaca.util.ArrayUtils);