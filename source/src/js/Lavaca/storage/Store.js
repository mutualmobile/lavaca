/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require) {

  var Disposable = require('lavaca/util/Disposable');


  function _notImplemented() {
    throw 'Not implemented';
  }

  /**
   * @class Lavaca.storage.Store
   * @super Lavaca.util.Disposable
   * An object for manage local storage
   */
  var Store = Disposable.extend(function(id) {
    /**
     * @field {String} id
     * The ID of the store
     */
    this.id = id;
  }, {
    /**
     * @method get
     * Retrieves an object from storage, given its ID
     * @param {String} id  The ID of the stored object
     * @return {Object}  The stored object
     */
    get: function(id) {
      _notImplemented();
    },
    /**
     * @method set
     * Stores an object locally
     * @param {String} id  The ID of the object to store
     * @param {Object} value  The value to store
     */
    set: function(id, value) {
      _notImplemented();
    },
    /**
     * @method remove
     * Removes an object from storage
     * @param {String} id  The ID of the object to remove from storage
     */
    remove: function(id) {
      _notImplemented();
    },
    /**
     * @method all
     * Retrieves all items in this store
     * @return {Array}  A list of stored objects
     */
    all: function() {
      _notImplemented();
    }
  });


  return Store;

});
