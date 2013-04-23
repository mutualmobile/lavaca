define(function(require) {

  var extend = require('lavaca/util/extend');

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
  var EventPoint = extend(function(e) {
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
      while (!!(name = _coordNames[++i])) {
        this[name] = e ? e[name] : null;
      }
    }
  });

  return EventPoint;

});
