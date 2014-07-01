define(function(require) {

  var $ = require('$'),
      resolve = require('lavaca/util/resolve');

  /**
   * A utility type for working under different network connectivity situations.
   * @class lavaca.net.Connectivity
   */

  var _navigatorOnlineSupported = typeof navigator.onLine === 'boolean',
      _offlineAjaxHandlers = [],
      _offlineErrorCode = 'offline';

  function _onAjaxError(arg) {
    if (arg === _offlineErrorCode) {
      var i = -1,
          callback;
      while (!!(callback = _offlineAjaxHandlers[++i])) {
        callback(arg);
      }
    }
  }

  function _isLocalUrl(url) {
    return url.indexOf('.local') > 0 || url.indexOf('localhost') > 0 || url.substring(0,4) === 'file';
  }

  var Connectivity = {};

  /**
   * Attempts to detect whether or not the browser is connected
   * @method isOffline
   * @static
   *
   * @return {Boolean}  True if the browser is offline; false if the browser is online
   *    or if connection status cannot be determined
   */
  Connectivity.isOffline = function() {
    var connectionType = resolve('navigator.connection.type');
    if (connectionType !== null) {
      return connectionType === resolve('Connection.NONE');
    } else {
      return _navigatorOnlineSupported ? !navigator.onLine : false;
    }
  };

  /**
   * Makes an AJAX request if the user is online. If the user is offline, the returned
   * promise will be rejected with the string argument "offline"
   * @method ajax
   * @static
   *
   * @param {Object} opts  jQuery-style AJAX options
   * @return {Promise}  A promise
   */
  Connectivity.ajax = function(opts) {
    return Promise.resolve()
      .then(function() {
        if (Connectivity.isOffline() && !_isLocalUrl(opts.url)) {
          throw _offlineErrorCode;
        }
      })
      .then(function() {
        return $.ajax(opts);
      })
      .catch(_onAjaxError);
  };

  /**
   * Adds a callback to be executed whenever any Lavaca.net.Connectivity.ajax() call is
   * blocked as a result of a lack of internet connection.
   * @method registerOfflineAjaxHandler
   * @static
   *
   * @param {Function} callback  The callback to execute
   */
  Connectivity.registerOfflineAjaxHandler = function(callback) {
    _offlineAjaxHandlers.push(callback);
  };

  return Connectivity;

});
