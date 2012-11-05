/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns) {

/**
 * @class Lavaca.util.ArrayUtils
 * Utility class for working with arrays
 */

/**
 * @method indexOf
 * @static
 * Gets the first index of an item in an array
 *
 * @param {Array} a  The array
 * @param {Object} o  The object to look for
 * @return {Number}  The first index of the object, or -1 if not found
 */
ns.indexOf = function(a, o) {
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
 * @method contains
 * @static
 * Determines whether an array contains an object
 *
 * @param {Array} a  The array
 * @param {Object} o  The object to look for
 * @return {Boolean}  True when the array contains the object, false otherwise
 */
ns.contains = function(a, o) {
  return ns.indexOf(a, o) > -1;
};

/**
 * @method remove
 * @static
 * Removes the first instance of an item from an array, if it exists
 *
 * @param {Array} a  The array
 * @param {Object} o  The object to remove
 * @return {Number}  The former index of the item (or -1 if the item was not
 *   in the array)
 */
ns.remove = function(a, o) {
  var index = ns.indexOf(a, o);
  if (index > -1) {
    a.splice(index, 1);
  }
  return index;
};

/**
 * @method pushIfNotExists
 * @static
 * @sig  Adds an item to the end of an array, if it was not already in the array
 *
 * @param {Array} a  The array
 * @param {Object} o  The object to add to the array
 * @return {Number}  The index of the item in the array
 */
ns.pushIfNotExists = function(a, o) {
  var index = ns.indexOf(a, o);
  if (index == -1) {
    a[index = a.length] = o;
  }
  return index;
};

})(Lavaca.resolve('Lavaca.util.ArrayUtils', true));