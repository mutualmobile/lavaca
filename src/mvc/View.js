define(function(require) {

  var $ = require('$'),
    EventDispatcher = require('lavaca/events/EventDispatcher'),
    Model = require('lavaca/mvc/Model'),
    Template = require('lavaca/ui/Template'),
    Cache = require('lavaca/util/Cache'),
    Promise = require('lavaca/util/Promise'),
    ArrayUtils = require('lavaca/util/ArrayUtils'),
    log = require('lavaca/util/log'),
    uuid = require('lavaca/util/uuid'),
    delay = require('lavaca/util/delay');

  var _UNDEFINED;

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
  var View = EventDispatcher.extend(function(el, model, parentView) {
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
     * The element containing the view
     * @property {jQuery} shell
     * @default null
     */
    this.shell = null;


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
    this.el = typeof el === 'string' ? $(el) : (el || null);


    /**
     * A dictionary of selectors and event types in the form
     * {eventType: {delegate: 'xyz', callback: func}}@property el
     * @property eventMap
     * @default {}
     * @type Object
     */
    this.eventMap = {};
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
     * @default lavaca.util.cache
     * @type lavaca.util.Cache
     */
    this.childViews = new Cache();
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
     * @default lavaca.util.Cache
     * @type lavaca.util.Cache
     */
    this.widgets = new Cache();
    /**
     *  A map of all the events to be applied to child Views in the form of
     *  {type: {TView: TView, callback : callback}}
     * @property childViewEventMap
     * @default Object
     * @type Object
     */
    this.childViewEventMap = {};

    this
      .on('rendersuccess', this.onRenderSuccess)
      .on('rendererror', this.onRenderError);
  }, {
    /**
     * Will render any childViews automatically when set to true
     * @property autoRender
     * @default false
     *
     * @type Boolean
     */
    autoRender: false,
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

    bindRenderEvents: function(renderPromise) {
      var promise = new Promise(this);
      /*
       * Fires when html from template has rendered
       * @event rendersuccess
       */
      promise
        .success(function(html) {
          this.trigger('rendersuccess', {html: html});
          renderPromise.resolve();
        })
      /**
       * Fired when there was an error during rendering process
       * @event rendererror
       */
        .error(function(err) {
          this.trigger('rendererror', {err: err});
          renderPromise.reject();
        });

      return promise;
    },

    renderTemplate: function(template, promise, model) {
      return template
        .render(model)
        .success(promise.resolver())
        .error(promise.rejector());
    },

    getRenderModel: function() {
      var model = this.model;
      return model instanceof Model ? model.toObject() : model;
    },
    /**
     * Renders the view using its template and model
     * @method render
     *
     * @return {lavaca.util.Promise} A promise
     */
    render: function() {
      var self = this,
          renderPromise = new Promise(this),
          promise = this.bindRenderEvents(renderPromise),
          template = Template.get(this.template),
          model = this.getRenderModel();

      this.renderTemplate(template, promise, model)
        .then(function() {
          if (self.className){
            self.el.addClass(self.className);
          }
        });

      return renderPromise;

    },
    /**
     * Renders the view using its template and model
     * @method renderPageView
     *
     * @return {lavaca.util.Promise} A promise
     */
    renderPageView: function() {
      var renderPromise = new Promise(this),
          promise = this.bindRenderEvents(renderPromise),
          template = Template.get(this.template),
          model = this.getRenderModel();

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

      this.renderTemplate(template, promise, model);

      return renderPromise;

    },

    /**
     * Re-renders the view's template and replaces the DOM nodes that match
     * the selector argument. If no selector argument is provided, the whole view
     * will be re-rendered. If the first parameter is passed as <code>false</code>
     * the resulting html will pe passed with the promise and nothing will be replaced.
     * Note: the number of elements that match the provided selector must be identical
     * in the current markup and in the newly rendered markup or else the returned
     * promise will be rejected.
     * Re-renders the view's template using the view's model
     * and redraws the entire view
     * @method redraw
     *
     * @return {lavaca.util.Promise} A promise
     */
    /**
     * Re-renders the view's template using the specified model
     * and redraws the entire view
     * @method redraw
     * @param {Object} model  The data model to be passed to the template
     * @return {lavaca.util.Promise} A promise
     */
    /**
     * Re-renders the view's template using the view's model and only redraws the
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
     * Re-renders the view's template using the specified model and only redraws the
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
     * Re-renders the view's template using the view's model. If shouldRedraw is true,
     * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
     * but the returned promise will be resolved with the newly rendered content. This allows
     * the caller to attach a success handler to the returned promise and define their own
     * redrawing behavior.
     * @method redraw
     * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
     * @return {lavaca.util.Promise}  A promise
     */
    /**
     * Re-renders the view's template using the specified model. If shouldRedraw is true,
     * the entire view will be redrawn. If shouldRedraw is false, nothing will be redrawn,
     * but the returned promise will be resolved with the newly rendered content. This allows
     * the caller to attach a success handler to the returned promise and define their own
     * redrawing behavior.
     * @method redraw
     * @param {Boolean} shouldRedraw  Whether the view should be automatically redrawn.
     * @param {Object} model  The data model to be passed to the template
     * @return {lavaca.util.Promise}  A promise
     */
    redraw: function(selector, model) {
      var self = this,
        templateRenderPromise = new Promise(this),
        redrawPromise = new Promise(this),
        template = Template.get(this.template),
        replaceAll;
      if (!template) {
        return redrawPromise.reject();
      }
      if (typeof selector === 'object' || selector instanceof Model) {
        model = selector;
        replaceAll = true;
        selector = null;
      }
      else if (typeof selector === 'boolean') {
        replaceAll = selector;
        selector = null;
      } else if (!selector) {
        replaceAll = true;
      }
      model = model || this.model;
      if (model instanceof Model) {
        model = model.toObject();
      }

      // process widget, child view, and
      // child view event maps
      function processMaps() {
        self.createWidgets();
        self.createChildViews();
        self.applyChildViewEvents();
        self.trigger('redrawsuccess');
      }
      templateRenderPromise
        .success(function(html) {
          if (replaceAll) {
            this.disposeChildViews(this.el);
            this.disposeWidgets(this.el);
            this.el.html(html);
            processMaps();
            redrawPromise.resolve(html);
            return;
          }
          if(selector) {
            var $newEl = $('<div>' + html + '</div>').find(selector),
              $oldEl = this.el.find(selector);
            if($newEl.length === $oldEl.length) {
              $oldEl.each(function(index) {
                var $el = $(this);
                self.disposeChildViews($el);
                self.disposeWidgets($el);
                $el.replaceWith($newEl.eq(index)).remove();
              });
              processMaps();
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
     * Dispose old widgets and child views
     * @method disposeChildViews
     * @param  {Object} $el the $el to search for child views and widgets in
     */
    disposeChildViews: function ($el) {
      var childViewSearch,
        self = this;

      // Remove child views
      childViewSearch = $el.find('[data-view-id]');
      if ($el !== self.el && $el.is('[data-view-id]')) {
        childViewSearch = childViewSearch.add($el);
      }
      childViewSearch.each(function(index, item) {
        var $item = $(item),
          childView = $item.data('view');
        if (childView) {
          self.childViews.remove(childView.id);
          childView.dispose();
        }
      });
    },
    /**
     * Dispose old widgets and child views
     * @method disposeWidgets
     * @param  {Object} $el the $el to search for child views and widgets in
     */
    disposeWidgets: function ($el) {
      var self = this;

      // Remove widgets
      $el.add($el.find('[data-has-widgets]')).each(function(index, item) {
        var $item = $(item),
          widgets = $item.data('widgets'),
          selector, widget;
        for (selector in widgets) {
          widget = widgets[selector];
          self.widgets.remove(widget.id);
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
    clearModelEvents: function() {
      var type,
        callback,
        dotIndex;
      if (this.eventMap
        && this.eventMap.model
        && this.model
        && this.model instanceof EventDispatcher) {
        for (type in this.eventMap.model) {
          callback = this.eventMap.model[type];
          if (typeof callback === 'object') {
            callback = callback.on;
          }
          dotIndex = type.indexOf('.');
          if (dotIndex !== -1) {
            type = type.substr(0, dotIndex);
          }
          this.model.off(type, callback);
        }
      }
    },
    /**
     * Checks for strings in the event map to bind events to this automatically
     * @method bindMappedEvents
     */
    bindMappedEvents: function() {
      var callbacks,
        delegate,
        type;
      for (delegate in this.eventMap) {
        callbacks = this.eventMap[delegate];
        for (type in callbacks) {
          if (typeof this.eventMap[delegate][type] === 'string'){
            this.eventMap[delegate][type] = this[this.eventMap[delegate][type]].bind(this);
          }
        }
      }
    },
    /**
     * Binds events to the view
     * @method applyEvents
     *
     */
    applyEvents: function() {
      var el = this.el,
        callbacks,
        callback,
        property,
        delegate,
        type,
        dotIndex,
        opts;
      for (delegate in this.eventMap) {
        callbacks = this.eventMap[delegate];
        if (delegate === 'self') {
          delegate = null;
        }
        for (type in callbacks) {
          callback = callbacks[type];
          property = _UNDEFINED;
          if (typeof callback === 'object') {
            opts = callback;
            callback = callback.on;
          } else {
            opts = undefined;
          }
          if (typeof callback === 'string') {
            if (callback in this) {
              callback = this[callback].bind(this);
            }
          }
          if (delegate === 'model') {
            if (this.model && this.model instanceof Model) {
              dotIndex = type.indexOf('.');
              if (dotIndex !== -1) {
                property = type.substr(dotIndex+1);
                type = type.substr(0, dotIndex);
              }
              this.model.on(type, property, callback);
            }
          } else if (type === 'animationEnd' && el.animationEnd) {
            el.animationEnd(delegate, callback);
          } else if (type === 'transitionEnd' && el.transitionEnd) {
            el.transitionEnd(delegate, callback);
          } else {
            if (el.hammer) {
              el.hammer().on(type, delegate, callback);
            } else {
              el.on(type, delegate, callback);
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
     * @param {String} type  The type of event
     * @param {Function} callback  The event handler
     * @return {lavaca.mvc.View}  This view (for chaining)
     */
    mapEvent: function(delegate, type, callback) {
      var o;
      if (typeof delegate === 'object') {
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
     * Initializes widgets on the view
     * @method createWidgets
     *
     */
    createWidgets: function() {
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
            ? ArrayUtils.isArray(o.args) ? o.args : [o.args]
            : null;
        } else {
          TWidget = o;
          args = null;
        }
        if (args) {
          makeWidget = function(el) {
            var factoryFunction = TWidget.bind.apply(TWidget, [null, el].concat(args));
            return new factoryFunction();
          };
        } else {
          makeWidget = function(el) {
            return new TWidget(el);
          };
        }
        (n === 'self' ? this.el : this.el.find(n))
          .each(function(index, item) {
            var $el = $(item),
              widgetMap = $el.data('widgets') || {},
              widget;
            if (!widgetMap[n]) {
              widget = makeWidget($(item));
              widgetMap[n] = widget;
              cache.set(widget.id, widget);
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
    mapWidget: function(selector, TWidget) {
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
    createChildViews: function() {
      var cache = this.childViews,
        n,
        self = this,
        o;
      for (n in this.childViewMap) {
        o = this.childViewMap[n];
        this.el.find(n)
          .each(function(index, item) {
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
              cache.set(childView.id, childView);
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
    mapChildView: function(selector, TView, model) {
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
    mapChildViewEvent: function(type, callback, TView) {
      if (typeof type === 'object'){
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
     * Called from onRenderSuccess of the view, adds listeners to all childviews if present
     * @method applyChildViewEvent
     *
     */
    applyChildViewEvents: function() {
      var childViewEventMap = this.childViewEventMap,
        type;
      for (type in childViewEventMap) {
        this.childViews.each(function(key, item) {
          var callbacks,
            callback,
            i = -1;

          if (!childViewEventMap[type].TView || item instanceof childViewEventMap[type].TView) {
            callbacks = item.callbacks[type] || [];
            while (!!(callback = callbacks[++i])) {
              if (callback === childViewEventMap[type].callback) {
                return;
              }
            }
            item.on(type, childViewEventMap[type].callback);
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
    onRenderSuccess: function(e) {
      this.el.html(e.html);
      this.bindMappedEvents();
      this.applyEvents();
      this.createWidgets();
      this.createChildViews();
      this.applyChildViewEvents();
      this.el.data('view', this);
      this.el.attr('data-view-id', this.id);
      this.hasRendered = true;
    },
    /**
     * Executes when the template fails to render
     * @method onRenderError
     *
     * @param {Event} e  The error event. This object should have a string property named "err"
     *   that contains the error message.
     */
    onRenderError: function(e) {
      log(e.err);
    },
    /**
     * Readies the view for garbage collection
     * @method dispose
     */
    dispose: function() {
      if (this.model) {
        this.clearModelEvents();
      }
      if (this.childViews.count()) {
        this.disposeChildViews(this.el);
      }
      if (this.widgets.count()) {
        this.disposeWidgets(this.el);
      }

      // Do not dispose of template or model
      this.template
        = this.model
        = this.parentView
        = null;

      EventDispatcher.prototype.dispose.apply(this, arguments);
    },

    // -------------- PageView methods --------------------

    /**
     * Creates the view's wrapper element
     * @method wrapper
     * @return {jQuery}  The wrapper element
     */
    wrapper: function() {
      return $('<div class="view"></div>');
    },
    /**
     * Creates the view's interior content wrapper element
     * @method interior
     * @return {jQuery} The interior content wrapper element
     */
    interior: function() {
      return $('<div class="view-interior"></div>');
    },


    /**
     * Adds this view to a container
     * @method insertInto
     * @param {jQuery} container  The containing element
     */
    insertInto: function(container) {
      if (this.shell.parent()[0] !== container[0]) {
        var layers = container.children('[data-layer-index]'),
          i = -1,
          layer;
        while (!!(layer = layers[++i])) {
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
     * Executes when the user navigates to this view
     * @method enter
     * @param {jQuery} container  The parent element of all views
     * @param {Array} exitingViews  The views that are exiting as this one enters
     * @return {lavaca.util.Promise}  A promise
     */
    enter: function(container) {
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
        delay(promise.resolver());
      }
      promise.then(function() {
        /**
         * Fired when there was an error during rendering process
         * @event rendererror
         */
        this.trigger('enter');
      });
      return promise;
    },
    /**
     * Executes when the user navigates away from this view
     * @method exit
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} enteringViews  The views that are entering as this one exits
     * @return {lavaca.util.Promise}  A promise
     */
    exit: function() {
      var promise = new Promise(this);
      this.shell.detach();
      delay(promise.resolver());
      promise.then(function() {
        /**
         * Fired when there was an error during rendering process
         * @event rendererror
         */
        this.trigger('exit');
      });
      return promise;
    }
  });

  return View;

});
