/*
Lavaca 1.0.4
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
 * @param {Object} el The element the view is bound to
 * @param {Object} model  The model used by the view
 *
 * @constructor
 * @param {Object} el The element that the childView is bound to
 * @param {Object} model  The model used by the view
 * @param {Lavaca.mvc.View} parentView  The View that contains the childView
 */

ns.View = EventDispatcher.extend(function(el, model, parentView) {
  EventDispatcher.call(this);
  /**
   * @field {Object} model
   * @default null
   * The model used by the view
   */
  this.model = model || null;
 
  /**
   * @field {String} id
   * @default generated from className and unique identifier
   * An id is applied to a data attribute on the views container
   */
  this.id = this.className + '-' + Lavaca.uuid();

  /**
   * @field {Object} parentView
   * @default null
   * If the view is created in the context of a childView, the parent view is assigned to this view
   */
  this.parentView = parentView || null;

  /**
   * @field {Object} el
   * @default null
   * The element that is either assigned to the view if in the context of a childView, or is created for the View
   *  if it is a PageView
   */
  this.el = el || null;

  /**
   * @field {Object} eventMap
   * @default {}
   * A dictionary of selectors and event types in the form
   *   {eventType: {delegate: 'xyz', callback: func}}
   */
  this.eventMap = {};
  /**
   * @field {Object} childViewMap
   * @default {}
   * A dictionary of selectors, View types and models in the form
   *   {selector: {TView: TView, model: model}}}
   */
  this.childViewMap = {};
  /**
   * @field {Lavaca.util.Cache} childViews
   * @default new Lavaca.util.Cache()
   * Interactive elements used by the view
   */
  this.childViews = new Lavaca.util.Cache();

  /**
   * @field {Object} childViewEventMap
   * @default {}
   * A map of all the events to be applied to child Views in the form of 
   *  {type: {TView: TView, callback : callback}}
   */
  this.childViewEventMap = {};

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
   * @field {Boolean} AutoRender
   * @default false
   * When autoRender is set to true, the view when created from applyChildView will be rendered automatically
   */
  autoRender: false,
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
    
    promise
      .success(function(html) {
        this.trigger('rendersuccess', {html: html});
      })
      .error(function(err) {
        this.trigger('rendererror', {err: err});
      });
    template
      .render(model)
      .success(promise.resolver())
      .error(promise.rejector())
      .then(function(html) {
        self.el.addClass(self.className);
        self.el.attr('data-child-view-id', self.id);
        self.el.html(html);
      });
    
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
   * @method createChildViews
   * Initializes child views on the view, called from onRenderSuccess
   */
  createChildViews: function() {
    var cache = this.childViews,
        childView,
        id,
        n,
        self = this,
        o;
    for (n in this.childViewMap) {
      o = this.childViewMap[n];
      this.el.find(n)
        .each(function(index, item) {
          //update for new constructor
          childView = new o['TView']($(item), o['model'], self);
          if (childView.autoRender){
            childView.render();
          }
          cache.set(childView.id, childView);
        });
    }
  },
  /**
   * @method mapChildView
   *
   * @sig
   * Assigns multiple Views to elements on the view
   * @param {Object} map  A hash of selectors to view types and models to be bound when the view is rendered.
   *     The map should be in the form {selector: {TView : TView, model : Lavaca.mvc.Model}}. For example, {'form': {TView : Lavaca.mvc.ExampleView, model : Lavaca.mvc.Model}}
   * @return {Lavaca.mvc.View}  This view (for chaining)
   *
   * @sig
   * Assigns a View type to be created for elements matching a selector when the view is rendered
   * @param {String} selector  The selector for the root element of the View
   * @param {Function} TView  The [[Lavaca.mvc.View]]-derived type of view to create
   * @param {Function} model  The [[Lavaca.mvc.Model]]-derived model instance to use in the child view
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  mapChildView: function(selector, TView, model) {
    if (typeof selector == 'object') {
      var childViewTypes = selector;
      for (selector in childViewTypes) {
        this.mapChildView(selector, childViewTypes[selector].TView, childViewTypes[selector].model);
      }
    } else {
      this.childViewMap[selector] = { TView :TView, model: model };
    }
    return this;
  },

  /**
   * @method mapChildViewEvent
   * Creates a map of events to add as listeners on the child views of a view
   * 
   * @param {String} type The type of event you want to listen on in the child views
   * @param {Function} callback The method to execute when this event type has occured
   * @param {Lavaca.mvc.View} TView The type of view to limit teh scope of the listener to only certain types of child views
   *
   * @sig
   * Maps multiple child event types
   * @param {Object} map A hash of event types with callbacks and TView's associated with that type
   *  The map shoudl be in the form {type : {callback : {Function}, TView : TView}}
   */
  mapChildViewEvent: function(type, callback, TView){
    if (typeof type == 'object'){
      var eventTypes = type;
      for (type in eventTypes){
        //add in view type to limit events created
        this.mapChildViewEvent(type, eventTypes[type].callback, eventTypes[type].TView);
      }
    } else {
      this.childViewEventMap[type] = {
                                    TView: TView,
                                    callback: callback    
                                 };
    }
  },

  /**
   * @method applyChildViewEvent
   * Called from onRenderSuccess of the view, adds listeners to all childviews if present
   *
   */
  applyChildViewEvents: function(){
    var childViewEventMap = this.childViewEventMap;
    for (type in childViewEventMap){
      this.childViews.each(function(key, item){
        if (childViewEventMap[type].TView){
          if (item instanceof childViewEventMap[type].TView){
            item.on(type, childViewEventMap[type].callback)          
          }  
        } else {
          item.on(type, childViewEventMap[type].callback)
        }
      });  
    }
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
    this.createChildViews(this.el);
    this.applyChildViewEvents();
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