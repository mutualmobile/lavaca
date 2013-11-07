define(function(require) {

  var Disposable = require('lavaca/util/Disposable');

  function _notImplemented() {
    throw 'Not implemented';
  }

  /**
   * An object for manage local storage
   * @class lavaca.storage.Store
   * @extends lavaca.util.Disposable
   */
  var Store = Disposable.extend(function(id) {
    /**
     * The ID of the store
     * @property {String} id
     */
    this.id = id;
  }, {
    /**
     * Retrieves an object from storage, given its ID
     * @method get
     *
     * @param {String} id  The ID of the stored object
     * @return {Object}  The stored object
     */
    get: function() {
      _notImplemented();
    },
    /**
     * Stores an object locally
     * @method set
     *
     * @param {String} id  The ID of the object to store
     * @param {Object} value  The value to store
     */
    set: function() {
      _notImplemented();
    },
    /**
     * Removes an object from storage
     * @method remove
     *
     * @param {String} id  The ID of the object to remove from storage
     */
    remove: function() {
      _notImplemented();
    },
    /**
     * Retrieves all items in this store
     * @method all
     *
     * @return {Array}  A list of stored objects
     */
    all: function() {
      _notImplemented();
    }
  });

  return Store;

});
