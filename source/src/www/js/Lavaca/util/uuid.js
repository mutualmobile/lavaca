define(function() {

  var _uuid = 0;
  /**
   * @class Lavaca.util.uuid
   * Produces a app specific unique identifier
   *
   * @method uuid
   * @static
   * Produces a unique identifier
   *
   * @return {Number}  A number that is unique to this page
   */
  var uuid = function() {
    return _uuid++;
  };

  return uuid;

});
