/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $) {

/**
 * @class Lavaca.net.Connectivity
 * A utility type for working under different network connectivity situations.
 */

var _navigatorOnlineSupported = typeof navigator.onLine == 'boolean',
    _offlineAjaxHandlers = [],
    _offlineErrorCode = 'offline',
    _isAndroid = navigator.userAgent.indexOf('Android') > -1;

function _onAjaxError(arg) {
  if (arg == _offlineErrorCode) {
    var i = -1,
        callback;
    while (callback = _offlineAjaxHandlers[++i]) {
      callback(arg);
    }
  }
}

/**
 * @method isOffline
 * @static
 * Attempts to detect whether or not the browser is connected
 *
 * @return {Boolean}  True if the browser is offline; false if the browser is online
 *    or if connection status cannot be determined
 */
ns.isOffline = function() {
  var connectionType = Lavaca.resolve('navigator.connection.type');
  if (connectionType !== null) {
    return connectionType == Lavaca.resolve('Connection.NONE');
  } else {
    return _navigatorOnlineSupported ? !navigator.onLine : false;
  }
};

/**
 * @method ajax
 * @static
 * Makes an AJAX request if the user is online. If the user is offline, the returned
 * promise will be rejected with the string argument "offline"
 *
 * @param {Object} opts  jQuery-style AJAX options
 * @return {Lavaca.util.Promise}  A promise
 */
ns.ajax = function(opts) {
  var promise = new Lavaca.util.Promise(),
      origSuccess = opts.success,
      origError = opts.error;
  opts.success = function() {
    if (origSuccess) {
      origSuccess.apply(this, arguments);
    }
    promise.resolve.apply(promise, arguments);
  };
  opts.error = function() {
    if (origError) {
      origError.apply(this, arguments);
    }
    promise.reject.apply(promise, arguments);
  };
  if (ns.isOffline()) {
    promise.reject(_offlineErrorCode);
  } else {
    $.ajax(opts);
  }
  promise.error(_onAjaxError);
  return promise;
};

/**
 * @method registerOfflineAjaxHandler
 * @static
 * Adds a callback to be executed whenever any Lavaca.net.Connectivity.ajax() call is
 * blocked as a result of a lack of internet connection.
 *
 * @param {Function} callback  The callback to execute
 */
ns.registerOfflineAjaxHandler = function(callback) {
  _offlineAjaxHandlers.push(callback);
};

})(Lavaca.resolve('Lavaca.net.Connectivity', true), Lavaca.$);