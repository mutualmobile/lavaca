/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns) {

function _disposeOf(obj) {
  var n,
      o,
      i;
  for (n in obj) {
    if (obj.hasOwnProperty(n)) {
      o = obj[n];
      if (o) {
        if (typeof o.dispose == 'function') {
          o.dispose();
        } else if (o instanceof Array) {
          for (i = o.length - 1; i > -1; i--) {
            _disposeOf(o[i]);
          }
        }
      }
    }
    delete obj[n];
  }
}

/** 
 * @class Lavaca.util.Disposable
 * Abstract type for types that need to ready themselves for GC
 *
 * @constructor
 */
ns.Disposable = Lavaca.extend({
  /**
   * @method dispose
   * Readies the object to be garbage collected
   */
  dispose: function() {
    _disposeOf(this);
  }
});

})(Lavaca.resolve('Lavaca.util', true));