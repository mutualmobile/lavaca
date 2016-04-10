import { default as EventDispatcher } from '../events/EventDispatcher';
import { default as Model } from '../mvc/Model';
import { default as ChildViewManager } from '../mvc/ChildViewManager';
import { default as uuid } from '../util/uuid';
import { forOwn, size } from 'mout/object';
import { isString, isBoolean, isObject, isArray } from 'mout/lang';
import $ from 'jquery';

let _UNDEFINED;

/**
 * Base View Class
 * @class lavaca.mvc.View
 * @extends lavaca.events.EventDispatcher
 *
 * @constructor
 * @param {Object | String} el the selector or Object for the element to attach to the view
 * @param {Object} [model] the model for the view
 * @param {Object} [parentView] the parent view for the view
 *
 * @constructor
 * @param {Object | String} el the selector or Object for the element to attach to the view
 * @param {Object} [model] the model for the view
 * @param {Object} [layer] The layer on which the view sits (only applicable to views used as a PageView)
 *
 *
 */
var View = EventDispatcher.extend(function View(el, model, parentView) {
  EventDispatcher.call(this);

  /**
   * The model used by the view
   * @property model
   * @default null
   * @optional
   * @type lavaca.mvc.Model
   *
   */
  this.model = model || null;

  /**
   * An id is applied to a data property on the views container
   * @property id
   * @default generated from className and unique identifier
   * @type String
   *
   */
  this.id = (this.className + '-' + uuid()).replace(' ', '-');

  if (typeof parentView !== 'number') {
    /**
     * If the view is created in the context of a childView, the parent view is assigned to this view
     * @property parentView
    * @default null
     * @type Object
     *
     */
    this.parentView = parentView || null;

  } else {
    this.layer = parentView;
  }

  /**
   * The element that is either assigned to the view if in the context of a childView, or is created for the View
   * if it is a PageView
   * @property el
   * @default null
   * @type Object | String
   *
   */
  if (isString(el)) {
    this.el = $(el);
  }
  else if (el && el.length) {
    this.el = el;
  }
  else {
    this.el = $('<div></div>');
  }
  this.el.addClass('view');
  this.el.addClass(this.className);
  this.el.data('view', this);
  this.el.attr('data-view-id', this.id);


  /**
   * A dictionary of selectors and event types in the form
   * {eventType: {delegate: 'xyz', callback: func}}@property el
   * @property eventMap
   * @default {}
   * @type Object
   */
  this.eventMap = {};

  /**
   * An array of selectors and events in the form of
   * {delegate:delegate, event:event, callback: callback}
   * @property extEventMap
   * @default []]
   * @type Array
   */
  this.extEventMap = [];

  /**
   * A dictionary of selectors, View types and models in the form
   *   {selector: {TView: TView, model: model}}}
   * @property {Object} childViewMap
   * @default {}
   * @type Object
   *
   */
  this.childViewMap = {};
  /**
   * Interactive elements used by the view
   * @property childViews
   * @default {}
   * @type Object
   */
  this.childViews = {};
  /**
   * A dictionary of selectors and widget types in the form
   *   {selector: widgetType}
   * @property {Object} widgetMap
   * @default {}
   * @type Object
   */
  this.widgetMap = {};
  /**
   * Interactive elements used by the view
   * @property widgets
   * @default {}
   * @type Object
   */
  this.widgets = {};
  /**
   *  A map of all the events to be applied to child Views in the form of
   *  {type: {TView: TView, callback : callback}}
   * @property childViewEventMap
   * @default Object
   * @type Object
   */
  this.childViewEventMap = {};

  this
    .on('rendersuccess', this.onRenderSuccess.bind(this))
    .on('rendererror', this.onRenderError.bind(this));
}, {
  /**
   * Will render any childViews automatically when set to true
   * @property autoRender
   * @default true
   *
   * @type Boolean
   */
  autoRender: true,
  /**
   * The name of the template associated with the view
   * @property {String} template
   * @default null
   *
   */
  template: null,
  /**
   * A class name added to the view container
   * @property String className
   * @default null
   *
   */
  className: null,


  /**
   * The index of the layer on which the view sits
   * @property {Number} layer
   * @default 0
   */
  layer: 0,

  /**
   * Type of view, ex PageView, View
   * @property String viewType
   * @default null
   */
  viewType: null,

  /**
   * Reference to the ChildViewManager if one is mapped
   * @property {Lavaca.mvc.childViewManager} childViewManager
   * @default false
   */
  childViewManager: false,

  /**
   * Generate the HTML to be used in render() and redraw() methods. Override
   * from subclasses. Specified here rather than having subclasses override
   * render() directly in order for subclasses to get selector-specific
   * rendering (in redraw()) for "free".
   *
   * @param {Object} model  The data model, guaranteed to be a plain object
   * @return {String|lavaca.util.Promise} The html to be rendered
   */
  generateHtml(model) {
    return '';
  },

  _parseRenderArguments() {
    var args = Array.prototype.slice.call(arguments);
    var ret = {
      selector: null,
      model: null,
      shouldRedraw: null
    };

    if (args.length === 0) {
      ret.selector = null;
      ret.model = this.model;
      ret.shouldRedraw = true;
    }
    else if (args.length === 1) {
      if (isString(args[0])) {
        ret.selector = args[0];
        ret.model = this.model;
        ret.shouldRedraw = false;
      }
      else if (isObject(args[0]) || args[0] instanceof Model) {
        ret.selector = null;
        ret.model = args[0];
        ret.shouldRedraw = true;
      }
      else if (isBoolean(args[0])) {
        ret.selector = null;
        ret.model = this.model;
        ret.shouldRedraw = args[0];
      }
    }
    else if (args.length === 2) {
      if (isString(args[0])) {
        ret.selector = args[0];
        ret.model = args[1];
        ret.shouldRedraw = false;
      }
      else if (isBoolean(args[0])) {
        ret.selector = null;
        ret.shouldRedraw = args[0];
        ret.model = args[1];
      }
    }

    return ret;
  },

  /**
   * Renders the view's template and replaces the DOM nodes that match the
   * selector argument. If no selector argument is provided, the whole view
   * will be rendered. If the first parameter is passed as <code>false</code>
   * the resulting html will pe passed with the promise and nothing will be
   * replaced.  Note: the number of elements that match the provided selector
   * must be identical in the current markup and in the newly rendered markup
   * or else the returned promise will be rejected.
   * @method redraw
   * @return {lavaca.util.Promise} A promise
   */
  /**
   * Renders the view's template using the specified model and redraws the
   * entire view
   * @method redraw
   * @param {Object} model  The data model to be passed to the template
   * @return {lavaca.util.Promise} A promise
   */
  /**
   * Renders the view's template using the view's model and only redraws the
   * elements that match the specified selector string.
   * Note: The numbers of items that match the selector must
   * be exactly the same in the view's current markup and in the newly rendered
   * markup. If that is not the case, the returned promise will be rejected and
   * nothing will be redrawn.
   * @method redraw
   * @param {String} selector  Selector string that defines elements to redraw
   * @return {lavaca.util.Promise} A promise
   */
  /**
   * Renders the view's template using the specified model and only redraws the
   * elements that match the specified selector string.
   * Note: The numbers of items that match the selector must
   * be exactly the same in the view's current markup and in the newly rendered
   * markup. If that is not the case, the returned promise will be rejected and
   * nothing will be redrawn.
   * @method redraw
   * @param {String} selector  Selector string that defines elements that will be updated
   * @param {Object} model  The data model to be passed to the template
   * @return {lavaca.util.Promise} A promise
   */
  /**
   * Renders the view's template using the view's model. If shouldRedraw is true,
   * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
   * but the returned promise will be resolved with the newly rendered content. This allows
   * the caller to attach a success handler to the returned promise and define their own
   * redrawing behavior.
   * @method redraw
   * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
   * @return {lavaca.util.Promise}  A promise
   */
  /**
   * Renders the view's template using the specified model. If shouldRedraw is true,
   * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
   * but the returned promise will be resolved with the newly rendered content. This allows
   * the caller to attach a success handler to the returned promise and define their own
   * redrawing behavior.
   * @method redraw
   * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
   * @param {Object} model  The data model to be passed to the template
   * @return {lavaca.util.Promise}  A promise
   */
  render() {
    var opts = this._parseRenderArguments.apply(this, arguments);

    var isFirstRender = !this.hasRendered;
    if (isFirstRender) {
      this.applyEvents();
    }

    var promise = Promise.resolve(this.generateHtml(opts.model))
      .then((html) => {
        if (isFirstRender || opts.shouldRedraw) {
          this.disposeChildViews(this.el);
          this.disposeWidgets(this.el);
          this.el.html(html);
          this.hasRendered = true;
        }
        else if (opts.selector) {
          var $newEl = $('<div>' + html + '</div>').find(opts.selector),
              $oldEl = this.el.find(opts.selector);
          if ($newEl.length === $oldEl.length) {
            $oldEl.each((index, el) => {
              var $el = $(el);
              this.disposeChildViews($el);
              this.disposeWidgets($el);
              $el.replaceWith($newEl.eq(index)).remove();
            });
          } else {
            throw 'Count of items matching selector is not the same in the original html and in the newly rendered html.';
          }
        }

        this.createWidgets();
        this.createChildViews();
        this.applyChildViewEvents();
        this.childViewManager && this.childViewManager.init(this.el);
        return html;
      });

    promise.then(
      () => {
        if (isFirstRender) {
          this.trigger('rendersuccess');
        }
        else {
          this.trigger('redrawsuccess');
        }
      },
      (err) => {
        console.error('There was a problem rendering your view');
        console.error(err);
        this.trigger('rendererror', {err: err});
        throw err;
      }
    );

    return promise;
  },

  /**
   * Dispose old widgets and child views
   * @method disposeChildViews
   * @param  {Object} $el the $el to search for child views and widgets in
   */
  disposeChildViews: function($el) {
    var childViewSearch,
      self = this;

    // Remove child views
    childViewSearch = $el.find('[data-view-id]');
    if ($el !== self.el && $el.is('[data-view-id]')) {
      childViewSearch = childViewSearch.add($el);
    }
    childViewSearch.each((index, item) => {
      var $item = $(item),
        childView = $item.data('view');
      if (childView) {
        delete self.childViews[childView.id];
        childView.dispose();
      }
    });
  },

  /**
   * Dispose old widgets and child views
   * @method disposeWidgets
   * @param  {Object} $el the $el to search for child views and widgets in
   */
  disposeWidgets($el) {
    var self = this;

    // Remove widgets
    $el.add($el.find('[data-has-widgets]')).each((index, item) => {
      var $item = $(item),
        widgets = $item.data('widgets'),
        selector, widget;
      for (selector in widgets) {
        widget = widgets[selector];
        delete self.widgets[widget.id];
        widget.dispose();
      }
    });
    $el.removeData('widgets');
  },
  /**
   * Unbinds events from the model
   * @method clearModelEvents
   *
   */
  clearModelEvents() {
    var callback,
      dotIndex;
    if (this.eventMap
      && this.eventMap.model
      && this.model
      && this.model instanceof EventDispatcher) {
      for (let event in this.eventMap.model) {
        callback = this.eventMap.model[event];
        if (typeof callback === 'object') {
          callback = callback.on;
        }
        dotIndex = event.indexOf('.');
        if (dotIndex !== -1) {
          event = event.substr(0, dotIndex);
        }
        this.model.$off(event + '.' + this.id, callback, this);
      }
    }
  },

  /**
   * Unbinds all extEvents
   * @method clearExtEvents
   *
   */
  clearExtEvents() {
    this.extEventMap.forEach(function(o,i){
      o.delegate.off(o.event,o.callback);
    });
    this.extEventMap = [];
  },

  /**
   * Binds events to the view
   * @method applyEvents
   *
   */
  applyEvents() {
    var el = this.el,
        callbacks,
        callback,
        property,
        delegate,
        dotIndex,
        opts;
    for (delegate in this.eventMap) {
      callbacks = this.eventMap[delegate];
      if (delegate === 'self') {
        delegate = null;
      }
      for (let callbackType in callbacks) {
        callback = callbacks[callbackType];
        property = _UNDEFINED;
        if (typeof callback === 'object') {
          opts = callback;
          callback = callback.on;
        } else {
          opts = undefined;
        }

        if (isString(callback) && callback in this) {
          callback = this[callback].bind(this);
        }
        else {
          callback = callback.bind(this);
        }

        if (delegate === 'model') {
          if (this.model && this.model instanceof Model) {
            dotIndex = callbackType.indexOf('.');
            if (dotIndex !== -1) {
              property = callbackType.substr(dotIndex+1);
              callbackType = callbackType.substr(0, dotIndex);
            }
            this.model.$on(callbackType + '.' + this.id, property, callback);
          }
        } else if (callbackType === 'animationEnd' && el.animationEnd) {
          el.animationEnd(delegate, callback);
        } else if (callbackType === 'transitionEnd' && el.transitionEnd) {
          el.transitionEnd(delegate, callback);
        } else {
          if (el.hammer) {
            el.hammer({domEvents:true}).on(callbackType, delegate, callback);
          } else {
            el.on(callbackType, delegate, callback);
          }
        }
      }
    }
  },
  /**
   * Maps multiple delegated events for the view
   * @method mapEvent
   *
   * @param {Object} map  A hash of the delegates, event types, and handlers
   *     that will be bound when the view is rendered. The map should be in
   *     the form <code>{delegate: {eventType: callback}}</code>. For example,
   *     <code>{'.button': {click: onClickButton}}</code>. The events defined in
   *     [[Lavaca.fx.Animation]] and [[Lavaca.fx.Transition]] are also supported.
   *     To map an event to the view's el, use 'self' as the delegate. To map
   *     events to the view's model, use 'model' as the delegate. To limit events
   *     to only a particular property on the model, use a period-seperated
   *     syntax such as <code>{model: {'change.myproperty': myCallback}}</code>
   * @return {lavaca.mvc.View}  This view (for chaining)
   */
  /**
   * Maps an event for the view
   * @method mapEvent
   * @param {String} delegate  The element to which to delegate the event
   * @param {String} eventType  The type of event
   * @param {Function} callback  The event handler
   * @return {lavaca.mvc.View}  This view (for chaining)
   */
  mapEvent(delegate, eventType, callback) {
    var o;
    if (typeof delegate === 'object') {
      o = delegate;
      for (delegate in o) {
        for (eventType in o[delegate]) {
          if(delegate === 'ext'){
            this.mapExtEvent(o[delegate][eventType].object,o[delegate][eventType].events);
          }
          else{
            this.mapEvent(delegate, eventType, o[delegate][eventType]);
          }
        }
      }
    } else {
      o = this.eventMap[delegate];
      if (!o) {
        o = this.eventMap[delegate] = {};
      }
      o[eventType] = callback;
    }
    return this;
  },
  /**
   * Called from mapEvent to map an event to external objects that extend from EventDispatcher
   * @method mapExtEvent
   * Maps an event for the view
   * @method mapEvent
   * @param {Object} delegate The object/model to which to delegate the event
   * @param {Object} events  An object of the callback events
   */
  mapExtEvent(delegate, events) {
    var callback;
    if(delegate && delegate instanceof (EventDispatcher)){
      for(let event in events){
        callback = events[event];
        delegate.on(event,callback);
        this.extEventMap.push({delegate:delegate,event:event,callback:callback});
      }
    }
    else{
      console.warn('You are trying to call mapExtEvent with something that does not extend from EventDispatcher.');
    }
  },
  /**
   * Initializes widgets on the view
   * @method createWidgets
   *
   */
  createWidgets() {
    var cache = this.widgets,
      n,
      o,
      TWidget,
      makeWidget,
      args;
    for (n in this.widgetMap) {
      o = this.widgetMap[n];
      if (typeof o === 'object') {
        TWidget = o.TWidget;
        args = o.args
          ? isArray(o.args) ? o.args : [o.args]
          : null;
      } else {
        TWidget = o;
        args = null;
      }
      makeWidget = args ? (el) => new (TWidget.bind.apply(TWidget, [null, el].concat(args)))() : (el) => new TWidget(el);
      (n === 'self' ? this.el : this.el.find(n))
        .each((index, item) => {
          var $el = $(item),
            widgetMap = $el.data('widgets') || {},
            widget;
          if (!widgetMap[n]) {
            widget = makeWidget($(item));
            widgetMap[n] = widget;
            cache[widget.id] = widget;
            $el.data('widgets', widgetMap);
            $el.attr('data-has-widgets','');
          }
        });
    }
  },
  /**
   * Assigns multiple widget types to elements on the view
   * @method mapWidget
   * @param {Object} map  A hash of selectors to bind widgets to when the view is rendered.
   *     The map should be in the form {selector: [[Lavaca.ui.Widget]]} or
   *     {selector: {TWidget: [[Lavaca.ui.Widget]], args: [optional arguments to pass to widget constructor]}}.
   *     For example, {'form': Lavaca.ui.Form} or {'form': {TWidget: Lavaca.ui.Form, args: [...]}}
   * @return {Lavaca.mvc.View}  This view (for chaining)
   *
   */
  /**
   * Assigns a widget type to be created for elements matching a selector when the view is rendered
   * @method mapWidget
   * @param {String} selector  The selector for the root element of the widget
   * @param {Function} TWidget  The [[Lavaca.ui.Widget]]-derived type of widget to create
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  /**
   * Assigns a widget type to be created for elements matching a selector when the view is rendered, and
   * accepts optional arguments to pass to the widget constructor
   * @method mapWidget
   * @param {String} selector  The selector for the root element of the widget
   * @param {Object} widgetOptions  An object with a 'TWidget' key and an optional 'args' key which can be
   *     an array of arguments to pass to the widget's constructor
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  mapWidget(selector, TWidget) {
    if (typeof selector === 'object') {
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
   * Initializes child views on the view, called from onRenderSuccess
   * @method createChildViews
   *
   */
  createChildViews() {
    var self = this,
        o;
    for (let n in this.childViewMap) {
      o = this.childViewMap[n];
      this.el.find(n)
        .each((index, item) => {
          var $el = $(item),
              childView,
              model;
          if (!$el.data('view')) {
            if (typeof o.model === 'function') {
              model = o.model.call(self, index, item);
            } else {
              model = o.model || self.model;
            }
            childView = new o.TView($el, model, self);
            self.childViews[childView.id] = childView;
            if (childView.autoRender) {
              childView.render();
            }
          }
        });
    }
  },
  /*
   * Assigns a View type to be created for elements matching a selector when the view is rendered
   * @method mapChildView
   * @param {String} selector  The selector for the root element of the View
   * @param {Function} TView  The [[Lavaca.mvc.View]]-derived type of view to create
   * @param {Lavaca.mvc.Model} model  The model instance to use for the child view(s)
   * @return {Lavaca.mvc.View}  This view (for chaining)
  */
  /*
   * Assigns a View type to be created for elements matching a selector when the view is rendered
   * @method mapChildView
   * @param {String} selector  The selector for the root element of the View
   * @param {Function} TView  The [[Lavaca.mvc.View]]-derived type of view to create
   * @param {Function} model  A function which will be called once for every matching element and should return a [[Lavaca.mvc.Model]]-derived model instance
   *     to use for the child view. The function has the signature function(index, el)
   * @return {Lavaca.mvc.View}  This view (for chaining)
   */
  /**
   * Assigns multiple Views to elements on the view
   * @method mapChildView
   * @param {Object} map  A hash of selectors to view types and models to be bound when the view is rendered.
   *     The map should be in the form {selector: {TView : TView, model : lavaca.mvc.Model}}. For example, {'form': {TView : ExampleView, model : new Model()}}
   * @return {lavaca.mvc.View}  This view (for chaining)
   *
  */
  mapChildView(selector, TView, model) {
    if (typeof selector === 'object') {
      var childViewTypes = selector;
      for (selector in childViewTypes) {
        this.mapChildView(selector, childViewTypes[selector].TView, childViewTypes[selector].model);
      }
    } else {
      this.childViewMap[selector] = { TView: TView, model: model };
    }
    return this;
  },

  /**
   * Instantiates a ChildViewManager for handling transitions between various childviews
   * @method mapChildViewManager
   * @param {String} el  The element selector for the child views to be rendred in
   * @param {Object} map  An object containing all of the routes and view types to be rendered
   *     The map should be in the form {selector: {TView : TView, model : lavaca.mvc.Model, step: Int}}. For example, {'form': {TView : ExampleView, model : new Model(), step: 1}}
   *
  */
  mapChildViewManager(el, map, mixin, fillin) {
    this.childViewManager = new ChildViewManager(el, map, this, 'cvm-'+this.id);
    if (typeof mixin === 'object') {
      this.childViewManager.childViewMixin = mixin;
    }
    if (typeof fillin === 'object') {
      this.childViewManager.childViewFillin = fillin;
    }
  },

  /**
   * Listen for events triggered from child views.
   * @method mapChildViewEvent
   *
   * @param {String} type The type of event to listen for
   * @param {Function} callback The method to execute when this event type has occured
   * @param {Lavaca.mvc.View} TView (Optional) Only listen on child views of this type
   */
  /**
   * Maps multiple child event types
   * @method mapChildViewEvent
   *
   * @param {Object} map A hash of event types with callbacks and TView's associated with that type
   *  The map should be in the form {type : {callback : {Function}, TView : TView}}
   */
  mapChildViewEvent(type, callback, TView) {
    if (typeof type === 'object'){
      var eventTypes = type;
      for (t in eventTypes){
        //add in view type to limit events created
        this.mapChildViewEvent(t, eventTypes[t].callback, eventTypes[t].TView);
      }
    } else {
      this.childViewEventMap[t] = {
        TView: TView,
        callback: callback
      };
    }
  },

  /**
   * Called from onRenderSuccess of the view, adds listeners to all childviews if present
   * @method applyChildViewEvent
   *
   */
  applyChildViewEvents() {
    var childViewEventMap = this.childViewEventMap,
      type;
    for (let ev in childViewEventMap) {
      forOwn(this.childViews, (item) => {
        var callbacks,
          callback,
          i = -1;

        if (!childViewEventMap[ev].TView || item instanceof childViewEventMap[ev].TView) {
          callbacks = item.callbacks[ev] || [];
          while (!!(callback = callbacks[++i])) {
            if (callback === childViewEventMap[ev].callback) {
              return;
            }
          }
          item.on(type, childViewEventMap[ev].callback);
        }
      });
    }
  },
  /**
   * Executes when the template renders successfully
   * @method onRenderSuccess
   *
   * @param {Event} e  The render event. This object should have a string property named "html"
   *   that contains the template's rendered HTML output.
   */
  onRenderSuccess(e){},
  /**
   * Executes when the template fails to render
   * @method onRenderError
   *
   * @param {Event} e  The error event. This object should have a string property named "err"
   *   that contains the error message.
   */
  onRenderError(e) {
    console.log(e.err)
  },
  /**
   * Readies the view for garbage collection
   * @method dispose
   */
  dispose() {
    if (this.model) {
      this.clearModelEvents();
    }
    if (size(this.childViews)) {
      this.disposeChildViews(this.el);
    }
    if (size(this.widgets)) {
      this.disposeWidgets(this.el);
    }
    if(this.extEventMap.length){
      this.clearExtEvents();
    }

    // Do not dispose of template or model
    this.template
      = this.model
      = this.parentView
      = null;

    EventDispatcher.prototype.dispose.apply(this, arguments);
  },


  /**
   * Adds this view to a container
   * @method insertInto
   * @param {jQuery} container  The containing element
   */
  insertInto(container) {
    if (this.el.parent()[0] !== container[0]) {
      var layers = container.children('[data-layer-index]'),
        i = -1,
        layer;
      while (!!(layer = layers[++i])) {
        layer = $(layer);
        if (layer.attr('data-layer-index') > this.index) {
          this.el.insertBefore(layer);
          return;
        }
      }
      container.append(this.el);
    }
  },

  /**
   * Executes when the user navigates to this view
   * @method enter
   * @param {jQuery} container  The parent element of all views
   * @param {Array} exitingViews  The views that are exiting as this one enters
   * @return {lavaca.util.Promise}  A promise
   */
  enter(container) {
    var renderPromise;
    if (!this.hasRendered) {
      renderPromise = this.render();
    }
    return Promise.resolve()
      .then(renderPromise)
      .then(function() {
        return this.insertInto( $(container) );
      }.bind(this))
      .then(function() {
        this.trigger('enter');
      }.bind(this)).catch(err=>console.error(err));
  },
  /**
   * Executes when the user navigates away from this view
   * @method exit
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} enteringViews  The views that are entering as this one exits
   * @return {lavaca.util.Promise}  A promise
   */
  exit() {
    this.el.detach();
    this.trigger('exit');
    return Promise.resolve();
  },
  /**
   * Retrieves an array of widgets that match a selector
   * @method getWidget
   * @param {String} selector  The selector that should match the widgets you wish to retrieve
   * @return {Array}  An array of widgets
   */
  getWidgets(selector) {
    var items = [];
    forOwn(this.widgets, (item) => {
      if (item.el.is(selector)) {
        items.push(item);
      }
    });
    return items;
  },
  /**
   * Retrieves an array of childViews that match a selector
   * @method getChildViews
   * @param {String} selector  The selector that should match the childViews you wish to retrieve
   * @return {Array}  An array of childViews
   */
  getChildViews(selector) {
    var items = [];
    forOwn(this.childViews, (item) => {
      if (item.el.is(selector)) {
        items.push(item);
      }
    });
    return items;
  }
});

export default View;
