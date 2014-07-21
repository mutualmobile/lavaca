define(function(require) {

  var $ = require('$'),
    View = require('lavaca/mvc/View'),
    Cache = require('lavaca/util/Cache'),
    Disposable = require('lavaca/util/Disposable'),
    merge = require('mout/object/merge'),
    contains = require('mout/array/contains'),
    removeAll = require('mout/array/removeAll');

  /**
   * Manager responsible for drawing views
   * @class lavaca.mvc.ViewManager
   * @extends lavaca.util.Disposable
   *
   * @constructor
   * @param {jQuery} el  The element that contains all layers
   */
  var ViewManager = Disposable.extend(function(el) {
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
      var layer = TPageView.prototype.layer || 0,
          pageView = this.pageViews.get(cacheKey);

      if (typeof params === 'number') {
        layer = params;
      } else if (params.layer) {
        layer = params.layer;
      }

      var shouldRender = false;
      if (!pageView) {
        pageView = new TPageView(null, model, layer);
        if (typeof params === 'object') {
          merge(pageView, params);
        }
        shouldRender = true;
        if (cacheKey !== null) {
          this.pageViews.set(cacheKey, pageView);
          pageView.cacheKey = cacheKey;
        }
      } else {
        if (typeof params === 'object') {
          merge(pageView, params);
        }
      }

      return Promise.resolve()
        .then(function() {
          if (shouldRender) {
            return pageView.render();
          }
        })
        .then(function() {
          return this.beforeEnterExit(layer-1, pageView);
        }.bind(this))
        .then(function() {
          this.enteringPageViews = [pageView];
          return Promise.all([
            (function() {
              if (this.layers[layer] !== pageView) {
                return pageView.enter(this.el, this.exitingPageViews);
              }
            }.bind(this))(),
            (function() {
              return this.dismissLayersAbove(layer-1, pageView);
            }.bind(this))()
          ]);
        }.bind(this))
        .then(function() {
          this.locked = false;
          this.enteringPageViews = [];
          this.layers[layer] = pageView;
        }.bind(this));
    },
    /**
     * Execute beforeEnter or beforeExit for each layer. Both functions
     * beforeEnter and beforeExit must return promises.
     * @method beforeEnterExit
     *
     * @param {Number}  index The index above which is to be cleared
     * @return {Promise}  A promise
     */
    /**
     * Execute beforeEnter or beforeExit for each layer. Both functions
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
          (function(layer) {
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
        .filter(function(layer) {
          return (layer && (!exceptForView || exceptForView !== layer));
        });

      this.layers = this.layers.map(function(layer) {
        if (contains(toDismiss, layer)) {
          return null;
        }
        return layer;
      });

      var promises = toDismiss
        .map(function(layer) {
          return Promise.resolve()
            .then(function() {
              this.exitingPageViews.push(layer);
              return layer.exit(this.el, this.enteringPageViews);
            }.bind(this))
            .then(function() {
              removeAll(this.exitingPageViews, layer);
              if (!layer.cacheKey || (exceptForView && exceptForView.cacheKey === layer.cacheKey)) {
                layer.dispose();
              }
            }.bind(this));
        }.bind(this));

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

  return new ViewManager(null);

});
