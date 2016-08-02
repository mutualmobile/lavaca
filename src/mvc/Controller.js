import $ from 'jquery';
import {default as Model} from './Model';
import {default as History} from '../net/History';
import {default as Disposable} from '../util/Disposable';
import {default as interpolate} from 'mout/string/interpolate';

/**
 * Base type for controllers
 * @class lavaca.mvc.Controller
 * @extends lavaca.util.Disposable
 * @constructor
 * @param {Lavaca.mvc.Controller} other  Another controller from which to take context information
 * @param {Lavaca.mvc.Router} [router]  The application's router
 * @param {Lavaca.mvc.ViewManager} [viewManager]  The application's view manager
 */
var Controller = Disposable.extend(function Controller(router, viewManager){
  if (router instanceof Controller) {
    this.router = router.router;
    this.viewManager = router.viewManager;
  } else {
    this.router = router;
    this.viewManager = viewManager;
  }
}, {
  /**
   * The application's router
   * @property {Lavaca.mvc.Router} router
   * @default null
   */
  router: null,
  /**
   * The application's view manager
   * @property {Lavaca.mvc.ViewManager} viewManager
   * @default null
   */
  viewManager: null,
  /**
   * Loads a view
   * @method view
   *
   * @param {String} cacheKey  The key under which to cache the view
   * @param {Function} TView  The type of view to load (should derive from [[Lavaca.mvc.View]])
   * @param {Object} model  The data object to pass to the view
   * @param {Number} layer  The integer indicating what UI layer the view sits on
   * @return {Promise}  A promise
   */
  view(cacheKey, TView, model, layer) {
    return this.viewManager.load(cacheKey, TView, model, layer);
  },
  /**
   * Adds a state to the browser history
   * @method history
   *
   * @param {Object} state  A data object associated with the page state
   * @param {String} title  The title of the page state
   * @param {String} url  The URL of the page state
   * @param {Boolean} useReplace  The bool to decide if to remove previous history
   */
  history(state, title, url, useReplace) {
    var needsHistory = !this.state;
    return () => {
      if (needsHistory) {
        History[useReplace ? 'replace' : 'push'](state, title, url);
      }
    };
  },
  /**
   * Convenience method for formatting URLs
   * @method url
   *
   * @param {String} str  The URL string
   * @param {Array} args  Format arguments to insert into the URL
   * @return {String}  The formatted URL
   */
  url(str, args) {
    args = args.map(window.encodeURIComponent);
    return interpolate(str, args, /\{(.+?)\}/);
  },
  /**
   * Directs the user to another route
   * @method redirect
   *
   * @param {String} str  The URL string
   * @return {Promise}  A promise
   *
   */
  /**
   * Directs the user to another route
   * @method redirect
   * @param {String} str  The URL string
   * @param {Array} args  Format arguments to insert into the URL
   * @return {Promise}  A promise
   */
  redirect(str, args, params) {
    return this.router.unlock().exec(this.url(str, args || []), null, params);
  },
  /**
   * Readies the controller for garbage collection
   * @method dispose
   */
  dispose() {
    // Do not dispose of view manager or router
    this.router
      = this.viewManager
      = null;
    Disposable.prototype.dispose.apply(this, arguments);
  }
});

export default Controller;