/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Disposable, Promise, StringUtils, $) {

/**
 * @class Lavaca.mvc.Controller
 * @super Lavaca.util.Disposable
 * Base type for controllers
 *
 * @constructor
 * @param {Lavaca.mvc.Controller} other  Another controller from which to take context information
 *
 * @constructor
 * @param {Lavaca.mvc.Router} router  The application's router
 * @param {Lavaca.mvc.ViewManager} viewManager  The application's view manager
 */
ns.Controller = Disposable.extend(function(router, viewManager) {
  if (router instanceof ns.Controller) {
    this.router = router.router;
    this.viewManager = router.viewManager;
  } else {
    this.router = router;
    this.viewManager = viewManager;
  }
}, {
  /**
   * @field {Lavaca.mvc.Router} router
   * @default null
   * The application's router
   */
  router: null,
  /**
   * @field {Lavaca.mvc.ViewManager} viewManager
   * @default null
   * The application's view manager
   */
  viewManager: null,
  /**
   * @method exec
   * Executes an action on this controller
   *
   * @sig
   * @param {String} action  The name of the controller method to call
   * @param {Object} params  Key-value arguments to pass to the action
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * @param {String} action  The name of the controller method to call
   * @param {Object} params  Key-value arguments to pass to the action
   * @param {Object} state  A history record object
   * @return {Lavaca.util.Promise}  A promise
   */
  exec: function(action, params, state) {
    this.params = params;
    this.state = state;
    var promise = new Promise(this),
        model,
        result;
    if (state) {
      model = state.state;
      promise.success(function() {
        document.title = state.title;
      });
    }
    result = this[action](params, model);
    if (result instanceof Promise) {
      promise.when(result);
    } else {
      promise.resolve();
    }
    return promise;
  },
  /**
   * @method ajax
   * Makes an AJAX request
   *
   * @param {Object} opts  jQuery AJAX options
   * @return {Lavaca.util.Promise}  A promise
   */
  ajax: function(opts) {
    return Promise.when(this, Lavaca.net.Connectivity.ajax(opts));
  },
  /**
   * @method view
   * Loads a view
   *
   * @param {String} cacheKey  The key under which to cache the view
   * @param {Function} TView  The type of view to load (should derive from [[Lavaca.mvc.View]])
   * @param {Object} model  The data object to pass to the view
   * @param {Number} layer  The integer indicating what UI layer the view sits on
   * @return {Lavaca.util.Promise}  A promise
   */
  view: function(cacheKey, TView, model, layer) {
    return Promise.when(this, this.viewManager.load(cacheKey, TView, model, layer));
  },
  /**
   * @method ajaxThenView
   * Makes an AJAX request and then loads a view if successful
   *
   * @param {Object} opts  jQuery AJAX options
   * @param {Function} responseToModel  A function that converts the AJAX response to
   *   a model for the view
   * @param {String} cacheKey  The key under which to cache the view
   * @param {Function} TView  The type of view (should derive from [[Lavaca.mvc.View]])
   * @param {Number} layer  The layer on which the view sits
   * @return {Lavaca.util.Promise}  A promise
   */
  ajaxThenView: function(opts, responseToModel, cacheKey, TView, layer) {
    var promise = new Promise(this),
        self = this;
    this.ajax(opts)
      .success(function(resp) {
        promise.when(this.view(cacheKey, TView, responseToModel.apply(self, arguments), layer));
      })
      .error(function() {
        promise.reject.apply(promise, arguments);
      });
    return promise;
  },
  /**
   * @method history
   * Adds a state to the browser history
   *
   * @param {Object} state  A data object associated with the page state
   * @param {String} title  The title of the page state
   * @param {String} url  The URL of the page state
   * @param {Boolean} useReplace  The bool to decide if to remove previous history
   */
  history: function(state, title, url, useReplace) {
    var needsHistory = !this.state;
    return function() {
      if (needsHistory) {
        Lavaca.net.History[useReplace ? 'replace' : 'push'](state, title, url);
      }
    };
  },
  /**
   * @method translate
   * Convenience method for accessing translated messages
   *
   * @sig
   * @param {String} code  The key of the translated message
   * @return {String} The translated message
   *
   * @sig
   * @param {String} code  The key of the translated message
   * @param {Array} args  Values to substitute into the message using [[Lavaca.util.StringUtils]].format()
   * @return {String}  The translated message
   */
  translate: function(code, args) {
    var result = Lavaca.util.Translation.get(code);
    if (result && args) {
      result = StringUtils.format.apply(null, [result].concat(args));
    }
    return result;
  },
  /**
   * @method url
   * Convenience method for formatting URLs
   *
   * @param {String} str  The URL string
   * @param {Array} args  Format arguments to insert into the URL
   * @return {String}  The formatted URL
   */
  url: function(str, args) {
    return StringUtils.format(str, args, encodeURIComponent);
  },
  /**
   * @method redirect
   * Directs the user to another route
   *
   * @sig
   * @param {String} str  The URL string
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * @param {String} str  The URL string
   * @param {Array} args  Format arguments to insert into the URL
   * @return {Lavaca.util.Promise}  A promise
   */
  redirect: function(str, args) {
    return this.router.unlock().exec(this.url(str, args || []));
  },
  /**
   * @method ajaxThenRedirect
   * Makes an AJAX request and then redirects to an action if successful
   *
   * @param {Object} opts  jQuery AJAX options
   * @param {Function} responseToURL  A function to call after the AJAX operation completes
   *    that returns the URL to which to redirect
   * @return {Lavaca.util.Promise}  A promise
   */
  ajaxThenRedirect: function(opts, responseToURL) {
    var promise = new Promise(this),
        self = this;
    this.ajax(opts)
      .success(function(resp) {
        promise.when(this.redirect(responseToURL.apply(self, arguments)));
      })
      .error(function() {
        promise.reject.apply(promise, arguments);
      });
    return promise;
  },
  /**
   * @method dispose
   * Readies the controller for garbage collection
   */
  dispose: function() {
    // Do not dispose of view manager or router
    this.router
      = this.viewManager
      = null;
    Disposable.prototype.dispose.apply(this, arguments);
  }
});

})(Lavaca.resolve('Lavaca.mvc', true), Lavaca.util.Disposable, Lavaca.util.Promise, Lavaca.util.StringUtils, Lavaca.$);