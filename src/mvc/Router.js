define(function(require) {

  var Route = require('./Route'),
      History = require('lavaca/net/History'),
      Disposable = require('lavaca/util/Disposable');

  /**
   * @class lavaca.mvc.Router
   * @extends lavaca.util.Disposable
   * URL manager
   *
   * @constructor
   * @param {Lavaca.mvc.ViewManager} viewManager  The view manager
   */
  var Router = Disposable.extend(function(viewManager) {
    Disposable.call(this);
    /**
     * @field {Array} routes
     * @default []
     * The [[Lavaca.mvc.Route]]s used by this router
     */
    this.routes = [];
    /**
     * @field {Lavaca.mvc.ViewManager} viewManager
     * @default null
     * The view manager used by this router
     */
    this.viewManager = viewManager;

  }, {
    /**
     * @field {Boolean} locked
     * @default false
     * When true, the router is prevented from executing a route
     */
    locked: false,
    /**
     * @field {Boolean} hasNavigated
     * @default false
     * Whether or not this router has been used to navigate
     */
    hasNavigated: false,
    /**
     * @field {Boolean} runAuthenticationCheck
     * @default false
     * When true, this runs the defined authentication function
     * set in this.setAuth() before executing a route.
     */
    runAuthenticationCheck: false,

    startHistory: function() {
      this.onpopstate = function(e) {
        if (this.hasNavigated) {
          History.isRoutingBack = e.direction === 'back';
          var _always = function() {
            History.isRoutingBack = false;
          };
          this.exec(e.url, e).then(_always, _always);
        }
      };
      History.on('popstate', this.onpopstate, this);
    },
    /**
     * Sets the viewManager property on the instance which is the view manager used by this router
     * @method setEl
     *
     * @param {Lavaca.mvc.ViewManager} viewManager
     * @return {Lavaca.mvc.Router}  This Router instance
     */
    setViewManager: function(viewManager) {
      this.viewManager = viewManager;
      return this;
    },
    /**
     * Adds multiple routes
     * @method add
     *
     * @param {Object} map  A hash in the form {pattern: [TController, action, params]}
     *   or {pattern: {controller: TController, action: action, params: params}
     * @return {Lavaca.mvc.Router}  The router (for chaining)
     */
    /**
     * Adds a route
     * @method add
     *
     * @param {String} pattern  The route URL pattern
     * @param {Function} TController  The type of controller to perform the action (should derive from [[Lavaca.mvc.Controller]])
     * @param {String} action  The name of the controller method to call
     * @return {Lavaca.mvc.Router}  The router (for chaining)
     */
    /**
     * Adds a route
     * @method add
     *
     * @param {String} pattern  The route URL pattern
     * @param {Function} TController  The type of controller to perform the action (should derive from [[Lavaca.mvc.Controller]])
     * @param {String} action  The name of the controller method to call
     * @param {Object} params  Key-value pairs that will be passed to the action
     * @return {Lavaca.mvc.Router}  The router (for chaining)
     */
    add: function(pattern, TController, action, params) {
      if (typeof pattern === 'object') {
        for (var p in pattern) {
          var args = pattern[p];
          if (args instanceof Array) {
            TController = args[0];
            action = args[1];
            params = args[2];
          } else {
            TController = args.controller;
            action = args.action;
            params = args.params;
          }
          this.add(p, TController, action, params);
        }
      } else {
        this.routes.push(new Route(pattern, TController, action, params));
      }
      return this;
    },
    /**
     * Executes the action for a given URL
     * @method exec
     *
     * @param {String} url  The URL
     * @return {Promise}  A promise
     */
    /**
     * Executes the action for a given URL
     * @method exec
     *
     * @param {String} url  The URL
     * @param {Object} state  A history record object
     * @return {Promise}  A promise
     */
    /**
     * Executes the action for a given URL
     * @method exec
     *
     * @param {String} url  The URL
     * @param {Object} state  A history record object
     * @param {Object} params  Additional parameters to pass to the route
     * @return {Promise}  A promise
     */
    exec: function(url, state, params) {
      if (this.locked) {
        return Promise.reject('locked');
      } else {
        this.locked = true;
      }

      if (!url) {
        url = '/';
      }
      if (url.indexOf('http') === 0) {
        url = url.replace(/^http(s?):\/\/.+?/, '');
      }

      var checkAuth = params && params.auth && typeof params.auth.runAuthenticationCheck === 'boolean' ? params.auth.runAuthenticationCheck : this.runAuthenticationCheck;
      var failUrl = params && params.auth && typeof params.auth.failRoute === 'string' ? params.auth.failRoute : this.failRoute;
      if(checkAuth && failUrl !== url){
        this.authenticate().then(function authenticationSuccess(){
          return _executeIfRouteExists.call(this, url, state, params);
        }.bind(this), function authenticationError(){
          return _executeIfRouteExists.call(this, failUrl, state, params);
        }.bind(this));
      }
      else{
        return _executeIfRouteExists.call(this, url, state, params);
      }

    },
    /**
     * Unlocks the router so that it can be used again
     * @method unlock
     *
     * @return {Lavaca.mvc.Router}  This router (for chaining)
     */
    unlock: function() {
      this.locked = false;
      return this;
    },
    /**
     * Creates authentication check for routes
     * @method setAuth
     *
     * @param {Function} func A function to run for specific authentication. Must return a Promise.
     * @param {String} failRoute The route to execute if authentication fails.
     */
    /**
     * Creates authentication check for routes
     * @method setAuth
     *
     * @param {Function} func A function to run for specific authentication. Must return a Promise.
     * @param {String} failRoute The route to execute if authentication fails.
     * @param {Boolean} checkAuthForEveryRoute Sets the default behavior of whether to run authentication check for each route. If no value is passed, it defaults to true.
     */
    setAuth: function(func, failRoute, checkAuthForEveryRoute){
      if(typeof func === 'function' && typeof failRoute === 'string'){
        this.runAuthenticationCheck = typeof checkAuthForEveryRoute === 'boolean' ? checkAuthForEveryRoute : true;
        this.authenticate = func;
        this.failRoute = failRoute;
      }
      else{
        console.warn('You must pass Router.setAuth() a function and a route to execute if authentication fails');
      }
    },
    /**
     * Readies the router for garbage collection
     * @method dispose
     */
    dispose: function() {
      if (this.onpopstate) {
        History.off('popstate', this.onpopstate);
        this.onpopstate = null;
      }
      Disposable.prototype.dispose.apply(this, arguments);
    }
  });

  /**
   * Checks if route exists and executes that route
   * @method exec
   *
   * @param {String} url  The URL
   * @return {Promise}  A promise
   */
  /**
   * Checks if route exists and executes that route
   * @method exec
   *
   * @param {String} url  The URL
   * @param {Object} state  A history record object
   * @return {Promise}  A promise
   */
  /**
   * Checks if route exists and executes that route
   * @method exec
   *
   * @param {String} url  The URL
   * @param {Object} state  A history record object
   * @param {Object} params  Additional parameters to pass to the route
   * @return {Promise}  A promise
   */
  function _executeIfRouteExists(url, state, params){
    var i = -1,
        route;

    while (!!(route = this.routes[++i])) {
      if (route.matches(url)) {
        break;
      }
    }

    if (!route) {
      return Promise.reject([url, state]);
    }

    return Promise.resolve()
      .then(function() {
        return route.exec(url, this, this.viewManager, state, params);
      }.bind(this))
      .then(function() {
        this.hasNavigated = true;
      }.bind(this))
      .then(this.unlock.bind(this))
      .catch(function(err) {
        this.unlock();
        throw err;
      }.bind(this));
  }


  return new Router();

});
