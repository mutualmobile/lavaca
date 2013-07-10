define(function(require) {

  var $ = require('$'),
    History = require('lavaca/net/History'),
    Device = require('lavaca/env/Device'),
    EventDispatcher = require('lavaca/events/EventDispatcher'),
    router = require('lavaca/mvc/Router'),
    viewManager = require('lavaca/mvc/ViewManager'),
    Connectivity = require('lavaca/net/Connectivity'),
    Template = require('lavaca/ui/Template'),
    Config = require('lavaca/util/Config'),
    Promise = require('lavaca/util/Promise'),
    ChildBrowser = require('lavaca/env/ChildBrowser'),
    Translation = require('lavaca/util/Translation');
    require('jquery-mobile/events/touch');
    require('jquery-mobile/events/orientationchange');

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
   * Base application type
   * @class lavaca.mvc.Application
   * @extends lavaca.events.EventDispatcher
   *
   */
   /**
   * Creates an application
   * @constructor
   * @param {Function} [callback]  A callback to execute when the application is initialized but not yet ready
   */
  var Application = EventDispatcher.extend(function(callback) {
    if (callback) {
      this._callback = callback.bind(this);
    }
    Device.init(function() {
      this.beforeInit(Config)
        .then(this.init.bind(this));
    }.bind(this));
  }, {
    /**
     * The default URL that the app will navigate to
     * @property initRoute
     * @default '/'
     *
     * @type String
     */

    initRoute: '/',
    /**
     * The default state object to supply the initial route
     * @property initState
     * @default null
     *
     * @type {Object}
     */
    initState: null,
    /**
     * The default params object to supply the initial route
     * @property initParams
     * @default null
     *
     * @type {Object}
     */

    initParams: null,
    /**
     * The selector used to identify the DOM element that will contain views
     * @property viewRootSelector
     * @default #view-root
     *
     * @type {String}
     */

    viewRootSelector: '#view-root',
    /**
     * Handler for when the user attempts to navigate to an invalid route
     * @method onInvalidRoute
     *
     * @param {Object} err  The routing error
     */
    onInvalidRoute: function(err) {
      // If the error is equal to "locked", it means that the router or view manager was
      // busy while while the user was attempting to navigate
      if (err !== 'locked') {
        alert('An error occurred while trying to display this URL.');
      }
    },
    /**
     * Handler for when the user taps on a <A> element
     * @method onTapLink
     *
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
        new ChildBrowser().showWebPage(url);
      } else if (rel === 'cancel') {
        this.viewManager.dismiss(e.currentTarget);
      } else if (url) {
        this.router.exec(url, null, null).error(this.onInvalidRoute);
      }
    },
    /**
     * Makes an AJAX request if the user is online. If the user is offline, the returned
     * promise will be rejected with the string argument "offline". (Alias for [[Lavaca.net.Connectivity]].ajax)
     * @method ajax
     *
     * @param {Object} opts  jQuery-style AJAX options
     * @return {Lavaca.util.Promise}  A promise
     */
    ajax: function() {
      return Connectivity.ajax.apply(Connectivity, arguments);
    },
    /**
     * Initializes the application
     * @method init
     *
     * @param {Object} args  Data of any type from a resolved promise returned by Application.beforeInit(). Defaults to null.
     *
     * @return {Lavaca.util.Promise}  A promise that resolves when the application is ready for use
     */
    init: function(args) {
      var promise = new Promise(this),
          _cbPromise,
          lastly;
      Template.init();
      /**
       * View manager used to transition between UI states
       * @property viewManager
       * @default null
       *
       * @type {Lavaca.mvc.ViewManager}
       */
      this.viewManager = viewManager.setEl(this.viewRootSelector);
      /**
       * Router used to manage application traffic and URLs
       * @property router
       * @default null
       *
       * @type {Lavaca.mvc.Router}
       */
      this.router = router.setViewManager(this.viewManager);


      lastly = function() {
        this.router.startHistory();
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
      }.bind(this);

      $(document.body)
        .on('tap', 'a', this.onTapLink.bind(this))
        .on('tap', '.ui-blocker', _stopEvent);

      if (this._callback) {
        _cbPromise = this._callback(args);
        _cbPromise instanceof Promise ? _cbPromise.then(lastly, promise.rejector()) : lastly();
      } else {
        lastly();
      }
      return promise.then(function() {
        this.trigger('ready');
      });
    },

    /**
     * Gets initial route based on query string returned by server 302 redirect
     * @property initialStandardRoute
     * @default null
     *
     * @type {String}
     */

    initialHashRoute: (function(hash) {
      return _matchHashRoute(hash);
    })(window.location.hash),
    /**
     * Handles asynchronous requests that need to happen before Application.init() is called in the constructor
     * @method {String} beforeInit
     *
     * @param {Lavaca.util.Config} Config cache that's been initialized
     *
     * @return {Lavaca.util.Promise}  A promise
     */
    beforeInit: function(Config) {
      var promise = new Promise();
      return promise.resolve(null);
    }
  });

  return Application;

});
