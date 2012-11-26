/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Device) {

/**
 * @class Lavaca.env.ChildBrowser
 * @super Lavaca.events.EventDispatcher
 * A sub-browser management utility (also accessible via window.plugins.childBrowser)
 *
 * @event open
 * @event close
 * @event change
 *
 * @constructor
 */
ns.ChildBrowser = Lavaca.events.EventDispatcher.extend({
  /**
   * @method showWebPage
   * Opens a web page in the child browser (or navigates to it)
   *
   * @param {String} loc  The URL to open
   * @return {Lavaca.util.Promise}  A promise
   */
  showWebPage: function(loc) {
    if (Device.isCordova()) {
      return Device
        .exec('ChildBrowser', 'showWebPage', [loc])
        .error(function() {
          window.location.href = loc;
        });
    } else {
      window.open(loc);
      return new Lavaca.util.Promise(window).resolve();
    }
  },
  /**
   * @method close
   * Closes the child browser, if it's open
   *
   * @return {Lavaca.util.Promise}  A promise
   */
  close: function() {
    return Device.exec('ChildBrowser', 'close', []);
  }
});

Device.register('childBrowser', ns.ChildBrowser);

})(Lavaca.env, Lavaca.env.Device);