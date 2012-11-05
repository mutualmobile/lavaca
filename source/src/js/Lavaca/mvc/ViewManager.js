/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, util, $, Promise, Disposable, ArrayUtils) {

/**
 * @class Lavaca.mvc.ViewManager
 * @super Lavaca.util.Disposable
 * Manager responsible for drawing views
 *
 * @constructor
 *
 * @constructor
 * @param {jQuery} el  The element that contains all layers
 */
ns.ViewManager = Disposable.extend(function(el) {
  Disposable.call(this);
  /**
   * @field {jQuery} el
   * @default null
   * The element that contains all view layers
   */
  this.el = $(el || document.body);
  /**
   * @field {Lavaca.util.Cache} views
   * @default new Lavaca.util.Cache()
   * A cache containing all views
   */
  this.views = new util.Cache();
  /**
   * @field {Array} layers
   * @default []
   * A list containing all layers
   */
  this.layers = [];
  /**
   * @field {Array} exitingViews
   * @default []
   * A list containing all views that are currently exiting
   */
  this.exitingViews = [];
  /**
   * @field {Array} enteringViews
   * @default []
   * A list containing all views that are currently entering
   */
  this.enteringViews = [];
}, {
  /**
   * @field {Boolean} locked
   * @default false
   * When true, the view manager is prevented from loading views.
   */
  locked: false,
  /**
   * @method load
   * Loads a view
   *
   * @param {String} cacheKey  The cache key associated with the view
   * @param {Function} TView  The type of view to load (should derive from [[Lavaca.mvc.View]])
   * @param {Array} args  Initialization arguments for the view
   * @param {Number} layer  The index of the layer on which the view will sit
   * @return {Lavaca.util.Promise}  A promise
   */
  load: function(cacheKey, TView, model, layer) {
    if (this.locked) {
      return (new Promise(this)).reject('locked');
    } else {
      this.locked = true;
    }
    layer = layer || 0;
    var self = this,
        view = this.views.get(cacheKey),
        promise = new Promise(this),
        enterPromise = new Promise(promise),
        renderPromise = null,
        exitPromise = null;
    promise.always(function() {
      this.locked = false;
    });
    if (!view) {
      view = new TView(model, layer);
      renderPromise = view.render();
      if (cacheKey !== null) {
        this.views.set(cacheKey, view);
        view.cacheKey = cacheKey;
      }
    }
    function lastly() {
      self.enteringViews = [view];
      promise.success(function() {
        Lavaca.delay(function() {
          self.enteringViews = [];
        });
      });
      exitPromise = self.dismissLayersAbove(layer - 1, view);
      if (self.layers[layer] != view) {
        enterPromise
          .when(view.enter(self.el, self.exitingViews), exitPromise)
          .then(promise.resolve);
        self.layers[layer] = view;
      } else {
        promise.when(exitPromise);
      }
    }
    if (renderPromise) {
      renderPromise.then(lastly, promise.rejector());
    } else {
      lastly();
    }
    return promise;
  },
  /**
   * @method dismiss
   * Removes all views on a layer
   *
   * @sig
   * @param {Number} index  The index of the layer to remove
   *
   * @sig
   * @param {jQuery} el  An element on the layer to remove (or the layer itself)
   *
   * @sig
   * @param {Lavaca.mvc.View} view  The view on the layer to remove
   */
  dismiss: function(layer) {
    if (typeof layer == 'number') {
      this.dismissLayersAbove(layer - 1);
    } else if (layer instanceof Lavaca.mvc.View) {
      this.dismiss(layer.layer);
    } else {
      layer = $(layer);
      var index = layer.attr('data-layer-index');
      if (index === null) {
        layer = layer.closest('[data-layer-index]');
        index = layer.attr('data-layer-index');
      }
      if (index !== null) {
        this.dismiss(Number(index));
      }
    }
  },
  /**
   * @method dismissLayersAbove
   *
   * Removes all layers above a given index
   *
   * @sig
   * @param {Number}  index The index above which to clear
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * @param {Number} index  The index above which to clear
   * @param {Lavaca.mvc.View}  exceptForView A view that should not be dismissed
   * @return {Lavaca.util.Promise}  A promise
   */
  dismissLayersAbove: function(index, exceptForView) {
    var promise = new Promise(this),
        dismissedLayers = false,
        i,
        layer;
    for (i = this.layers.length - 1; i > index; i--) {
      if ((layer = this.layers[i]) && (!exceptForView || exceptForView != layer)) {
        (function(layer) {
          this.exitingViews.push(layer);
          promise
            .when(layer.exit(this.el, this.enteringViews))
            .success(function() {
              Lavaca.delay(function() {
                ArrayUtils.remove(this.exitingViews, layer);
                if (!layer.cacheKey || (exceptForView && exceptForView.cacheKey == layer.cacheKey)) {
                  layer.dispose();
                }
              }, this);
            });
          this.layers[i] = null;
        }).call(this, layer);
        dismissedLayers = true;
      }
    }
    if (!dismissedLayers) {
      promise.resolve();
    }
    return promise;
  },
  /**
   * @method flush
   * Empties the view cache
   */
  flush: function(cacheKey) {
    // Don't dispose of any views that are currently displayed
    //flush individual cacheKey
    if(cacheKey){
      this.views.remove(cacheKey);
    } else {
      var i = -1,
        layer;
      while (layer = this.layers[++i]) {
        if (layer.cacheKey) {
          this.views.remove(layer.cacheKey);
        }
      }
      this.views.dispose();
      this.views = new util.Cache();  
    }
  },
  /**
   * @method dispose
   * Readies the view manager for garbage collection
   */
  dispose: function() {
    Disposable.prototype.dispose.call(this);
  }
});

})(Lavaca.resolve('Lavaca.mvc', true), Lavaca.util, Lavaca.$, Lavaca.util.Promise, Lavaca.util.Disposable, Lavaca.util.ArrayUtils);