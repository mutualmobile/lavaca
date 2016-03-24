import { default as History } from '../net/History';
import { default as View } from './View';
import { default as Cache } from '../util/Cache';
import { default as Disposable } from '../util/Disposable';
import {merge, fillIn} from 'mout/object';
import {contains, removeAll} from 'mout/array';
import $ from 'jquery';

/**
 * Manager responsible for drawing views
 * @class lavaca.mvc.ViewManager
 * @extends lavaca.util.Disposable
 *
 * @constructor
 * @param {jQuery} el  The element that contains all layers
 */
var ViewManager = Disposable.extend(function ViewManager(el){
  Disposable.call(this);
  /**
   * The element that contains all view layers
   * @property {jQuery} el
   * @default null
   */
  this.el = $(el || document.body);
  /**
   * A cache containing all views
   * @property {Lavaca.util.Cache} views
   * @default new Lavaca.util.Cache()
   */
  this.pageViews = new Cache();
  /**
   * A list containing all layers
   * @property {Array} layers
   * @default []
   */
  this.layers = [];
  /**
   * Toggles breadcrumb tracking
   * @property {Boolean} shouldTrackBreadcrumb
   * @default false
   */
  this.shouldTrackBreadcrumb = false;
  /**
   * A list containing all views starting from the last root
   * @property {Array} breadcrumb
   * @default []
   */
  this.breadcrumb = [];
  /**
   * A list containing all views that are currently exiting
   * @property {Array} exitingPageViews
   * @default []
   */
  this.exitingPageViews = [];
  /**
   * A list containing all views that are currently entering
   * @property {Array} enteringPageViews
   * @default []
   */
  this.enteringPageViews = [];
}, {
  /**
   * When true, the view manager is prevented from loading views.
   * @property {Boolean} locked
   * @default false
   */
  locked: false,
  /**
   * Sets the el property on the instance
   * @method setEl
   *
   * @param {jQuery} el  A jQuery object of the element that contains all layers
   * @return {Lavaca.mvc.ViewManager}  This View Manager instance
   */
  /**
   * Sets the el property on the instance
   * @method setEl
   *
   * @param {String} el  A CSS selector matching the element that contains all layers
   * @return {Lavaca.mvc.ViewManager}  This View Manager instance
   */
  setEl: function(el) {
    this.el = typeof el === 'string' ? $(el) : el;
    return this;
  },
  /**
   * Initializes Breadcrumb tracking to handle contextual animations and enable edge swipe history states
   *
   * @method initBreadcrumbTracking
   */
  initBreadcrumbTracking: function() {
    this.shouldTrackBreadcrumb = true;
    History.on('popstate', (e) => {
      if (e.direction === 'back') {
        this.popBreadcrumb();
        if (!e.bypassLoad) {
          this.popBreadcrumb();
        }
      }
    });
  },
  /**
   * Handles the disposal of views that are popped out of the breadcrumb array
   * @method popBreadcrumb
   */
  popBreadcrumb: function() {
    this.breadcrumb.pop();
  },
  /**
   * Tracks new breadcrumbs and resets root links
   *
   * @param {Object} obj An Object containing the parts to create a view (cacheKey TPageView model params layer)
   * @method trackBreadcrumb
   */
  trackBreadcrumb: function(obj) {
    if (obj.params.root) {
      this.breadcrumb = [];
    }
    this.breadcrumb.push(obj);
  },
  /**
   * A method to silently rewind history without fully routing back.
   * This is an important tool for implementing edge swipe history back
   *
   * @param {Lavaca.mvc.View} pageView A View instance
   * @method rewind
   */
  rewind: function(pageView) {
    History.silentBack();
    History.animationBreadcrumb.pop();

    var replacingPageView = this.layers[0];
    if (!replacingPageView.cacheKey) {
      replacingPageView.dispose();
    }
    if (replacingPageView.el) {
      replacingPageView.el.detach();
    }

    if (pageView) {
      this.layers[0] = pageView;
    }
  },
  /**
   * Builds a pageView and merges in parameters
   * @method buildPageView
   *
   * @param {Object} obj An Object containing the parts to create a view (cacheKey TPageView model params layer) 
   * @return {Lavaca.mvc.View}  A View instance
   */
  buildPageView: function(obj) {
    var pageView = this.pageViews.get(obj.cacheKey);

    if (typeof obj.params === 'object') {
      obj.params.breadcrumbLength = this.breadcrumb.length;
      if ((this.breadcrumb.length > 1)) {
        obj.params.shouldShowBack = true;
      }
    }

    if (!pageView) {
      pageView = new obj.TPageView(null, obj.model, obj.layer);
      if (typeof this.pageViewMixin === 'object') {
        merge(pageView, this.pageViewMixin);
      }
      if (typeof this.pageViewFillin === 'object') {
        fillIn(pageView, this.pageViewFillin);
      }
      if (typeof obj.params === 'object') {
        merge(pageView, obj.params);
      }
      pageView.isViewManagerView = true;
      if (obj.cacheKey !== null) {
        this.pageViews.set(obj.cacheKey, pageView);
        pageView.cacheKey = obj.cacheKey;
      }
    } else {
      if (typeof obj.params === 'object') {
        merge(pageView, obj.params);
      }
    }

    return pageView;
  },
  /**
   * Loads a view
   * @method load
   *
   * @param {String} cacheKey  The cache key associated with the view
   * @param {Function} TPageView  The type of view to load (should derive from [[Lavaca.mvc.View]])
   * @param {Object} model  The views model
   * @param {Number} layer  The index of the layer on which the view will sit
   * @return {Promise}  A promise
   */
  /**
   * Loads a view
   * @method load
   *
   * @param {String} cacheKey  The cache key associated with the view
   * @param {Function} TPageView  The type of view to load (should derive from [[Lavaca.mvc.View]])
   * @param {Object} model  The views model
   * @param {Object} params  Parameters to be mapped to the view
   * @return {Promise}  A promise
   */
  load: function(cacheKey, TPageView, model, params) {
    if (this.locked) {
      return Promise.reject('locked');
    } else {
      this.locked = true;
    }
    params = params || {};

    if (params.bypassLoad) {
      this.locked = false;
      return Promise.resolve();
    }

    var layer = TPageView.prototype.layer || 0;

    if (typeof params === 'number') {
      layer = params;
      params = {'layer': layer};
    } else if (params.layer) {
      layer = params.layer;
    }

    var pageView,
        obj = {
          'cacheKey':cacheKey,
          'TPageView':TPageView,
          'model':model,
          'params':params,
          'layer':layer
        };

    if (this.shouldTrackBreadcrumb) {
      this.trackBreadcrumb(obj);
    }
    pageView = this.buildPageView(obj);

    return Promise.resolve()
      .then(() => {
        if (!pageView.hasRendered) {
          return pageView.render();
        }
      })
      .then(() => this.beforeEnterExit(layer-1, pageView))
      .then(() => {
        this.enteringPageViews = [pageView];
        return Promise.all([
          (() => this.layers[layer] !== pageView ? pageView.enter(this.el, this.exitingPageViews):null)(),
          (() => this.dismissLayersAbove(layer-1, pageView))()
        ]);
      })
      .then(() => {
        this.locked = false;
        this.enteringPageViews = [];
        this.layers[layer] = pageView;
      });
  },
  /**
   * Execute beforeEnter or beforeExit for each layer. Both fucntions
   * beforeEnter and beforeExit must return promises.
   * @method beforeEnterExit
   *
   * @param {Number}  index The index above which is to be cleared
   * @return {Promise}  A promise
   */
  /**
   * Execute beforeEnter or beforeExit for each layer. Both fucntions
   * beforeEnter and beforeExit must return promises.
   * @method beforeEnterExit
   *
   * @param {Number} index  The index above which is to be cleared
   * @param {Lavaca.mvc.View}  enteringView A view that will be entering
   * @return {Promise}  A promise
   */
  beforeEnterExit: function(index, enteringView) {
    var i,
      layer,
      list = [];
    if (enteringView && typeof enteringView.beforeEnter === 'function') {
      list.push(enteringView.beforeEnter());
    }
    for (i = this.layers.length - 1; i > index; i--) {
      if ((layer = this.layers[i]) && (!enteringView || enteringView !== layer)) {
        ((layer) => {
          if (typeof layer.beforeExit === 'function') {
            list.push(layer.beforeExit());
          }
        }).call(this, layer);
      }
    }
    return Promise.all(list);
  },
  /**
   * Removes all views on a layer
   * @method dismiss
   *
   * @param {Number} index  The index of the layer to remove
   * @return {Promise}  A promise
   */
  /**
   * Removes all views on a layer
   * @method dismiss
   *
   * @param {jQuery} el  An element on the layer to remove (or the layer itself)
   * @return {Promise}  A promise
   */
  /**
   * Removes all views on a layer
   * @method dismiss
   *
   * @param {Lavaca.mvc.View} view  The view on the layer to remove
   * @return {Promise}  A promise
   */
  dismiss: function(layer) {
    if (typeof layer === 'number') {
      return this.dismissLayersAbove(layer - 1);
    } else if (layer instanceof View) {
      return this.dismiss(layer.layer);
    } else {
      layer = $(layer);
      var index = layer.attr('data-layer-index');
      if (index === null) {
        layer = layer.closest('[data-layer-index]');
        index = layer.attr('data-layer-index');
      }
      if (index !== null) {
        return this.dismiss(Number(index));
      }
    }
  },
  /**
   * Removes all layers above a given index
   * @method dismissLayersAbove
   *
   * @param {Number}  index The index above which to clear
   * @return {Promise}  A promise
   */
  /**
   * Removes all layers above a given index
   * @method dismissLayersAbove
   *
   * @param {Number} index  The index above which to clear
   * @param {Lavaca.mvc.View}  exceptForView A view that should not be dismissed
   * @return {Promise}  A promise
   */
  dismissLayersAbove: function(index, exceptForView) {
    var toDismiss = this.layers.slice(index+1)
      .filter((layer) => {
        return (layer && (!exceptForView || exceptForView !== layer));
      });

    this.layers = this.layers.map((layer) => {
      if (contains(toDismiss, layer)) {
        return null;
      }
      return layer;
    });

    var promises = toDismiss
      .map((layer) => {
        return Promise.resolve()
          .then(() => {
            this.exitingPageViews.push(layer);
            return layer.exit(this.el, this.enteringPageViews);
          })
          .then(() => {
            removeAll(this.exitingPageViews, layer);
            if (!layer.cacheKey || (exceptForView && exceptForView.cacheKey === layer.cacheKey)) {
              layer.dispose();
            }
          });
      });

    return Promise.all(promises);
  },
  /**
   * Empties the view cache
   * @method flush
   */
  flush: function(cacheKey) {
    // Don't dispose of any views that are currently displayed
    //flush individual cacheKey
    if (cacheKey){
      this.pageViews.remove(cacheKey);
    } else {
      var i = -1,
        layer;
      while (!!(layer = this.layers[++i])) {
        if (layer.cacheKey) {
          this.pageViews.remove(layer.cacheKey);
        }
      }
      this.pageViews.dispose();
      this.pageViews = new Cache();
    }
  },
  /**
   * Readies the view manager for garbage collection
   * @method dispose
   */
  dispose: function() {
    Disposable.prototype.dispose.call(this);
  }
});

export default new ViewManager(null);