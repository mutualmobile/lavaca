/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, EventDispatcher, Promise) {

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
 * @param {Object} model  The model used by the view
 * @param {Number} layer  The index of the layer on which the view sits
 *
 * @constructor
 * @param {Object} model  The model used by the view
 * @param {Number} layer  The index of the layer on which the view sits
 * @param {Object} eventMap  A dictionary of selectors and event types in the form
 *   {eventType: {delegate: 'xyz', callback: func}}
 * @param {Object} widgetMap  A dictionary of selectors and widget types in the form
 *   {selector: widgetType}
 */
ns.View = EventDispatcher.extend(function(model, layer, eventMap, widgetMap) {
  EventDispatcher.call(this);
  /**
   * @field {Object} model
   * @default null
   * The model used by the view
   */
  this.model = model || null;
  /**
   * @field {Number} layer
   * @default 0
   * The index of the layer on which the view sits
   */
  this.layer = layer || 0;
  /**
   * @field {Object} eventMap
   * @default {}
   * A dictionary of selectors and event types in the form
   *   {eventType: {delegate: 'xyz', callback: func}}
   */
  this.eventMap = eventMap || {};
  /**
   * @field {Object} widgetMap
   * @default {}
   * A dictionary of selectors and widget types in the form
   *   {selector: widgetType}
   */
  this.widgetMap = widgetMap || {};
  /**
   * @field {Lavaca.util.Cache} widgets
   * @default new Lavaca.util.Cache()
   * Interactive elements used by the view
   */
  this.widgets = new Lavaca.util.Cache();
  this
    .on('rendersuccess', this.onRenderSuccess)
    .on('rendererror', this.onRenderError);
}, {
  /**
   * @field {jQuery} el
   * @default null
   * The element associated with the view
   */
  el: null,
  /**
   * @field {jQuery} shell
   * @default null
   * The element containing the view
   */
  shell: null,
  /**
   * @field {String} template
   * @default null
   * The name of the template associated with the view
   */
  template: null,
  /**
   * @field {String} className
   * @default null
   * A class name added to the view container
   */
  className: null,
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
   * @method render
   * Renders the view using its template and model
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
      this.el.detach();
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
   * @method redraw
   * Re-renders the view's template and replaces the DOM nodes that match
   * the selector argument. If no selector argument is provided, the whole view
   * will be re-rendered. If the first parameter is passed as <code>false</code>
   * the resulting html will pe passed with the promise and nothing will be replaced.
   * Note: the number of elements that match the provided selector must be identical
   * in the current markup and in the newly rendered markup or else the returned
   * promise will be rejected.
   *
   * @sig
   * Re-renders the view's template using the view's model
   * and redraws the entire view
   * @return {Lavaca.util.Promise} A promise
   *
   * @sig
   * Re-renders the view's template using the specified model
   * and redraws the entire view
   * @param {Object} model  The data model to be passed to the template
   * @return {Lavaca.util.Promise} A promise
   *
   * @sig
   * Re-renders the view's template using the view's model and only redraws the
   * elements that match the specified selector string.
   * Note: The numbers of items that match the selector must
   * be exactly the same in the view's current markup and in the newly rendered
   * markup. If that is not the case, the returned promise will be rejected and
   * nothing will be redrawn.
   * @param {String} selector  Selector string that defines elements to redraw
   * @return {Lavaca.util.Promise} A promise
   *
   * @sig
   * Re-renders the view's template using the specified model and only redraws the
   * elements that match the specified selector string.
   * Note: The numbers of items that match the selector must
   * be exactly the same in the view's current markup and in the newly rendered
   * markup. If that is not the case, the returned promise will be rejected and
   * nothing will be redrawn.
   * @param {String} selector  Selector string that defines elements that will be updated
   * @param {Object} model  The data model to be passed to the template
   * @return {Lavaca.util.Promise} A promise
   *
   * @sig
   * Re-renders the view's template using the view's model. If shouldRedraw is true,
   * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
   * but the returned promise will be resolved with the newly rendered content. This allows
   * the caller to attach a success handler to the returned promise and define their own
   * redrawing behavior.
   * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
   * @return {Lavaca.util.Promise}  A promise
   *
   * @sig
   * Re-renders the view's template using the specified model. If shouldRedraw is true,
   * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
   * but the returned promise will be resolved with the newly rendered content. This allows
   * the caller to attach a success handler to the returned promise and define their own
   * redrawing behavior.
   * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
   * @param {Object} model  The data model to be passed to the template
   * @return {Lavaca.util.Promise}  A promise
   */
  redraw: function(selector, model) {
    var self = this,
        templateRenderPromise = new Promise(this),
        redrawPromise = new Promise(this),
        template = Lavaca.ui.Template.get(this.template),
        replaceAll;
    if (typeof selector === 'object' || selector instanceof ns.Model) {
      model = selector;
      replaceAll = true;
      selector = null;
    }
    else if (typeof selector == 'boolean') {
      replaceAll = selector;
      selector = null;
    } else if (!selector) {
      replaceAll = true;
    }
    if(!this.hasRendered) {
      return redrawPromise.rejector('View has not been rendered yet and cannot be redrawn.');
    }
    model = model || this.model;
    if (model instanceof ns.Model) {
      model = model.toObject();
    }
    templateRenderPromise
      .success(function(html) {
        if (replaceAll) {
          this.el.html(html);
          redrawPromise.resolve(html);
          return;
        }
        if(selector) {
          var $newEl = $('<div>' + html + '</div>').find(selector),
              $oldEl = this.el.find(selector);
          if($newEl.length > 0 && $newEl.length === $oldEl.length) {
            $oldEl.each(function(index) {
              $(this).replaceWith($newEl.eq(index));
            });
            redrawPromise.resolve(html);
          } else {
            redrawPromise.reject('Count of items matching selector is not the same in the original html and in the newly rendered html.');
          }
        } else {
          redrawPromise.resolve(html);
        }
      })
      .error(redrawPromise.rejector());
    template
      .render(model)
      .success(templateRenderPromise.resolver())
      .error(templateRenderPromise.rejector());
    return redrawPromise;
  },
  /**
   * @method clearModelEvents
   * Unbinds events from the model
   */
  clearModelEvents: function() {
    var type,
        callback;
    if (this.eventMap
        && this.eventMap.model
        && this.model
        && this.model instanceof EventDispatcher) {
      for (type in this.eventMap.model) {
        callback = this.eventMap.model[type];
        if (typeof callback == 'object') {
          callback = callback.on;
        }
        this.model.off(type, callback, this);
      }
    }
  },
  /**
   * @method applyEvents
   * Binds events to the view
   */
  applyEvents: function() {
    var el = this.el,
        callbacks,
        callback,
        delegate,
        type,
        opts;
    for (delegate in this.eventMap) {
      callbacks = this.eventMap[delegate];
      for (type in callbacks) {
        callback = callbacks[type];
        if (typeof callback == 'object') {
          opts = callback;
          callback = callback.on;
        } else {
          opts = UNDEFINED;
        }
        if (delegate == 'model') {
          if (this.model && this.model instanceof EventDispatcher) {
            this.model.on(type, callback, this);
          }
        } else if (type == 'tap' && el.tap) {
          el.tap(delegate, callback);
        } else if (type == 'taphold' && el.taphold) {
          el.taphold(delegate, callback, opts ? opts.duration : UNDEFINED);
        } else if (type == 'swipe' && el.swipe) {
          el.swipe(delegate, callback, opts);
        } else if (type == 'animationEnd' && el.animationEnd) {
          el.animationEnd(delegate, callback)
        } else if (type == 'transitionEnd' && el.transitionEnd) {
          el.transitionEnd(delegate, callback)
        } else {
          el.on(type, delegate, callback);
        }
      }
    }
  },
  /**
   * @method mapEvent
   *
   * @sig
   * Maps multiple delegated events for the view
   * @param {Object} map  A hash of the delegates, event types, and handlers
   *     that will be bound when the view is rendered. The map should be in
   *     the form <code>{delegate: {eventType: callback}}</code>. For example,
   *     <code>{'.button': {click: onClickButton}}</code>. The events defined in
   *     [[Lavaca.events.Touch]], [[Lavaca.fx.Animation]], and [[Lavaca.fx.Transition]]
   *     are also supported. To pass in options to a Lavaca event, use a wrapper object:
   *     <code>{'.taphold-me': {taphold: {on: onTapHoldButton, duration: 1000}}}</code>
   *     or <code>{'.swipe-me': {swipe: {on: onSwipeButton, direction: 'vertical'}}}</code>
   * @return {Lavaca.mvc.View}  This view (for chaining)
   *
   * @sig
   * Maps an event for the view
   * @param {String} delegate  The element to which to delegate the event
   * @param {String} type  The type of event
   * @param {Function} callback  The event handler
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  mapEvent: function(delegate, type, callback) {
    var o;
    if (typeof delegate == 'object') {
      o = delegate;
      for (delegate in o) {
        for (type in o[delegate]) {
          this.mapEvent(delegate, type, o[delegate][type]);
        }
      }
    } else {
      o = this.eventMap[delegate];
      if (!o) {
        o = this.eventMap[delegate] = {};
      }
      o[type] = callback;
    }
    return this;
  },
  /**
   * @method createWidgets
   * Initializes widgets on the view
   */
  createWidgets: function() {
    var cache = this.widgets,
        widget,
        n,
        o;
    for (n in this.widgetMap) {
      o = this.widgetMap[n];
      (n == 'self' ? this.el : this.el.find(n))
        .each(function(index, item) {
          widget = new o($(item));
          cache.set(widget.id, widget);
        });
    }
  },
  /**
   * @method mapWidget
   *
   * @sig
   * Assigns multiple widget types to elements on the view
   * @param {Object} map  A hash of selectors to widget types to be bound when the view is rendered.
   *     The map should be in the form {selector: TWidget}. For example, {'form': Lavaca.ui.Form}
   * @return {Lavaca.mvc.View}  This view (for chaining)
   *
   * @sig
   * Assigns a widget type to be created for elements matching a selector when the view is rendered
   * @param {String} selector  The selector for the root element of the widget
   * @param {Function} TWidget  The [[Lavaca.ui.Widget]]-derived type of widget to create
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  mapWidget: function(selector, TWidget) {
    if (typeof selector == 'object') {
      var widgetTypes = selector;
      for (selector in widgetTypes) {
        this.mapWidget(selector, widgetTypes[selector]);
      }
    } else {
      this.widgetMap[selector] = TWidget;
    }
    return this;
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
  },
  /**
   * @method onRenderSuccess
   * Executes when the template renders successfully
   *
   * @param {Event} e  The render event. This object should have a string property named "html"
   *   that contains the template's rendered HTML output.
   */
  onRenderSuccess: function(e) {
    this.el.html(e.html);
    this.applyEvents(this.el);
    this.createWidgets(this.el);
    this.hasRendered = true;
  },
  /**
   * @method onRenderError
   * Executes when the template fails to render
   *
   * @param {Event} e  The error event. This object should have a string property named "err"
   *   that contains the error message.
   */
  onRenderError: function(e) {
    Lavaca.log(e.err);
  },
  /**
   * @method dispose
   * Readies the view for garbage collection
   */
  dispose: function() {
    if (this.model) {
      this.clearModelEvents();
    }
    // Do not dispose of template or model
    this.template
      = this.model
      = null;
    EventDispatcher.prototype.dispose.apply(this, arguments);
  }
});

})(Lavaca.resolve('Lavaca.mvc', true), Lavaca.$, Lavaca.events.EventDispatcher, Lavaca.util.Promise);