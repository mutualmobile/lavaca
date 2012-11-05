/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Device, Promise) {

var UNDEFINED;

function _cordovaDialog(fn, title, message, buttons, promise) {
  if (message === UNDEFINED) {
    message = title;
    title = '';
  }
  if (!buttons) {
    buttons = [];
  }
  buttons = [].concat(buttons);
  var i = -1,
      numButtons = buttons.length,
      button,
      args = [message, function(v) {
          if (fn == 'confirm'
              && (v === UNDEFINED || v === numButtons || (numButtons === 0 && v == 2))) {
            promise.reject((numButtons || 2) - 1);
          } else {
            promise.resolve(v - 1);
          }
        }, title],
      labels = [];
  if (fn == 'confirm') {
    buttons.push(buttons.shift());
  }
  while (button = buttons[++i]) {
    labels.push(button.name);
    if (button.exec) {
      promise[fn == 'confirm' && i == buttons.length - 1 ? 'error' : 'success']((function(n, callback) {
        return function(v) {
          if (v === UNDEFINED) {
            v = numButtons;
          }
          if (v == n) {
            callback(n);
          }
        };
      })(i, button.exec));
    }
  }
  args.push(labels.join(','));
  navigator.notification[fn].apply(navigator.notification, args);
}

/**
 * @class Lavaca.env.Notification
 * @super Lavaca.events.EventDispatcher
 * Notification alerts utility (also accessible via window.plugins.notification)
 *
 * @constructor
 */
ns.Notification = Lavaca.events.EventDispatcher.extend({
  /**
   * @method alert
   * @static
   * Displays an alert dialog
   *
   * @param {String} title  The title to display in the dialog
   * @param {String} message  The message to display in the dialog
   * @param {Array} buttons  A list of buttons and associated callbacks to execute,
   *    depending on which button was clicked. For example: [{name: 'Do this', exec: function() {
   *    console.log('did this'); }}, {name: 'Do that', exec: function() { console.log('did that'); }}]
   * @return {Lavaca.util.Promise}  A promise that's resolved with the index of the clicked button
   */
  alert: function(title, message, buttons) {
    var promise = new Promise();
    if (Device.isCordova()) {
      _cordovaDialog('alert', title, message, buttons, promise);
    } else if (window.alert) {
      button = (buttons || [])[0];
      if (button && button.exec) {
        promise.then(button.exec);
      }
      alert(message || title);
      promise.resolve(0);
    } else {
      promise.reject();
    }
    return promise;
  },
  /**
   * @method confirm
   * @static
   * Displays a confirm dialog
   *
   * @param {String} title  The title to display in the dialog
   * @param {String} message  The message to display in the dialog
   * @param {Array} buttons  A list of buttons and associated callbacks to execute,
   *    depending on which button was clicked. For example: [{name: 'Do this', exec: function() {
   *    console.log('did this'); }}, {name: 'Do that', exec: function() { console.log('did that'); }}]
   * @return {Lavaca.util.Promise}  A promise. When the first button is clicked, the promise is rejected. When any
   *    successive button is clicked, the promise is resolved with the index of the clicked button.
   */
  confirm: function(title, message, buttons) {
    var promise = new Promise();
    if (Device.isCordova()) {
      _cordovaDialog('confirm', title, message, buttons, promise);
    } else if (window.confirm) {
      if (buttons) {
        promise
          .success((buttons[1] || {}).exec)
          .error((buttons[0] || {}).exec);
      }
      confirm(message) ? promise.resolve(1) : promise.reject(0);
    } else {
      promise.reject();
    }
    return promise;
  }
});

Device.register('notification', ns.Notification);

})(Lavaca.env, Lavaca.env.Device, Lavaca.util.Promise);