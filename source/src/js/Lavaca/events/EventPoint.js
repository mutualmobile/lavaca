/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns) {

var _coordNames = ['screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'];

/**
 * @class Lavaca.events.EventPoint
 * Coordinates describing a point on the screen
 *
 * @constructor
 *
 * @constructor
 * @param {Event} e The event from which to load coordinate data
 */
ns.EventPoint = Lavaca.extend(function(e) {
  this.init(e);
}, {
  /**
   * @field {Number} screenX
   * @default null
   * The X-coordinate of the point, in screen space
   */
  screenX: null,
  /**
   * @field {Number} screenY
   * @default null
   * The Y-coordinate of the point, in screen space
   */
  screenY: null,
  /**
   * @field {Number} clientX
   * @default null
   * The X-coordinate of the point, in window space
   */
  clientX: null,
  /**
   * @field {Number} clientY
   * @default null
   * The Y-coordinate of the point, in window space
   */
  clientY: null,
  /**
   * @field {Number} pageX
   * @default null
   * The X-coordinate of the point, in document space
   */
  pageX: null,
  /**
   * @field {Number} pageY
   * @default null
   * The Y-coordinate of the point, in document space
   */
  pageY: null,
  /**
   * @method init
   * Loads coordinate data from an event
   *
   * @param {Event} e  The event
   */
  init: function(e) {
    var i = -1,
        name;
    while (name = _coordNames[++i]) {
      this[name] = e ? e[name] : null;
    }
  }
});

})(Lavaca.resolve('Lavaca.events', true));