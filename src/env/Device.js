define(function(require) {

  var $ = require('$');

  /**
   * Static utility type for working with Cordova (aka PhoneGap) and other non-standard native functionality
   * @class lavaca.env.Device
   */

  var Device = {};

  /**
   * Indicates whether or not the app is being run through Cordova
   * @method isCordova
   * @static
   *
   * @return {Boolean}  True if app is being run through Cordova
   */
  Device.isCordova = function() {
    return !!window.cordova;
  };

  /**
   * Executes a callback when the device is ready to be used
   * @method init
   * @static
   *
   * @param {Function} callback  The handler to execute when the device is ready
   */
  Device.init = function(callback) {
    if (!Device.isCordova()) {
      $(document).ready(callback);
    } else if (document.addEventListener) {
      // Android fix
      document.addEventListener('deviceready', callback, false);
    } else {
      $(document).on('deviceready', callback);
    }
  };

  return Device;

});
