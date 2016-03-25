var $ = require('jquery'),
  History = require('lavaca/net/History'),
  Device = require('lavaca/env/Device'),
  EventDispatcher = require('lavaca/events/EventDispatcher'),
  router = require('lavaca/mvc/Router'),
  viewManager = require('lavaca/mvc/ViewManager');

function _stopEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}

function _matchHashRoute(hash) {
  hash = hash.replace('#!', '#');
  var matches = decodeURIComponent(hash).match(/^(?:#)(\/.*)#?@?/);
  if (matches instanceof Array && matches[1]) {
    return matches[1].replace(/#.*/, '');
  }
  return null;
}

function _isExternal(url) {
  var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
  if (typeof match[1] === 'string'
      && match[1].length > 0
      && match[1].toLowerCase() !== location.protocol) {
    return true;
  }
  if (typeof match[2] === 'string'
      && match[2].length > 0
      && match[2].replace(new RegExp(':('+{'http:':80,'https:':443}[location.protocol]+')?$'), '') !== location.host) {
    return true;
  }
  return false;
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
    this.beforeInit()
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
        defaultPrevented = e.isDefaultPrevented(),
        url = link.attr('href') || link.attr('data-href'),
        rel = link.attr('rel'),
        target = link.attr('target'),
        isExternal = link.is('[data-external]') || _isExternal(url),
        metaKey;

    // backwards compatilibity with HammerJS < 2.0
    if (e.type === 'tap' && e.gesture && e.gesture.srcEvent) {
      metaKey = e.gesture.srcEvent.ctrlKey || e.gesture.srcEvent.metaKey;
    } else if (e.type === 'tap' && e.originalEvent && e.originalEvent.gesture && e.originalEvent.srcEvent) {
      metaKey = e.originalEvent.gesture.srcEvent.ctrlKey || e.originalEvent.gesture.srcEvent.metaKey;
    } else {
      metaKey = e.ctrlKey || e.metaKey;
    }
    if (metaKey) {
      target = metaKey ? '_blank' : (target ? target : '_self');
    }

    if (!defaultPrevented) {
      if (Device.isCordova() && target) {
        e.preventDefault();
        window.open(url, target || '_blank');
      } else if (isExternal || target) {
        window.open(url, target);
        return true;
      } else {
        e.preventDefault();
        if (rel === 'back') {
          History.back();
        } else if (rel === 'force-back' && url) {
          History.isRoutingBack = true;
          var _always = function() {
            History.isRoutingBack = false;
          };
          this.router.exec(url, null, null).then(_always, _always);
        } else if (rel === 'cancel') {
          this.viewManager.dismiss(e.currentTarget);
        } else if (rel === 'root' && url) {
          this.router.exec(url, null, {'root': true}).catch(this.onInvalidRoute);
        } else if (url) {
          url = url.replace(/^\/?#/, '');
          this.router.exec(url).catch(this.onInvalidRoute);
        }
      }
    }
  },
  /**
   * Initializes the application
   * @method init
   *
   * @param {Object} args  Data of any type from a resolved promise returned by Application.beforeInit(). Defaults to null.
   *
   * @return {Promise}  A promise that resolves when the application is ready for use
   */
  init: function(args) {
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

    this.bindLinkHandler();

    return Promise.resolve()
      .then(function() {
        return this._callback(args);
      }.bind(this))
      .then(function() {
        this.router.startHistory();
        if (!this.router.hasNavigated) {
          if (this.initState) {
            History.replace(this.initState.state, this.initState.title, this.initState.url);
          }
          return this.router.exec(this.initialHashRoute || this.initRoute, this.initState, this.initParams);
        }
      }.bind(this))
      .then(function() {
        this.trigger('ready');
      }.bind(this));
  },
  /**
   * Binds a global link handler
   * @method bindLinkHandler
   */
  bindLinkHandler: function() {
    var $body = $(document.body),
        type = 'click';
    if ($body.hammer) {
      $body = $body.hammer();
      type = 'tap';
      $body.on('click', 'a', _stopEvent);
    }
    $body
      .on(type, '.ui-blocker', _stopEvent)
      .on(type, 'a', this.onTapLink.bind(this));
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
   * @return {Promise}  A promise
   */
  beforeInit: function() {
    return Promise.resolve(null);
  }
});

module.exports = Application;