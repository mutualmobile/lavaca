/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, View, Promise) {

var UNDEFINED;

/**
 * @class Lavaca.mvc.View
 * @super Lavaca.events.EventDispatcher
 * Base view type
 *
 * @event rendersuccess
 * @event rendererror
 * @event enter
 * @event exit
 *
 * @constructor
 * @param {Object} el  The element that the PageView is bound to
 * @param {Object} model  The model used by the view
 * @param {Number} layer  The index of the layer on which the view sits
 *
 * @constructor
 * @param {Object} model  The model used by the view
 * @param {Number} layer  The index of the layer on which the view sits
 */
ns.PageView = View.extend(function(el, model, layer) {

  View.call(this, el, model);
  /**
   * @field {Number} layer
   * @default 0
   * The index of the layer on which the view sits
   */
  this.layer = layer || 0;


}, {

  /**
   * @field {jQuery} shell
   * @default null
   * The element containing the view
   */
  shell: null,


  /**
   * @method wrapper
   * Creates the view's wrapper element
   *
   * @return {jQuery}  The wrapper element
   */
  wrapper: function() {
    return $('<div class="view"></div>');
  },
  /**
   * @method interior
   * Creates the view's interior content wrapper element
   *
   * @return {jQuery} The interior content wrapper element
   */
  interior: function() {
    return $('<div class="view-interior"></div>');
  },


  /**
   * @method insertInto
   * Adds this view to a container
   *
   * @param {jQuery} container  The containing element
   */
  insertInto: function(container) {
    if (!this.shell.parent()[0] != container[0]) {
      var layers = container.children('[data-layer-index]'),
          i = -1,
          layer,
          insertionPoint;
      while (layer = layers[++i]) {
        layer = $(layer);
        if (layer.attr('data-layer-index') > this.index) {
          this.shell.insertBefore(layer);
          return;
        }
      }
      container.append(this.shell);
    }
  },
  /**
   * @method render
   * Renders the view using its template and model, overrides the View class render method
   *
   * @event rendersuccess
   * @event rendererror
   *
   * @return {Lavaca.util.Promise}  A promise
   */
  render: function() {
    var self = this,
        promise = new Promise(this),
        template = Lavaca.ui.Template.get(this.template),
        model = this.model;
    if (model instanceof ns.Model) {
      model = model.toObject();
    }
    if (this.el) {
      this.el.remove();
    }

    this.shell = this.wrapper();
    this.el = this.interior();
    this.shell.append(this.el);
    this.shell.attr('data-layer-index', this.layer);
    if (this.className) {
      this.shell.addClass(this.className);
    }
    promise
      .success(function(html) {
        this.trigger('rendersuccess', {html: html});
      })
      .error(function(err) {
        this.trigger('rendererror', {err: err});
      });
    this.shell.addClass('tmpl-' + this.template.toLowerCase().replace(/\s/g, '-'));
    template
      .render(model)
      .success(promise.resolver())
      .error(promise.rejector());
    
    return promise;
  },
  /**
   * @method enter
   * Executes when the user navigates to this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} exitingViews  The views that are exiting as this one enters
   * @return {Lavaca.util.Promise}  A promise
   */
  enter: function(container, exitingViews) {
    var promise = new Promise(this),
        renderPromise;
    container = $(container);
    if (!this.hasRendered) {
      renderPromise = this
        .render()
        .error(promise.rejector());
    }
    this.insertInto(container);
    if (renderPromise) {
      promise.when(renderPromise);
    } else {
      Lavaca.delay(promise.resolver());
    }
    promise.then(function() {
      this.trigger('enter');
    });
    return promise;
  },
  /**
   * @method exit
   * Executes when the user navigates away from this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} enteringViews  The views that are entering as this one exits
   * @return {Lavaca.util.Promise}  A promise
   */
  exit: function(container, enteringViews) {
    var promise = new Promise(this);
    this.shell.detach();
    Lavaca.delay(promise.resolver());
    promise.then(function() {
      this.trigger('exit');
    });
    return promise;
  }
});

})(Lavaca.resolve('Lavaca.mvc', true), Lavaca.$, Lavaca.mvc.View, Lavaca.util.Promise);