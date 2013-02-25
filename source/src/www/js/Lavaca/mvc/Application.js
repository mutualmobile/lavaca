/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require) {

  var $ = require('$');
  var Device = require('lavaca/env/Device');
  var EventDispatcher = require('lavaca/events/EventDispatcher');
  var Model = require('lavaca/mvc/Model');
  var Router = require('lavaca/mvc/Router');
  var ViewManager = require('lavaca/mvc/ViewManager');
  var Connectivity = require('lavaca/net/Connectivity');
  var History = require('lavaca/net/History');
  var Template = require('lavaca/ui/Template');
  var Config = require('lavaca/util/Config');
  var Promise = require('lavaca/util/Promise');
  var Translation = require('lavaca/util/Translation');
  require('lavaca/events/Touch'); //jquery plugins

  function _stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function _matchHashRoute(hash) {
    var matches = hash.match(/^(?:#)(\/.*)#?@?/);
    if (matches instanceof Array && matches[1]) {
      return matches[1].replace(/#.*/, '');
    }
    return null;
  }

  /**
   * @class Lavaca.mvc.Application
   * @super Lavaca.events.EventDispatcher
   * Base application type
   *
   * @constructor
   * Creates an application
   *
   * @sig
   *
   * @sig
   * @param {Function} callback  A callback to execute when the application is initialized but not yet ready
   */
  var Application = EventDispatcher.extend(function(callback) {
    $(window).on('unload', $.proxy(this.dispose, this));
    if (callback) {
      this.on('init', callback.bind(this));
    }
    Device.init($.proxy(this.init, this));
  }, {
    /**
     * @field {Function} TViewManager
     * @default Lavaca.mvc.ViewManager
     * The type of the view manager used by the application
     */
    TViewManager: ViewManager,
    /**
     * @field {Function} TRouter
     * @default Lavaca.mvc.Router
     * The type of the router used by the application
     */
    TRouter: Router,
    /**
     * @field {Function} TState
     * @default Lavaca.mvc.Model
     * The type of the state model used by the application
     */
    TState: Model,
    /**
     * @field {String} initRoute
     * @default "/"
     * The default URL that the app will navigate to
     */
    initRoute: '/',
    /**
     * @field {Object} initState
     * @default null
     * The default state object to supply the initial route
     */
    initState: null,
    /**
     * @field {Object} initParams
     * @default null
     * The default params object to supply the initial route
     */
    initParams: null,
    /**
     * @field {String} viewRootSelector
     * @default "#view-root"
     * The selector used to identify the DOM element that will contain views
     */
    viewRootSelector: '#view-root',
    /**
     * @method onInvalidRoute
     * Handler for when the user attempts to navigate to an invalid route
     * @param {Object} err  The routing error
     */
    onInvalidRoute: function(err) {
      // If the error is equal to "locked", it means that the router or view manager was
      // busy while while the user was attempting to navigate
      if (err !== 'locked') {
        window.plugins.notification.alert('An error occurred while trying to display this URL.');
      }
    },
    /**
     * @method onTapLink
     * Handler for when the user taps on a <A> element
     * @param {Event} e  The event object
     */
    onTapLink: function(e) {
      var link = $(e.currentTarget),
          url = link.attr('href'),
          rel = link.attr('rel'),
          target = link.attr('target'),
          isExternal = link.is('[data-external]');
      if (/^((mailto)|(tel)|(sms))\:/.test(url)) {
        location.href = url;
        return true;
      } else {
        e.preventDefault();
      }
      if (rel === 'back') {
        History.back();
      } else if (isExternal || rel === 'nofollow' || target === '_blank') {
        e.stopPropagation();
        window.plugins.childBrowser.showWebPage(url);
      } else if (rel === 'cancel') {
        this.viewManager.dismiss(e.currentTarget);
      } else if (url) {
        this.router.exec(url, null, null).error(this.onInvalidRoute);
      }
    },
    /**
     * @method ajax
     * Makes an AJAX request if the user is online. If the user is offline, the returned
     * promise will be rejected with the string argument "offline". (Alias for [[Lavaca.net.Connectivity]].ajax)
     *
     * @param {Object} opts  jQuery-style AJAX options
     * @return {Lavaca.util.Promise}  A promise
     */
    ajax: function() {
      return Connectivity.ajax.apply(Connectivity, arguments);
    },
    /**
     * @method init
     * @event init
     * @event ready
     * Initializes the application
     *
     * @return {Lavaca.util.Promise}  A promise that resolves when the application is ready for use
     */
    init: function() {
      var promise = new Promise(this);
      /**
       * @field {Object} mobileBrowser
       * @default true
       * A hash of user agent tests.
       */
      this.mobileBrowser = Device.mobileBrowser();
      /**
       * @field {Boolean} animations
       * @default true
       * Flag indicating whether animations are turned on or off. On Android devices, this defaults to <code>false</code>.
       */
      this.animations = !this.mobileBrowser.android;
      /**
       * @field {Lavaca.mvc.Model} state
       * @default null
       * Model used for application state management
       */
      Config.init();
      Template.init();
      /**
       * @field {Lavaca.mvc.ViewManager} viewManager
       * @default null
       * View manager used to transition between UI states
       */
      this.viewManager = new this.TViewManager(this.viewRootSelector);
      /**
       * @field {Lavaca.mvc.Router} router
       * @default null
       * Router used to manage application traffic and URLs
       */
      this.router = new this.TRouter(this.viewManager);
      $(document.body)
        .tap('a', this.onTapLink, this)
        .tap('.ui-blocker', _stopEvent);
      this.trigger('init');
      if (!this.router.hasNavigated) {
        promise.when(
          this.router.exec(this.initialHashRoute || this.initRoute, this.initState, this.initParams)
        );
        if (this.initState) {
          History.replace(this.initState.state, this.initState.title, this.initState.url);
        }
      } else {
        promise.resolve();
      }
      return promise.then(function() {
        this.trigger('ready');
      });
    },
    /**
     * @method dispose
     * @event dispose
     * Readies the application to be garbage collected
     */
    dispose: function() {
      this.trigger('dispose');
      Config.dispose();
      Translation.dispose();
      Template.dispose();
      EventDispatcher.prototype.dispose.call(this);
    },
    /**
     * @field {String} initialStandardRoute
     * Gets initial route based on query string returned by server 302 redirect
     */
    initialHashRoute: (function(hash) {
      return _matchHashRoute(hash);
    })(window.location.hash)
  });

  return Application;

});
