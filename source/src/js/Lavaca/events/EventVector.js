/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns) {

/**
 * @class Lavaca.events.EventVector
 * An object indicating a direction
 *
 * @constructor
 * @param {Number} length  The length of the vector
 * @param {String} axis  The axis of the vector
 * @param {String} compass  The cardinal direction of the vector
 */
ns.EventVector = Lavaca.extend(function(length, axis, compass) {
  this.length = length;
  this.axis = axis;
  this.compass = compass;
}, {
  /**
   * @field {Number} length
   * @default 0
   * The number of pixels covered by the vector
   */
  length: 0,
  /**
   * @field {String} axis
   * @default 'vertical'
   * The axis to which the vector most closely aligns (either "horizontal" or "vertical")
   */
  axis: 'vertical',
  /**
   * @field {String} compass
   * @default 'north'
   * The cardinal direction toward which the vector primarily points ("north", "south", "east", or "west")
   */
  compass: 'north'
});

})(Lavaca.resolve('Lavaca.events', true));