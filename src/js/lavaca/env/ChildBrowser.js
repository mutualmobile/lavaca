define(function(require) {

  var Device = require('lavaca/env/Device'),
      EventDispatcher = require('lavaca/events/EventDispatcher'),
      Promise = require('lavaca/util/Promise');

  /**
   * A sub-browser management utility (also accessible via window.plugins.childBrowser)
   * @class lavaca.env.ChildBrowser
   * @extends Lavaca.events.EventDispatcher
   *
   * @event open
   * @event close
   * @event change
   *
   * @constructor
   */
  var ChildBrowser = EventDispatcher.extend({
    /**
     * Opens a web page in the child browser (or navigates to it)
     * @method showWebPage
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
        return new Promise(window).resolve();
      }
    },
    /**
     * Closes the child browser, if it's open
     * @method close
     *
     * @return {Lavaca.util.Promise}  A promise
     */
    close: function() {
      return Device.exec('ChildBrowser', 'close', []);
    }
  });

  Device.register('childBrowser', ChildBrowser);

  return ChildBrowser;

});
