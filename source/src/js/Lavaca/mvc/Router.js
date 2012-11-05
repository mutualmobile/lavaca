/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Disposable, Promise) {

var _hasNavigated = false;

/**
 * @class Lavaca.mvc.Router
 * @super Lavaca.util.Disposable
 * URL manager
 *
 * @constructor
 * @param {Lavaca.mvc.ViewManager} viewManager  The view manager
 */
ns.Router = Disposable.extend(function(viewManager) {
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
  this.onpopstate = function(e) {
    if (this.hasNavigated) {
      this.exec(e.url, e);
    }
  };
  Lavaca.net.History.on('popstate', this.onpopstate, this);
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
   * @method add
   *
   * @sig Adds multiple routes
   * @param {Object} map  A hash in the form {pattern: [TController, action, params]}
   *   or {pattern: {controller: TController, action: action, params: params}
   * @return {Lavaca.mvc.Router}  The router (for chaining)
   *
   * @sig Adds a route
   * @param {String} pattern  The route URL pattern
   * @param {Function} TController  The type of controller to perform the action (should derive from [[Lavaca.mvc.Controller]])
   * @param {String} action  The name of the controller method to call
   * @return {Lavaca.mvc.Router}  The router (for chaining)
   *
   * @sig Adds a route
   * @param {String} pattern  The route URL pattern
   * @param {Function} TController  The type of controller to perform the action (should derive from [[Lavaca.mvc.Controller]])
   * @param {String} action  The name of the controller method to call
   * @param {Object} params  Key-value pairs that will be passed to the action
   * @return {Lavaca.mvc.Router}  The router (for chaining)
   */
  add: function(pattern, TController, action, params) {
    if (typeof pattern == 'object') {
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
      this.routes.push(new ns.Route(pattern, TController, action, params));
    }
    return this;
  },
  /**
   * @method exec
   * Executes the action for a given URL
   *
   * @sig
   * @param {String} url  The URL
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * @param {String} url  The URL
   * @param {Object} state  A history record object
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * @param {String} url  The URL
   * @param {Object} state  A history record object
   * @param {Object} params  Additional parameters to pass to the route
   * @return {Lavaca.util.Promise}  A promise
   */
  exec: function(url, state, params) {
    if (this.locked) {
      return (new Promise(this)).reject('locked');
    } else {
      this.locked = true;
    }
    if (!url) {
      url = '/';
    }
    if (url.indexOf('http') == 0) {
      url = url.replace(/^http(s?):\/\/.+?/, '');
    }
    var i = -1,
        route,
        promise = new Promise(this);
    promise.always(function() {
      this.unlock();
    });
    if (!this.hasNavigated) {
      promise.success(function() {
        this.hasNavigated = true;
      });
    }
    while (route = this.routes[++i]) {
      if (route.matches(url)) {
        return promise.when(route.exec(url, this, this.viewManager, state, params));
      }
    }
    return promise.reject(url, state);
  },
  /**
   * @method unlock
   * Unlocks the router so that it can be used again
   *
   * @return {Lavaca.mvc.Router}  This router (for chaining)
   */
  unlock: function() {
    this.locked = false;
    return this;
  },
  /**
   * @method dispose
   * Readies the router for garbage collection
   */
  dispose: function() {
    if (this.onpopstate) {
      Lavaca.net.History.off('popstate', this.onpopstate);
      this.onpopstate = null;
    }
    Disposable.prototype.dispose.apply(this, arguments);
  }
});

})(Lavaca.resolve('Lavaca.mvc', true), Lavaca.util.Disposable, Lavaca.util.Promise);