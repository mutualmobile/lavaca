define(function(require) {

  var extend = require('lavaca/util/extend');

  /**
   * @class Lavaca.events.EventVector
   * An object indicating a direction
   *
   * @constructor
   * @param {Number} length  The length of the vector
   * @param {String} axis  The axis of the vector
   * @param {String} compass  The cardinal direction of the vector
   */
  var EventVector = extend(function(length, axis, compass) {
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

  return EventVector;

});
