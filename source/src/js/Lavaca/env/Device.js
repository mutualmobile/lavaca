/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Cordova) {

/**
 * @class Lavaca.env.Device
 * Static utility type for working with Cordova (aka PhoneGap) and other non-standard native functionality
 */

var _initHasRun = false,
    _onInit = [];
 
/**
 * @method isCordova
 * @static
 * Indicates whether or not the app is being run through Cordova
 *
 * @return {Boolean}  True if app is being run through Cordova
 */
ns.isCordova = function() {
  return !!Cordova;
};

ns.mobileBrowser = function() {
  var mobileBrowser = {};
  mobileBrowser.agent = navigator.userAgent.toLowerCase();
  mobileBrowser.scrWidth = screen.width;
  mobileBrowser.scrHeight = screen.height;
  mobileBrowser.elemWidth = document.documentElement.clientWidth;
  mobileBrowser.elemHeight = document.documentElement.clientHeight;
  mobileBrowser.otherBrowser = (mobileBrowser.agent.indexOf('series60') != -1) || (mobileBrowser.agent.indexOf('symbian') != -1) || (mobileBrowser.agent.indexOf('windows ce') != -1) || (mobileBrowser.agent.indexOf('blackberry') != -1);
  mobileBrowser.mobileOS = typeof orientation != 'undefined' ? true : false;
  mobileBrowser.touchOS = ('ontouchstart' in document.documentElement) ? true : false;
  mobileBrowser.blackberry = mobileBrowser.agent.indexOf('blackberry') > -1;
  mobileBrowser.ipad = mobileBrowser.agent.indexOf('ipad') != -1 ? true : false;
  mobileBrowser.ipod = mobileBrowser.agent.indexOf('ipod') != -1 ? true : false;
  mobileBrowser.iphone = mobileBrowser.agent.indexOf('iphone') != -1 ? true : false;
  mobileBrowser.palm = mobileBrowser.agent.indexOf('palm') != -1 ? true : false;
  mobileBrowser.symbian = mobileBrowser.agent.indexOf('symbian') != -1 ? true : false;
  mobileBrowser.iOS = (mobileBrowser.iphone || mobileBrowser.ipod || mobileBrowser.ipad) ? true : false;
  mobileBrowser.android = (mobileBrowser.agent.indexOf('android') != -1) || (!mobileBrowser.iOS && !mobileBrowser.otherBrowser && mobileBrowser.touchOS && mobileBrowser.mobileOS) ? true : false;
  mobileBrowser.android2 = mobileBrowser.android && (mobileBrowser.agent.indexOf('android 2') != -1) ? true : false;
  mobileBrowser.isMobile = (mobileBrowser.android || mobileBrowser.iOS || mobileBrowser.mobileOS || mobileBrowser.touchOS) ? true : false;
  return mobileBrowser;
};

/**
 * @method register
 * @static
 * Registers a plugin to be initialized when the device is ready
 *
 * @param {String} name
 * @param {Function} TPlugin  The plugin to register. The plugin should be a constructor function
 */
ns.register = function(name, TPlugin) {
  function install() {
    if (!window.plugins) {
      window.plugins = {};
    }
    window.plugins[name] = new TPlugin();
  }
  if (_initHasRun) {
    install();
  } else {
    _onInit.push(install);
  }
};

/**
 * @method exec
 * @static
 * Executes a Cordova command, if Cordova is available
 *
 * @param {String} className  The name of the native class
 * @param {String} methodName  The name of the class method to call
 * @param {Array} args  Arguments to pass the method
 * @return {Lavaca.util.Promise}  A promise
 */
ns.exec = function(className, methodName, args) {
  var promise = new Lavaca.util.Promise(window);
  if (Cordova) {
    Cordova.exec(promise.resolver(), promise.rejector(), className, methodName, args);
  } else {
    promise.reject();
  }
  return promise;
};

/**
 * @method init
 * @static
 * Executes a callback when the device is ready to be used
 *
 * @param {Function} callback  The handler to execute when the device is ready
 */
ns.init = function(callback) {
  if (document.addEventListener) {
    // Android fix
    document.addEventListener('deviceready', callback, false);
  } else {
    $(document).on('deviceready', callback);
  }
};

$(document).ready(function() {
  var i = -1,
      installPlugin,
      e;
  while (installPlugin = _onInit[++i]) {
    installPlugin();
  }
  _initHasRun = true;
  if (!Cordova) {
    if (document.createEvent) {
      e = document.createEvent('Events');
      e.initEvent('deviceready', true, false);
      document.dispatchEvent(e);
    } else if (document.fireEvent) {
      e = document.createEventObject();
      e.eventType = 'deviceready';
      document.fireEvent('ondeviceready', e);
    }
  }
});

})(Lavaca.resolve('Lavaca.env.Device', true), Lavaca.$, window.Cordova || window.cordova);