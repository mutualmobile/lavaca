define(function() {

  /**
   * Utility class for working with arrays
   * @class lavaca.util.ArrayUtils
   */
  var ArrayUtils = {};

  /**
   * Gets the first index of an item in an array
   * @method indexOf
   * @static
   *
   * @param {Array} a  The array
   * @param {Object} o  The object to look for
   * @return {Number}  The first index of the object, or -1 if not found
   */
  ArrayUtils.indexOf = function(a, o) {
    if (!a) {
      return -1;
    } else if (a.indexOf) {
      return a.indexOf(o);
    } else {
      for (var i = 0, j = a.length; i < j; i++) {
        if (a[i] === o) {
          return i;
        }
      }
      return -1;
    }
  };

  /**
   * Determines whether an array contains an object
   * @method contains
   * @static
   *
   * @param {Array} a  The array
   * @param {Object} o  The object to look for
   * @return {Boolean}  True when the array contains the object, false otherwise
   */
  ArrayUtils.contains = function(a, o) {
    return ArrayUtils.indexOf(a, o) > -1;
  };

  /**
   * Removes the first instance of an item from an array, if it exists
   * @method remove
   * @static
   *
   * @param {Array} a  The array
   * @param {Object} o  The object to remove
   * @return {Number}  The former index of the item (or -1 if the item was not
   *   in the array)
   */
  ArrayUtils.remove = function(a, o) {
    var index = ArrayUtils.indexOf(a, o);
    if (index > -1) {
      a.splice(index, 1);
    }
    return index;
  };

  /**
   * Adds an item to the end of an array, if it was not already in the array
   * @method pushIfNotExists
   * @static
   *
   * @param {Array} a  The array
   * @param {Object} o  The object to add to the array
   * @return {Number}  The index of the item in the array
   */
  ArrayUtils.pushIfNotExists = function(a, o) {
    var index = ArrayUtils.indexOf(a, o);
    if (index === -1) {
      a[index = a.length] = o;
    }
    return index;
  };
  /**
   * Determines if object is an array
   * @method isArray
   * @static
   *
   * @param {Object} a  Any value of any type
   * @return {Boolean}  True if a is a true array
   */
  ArrayUtils.isArray = function(a) {
    return Array.isArray === 'function' ? Array.isArray(a) : Object.prototype.toString.call(a) === '[object Array]';
  };

  return ArrayUtils;

});
