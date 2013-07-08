define(function(require) {

  var $ = require('$'),
      Model = require('lavaca/mvc/Model'),
      View = require('lavaca/mvc/View'),
      Template = require('lavaca/ui/Template'),
      Promise = require('lavaca/util/Promise'),
      delay = require('lavaca/util/delay');

  /**
   * Page View type, represents an entire screen
   * @class lavaca.mvc.PageView
   * @extends lavaca.mvc.View
   *
   * @constructor
   * @param {Object} el  The element that the PageView is bound to
   * @param {Object} model  The model used by the view
   * @param {Number} [layer]  The index of the layer on which the view sits
   *
   */
  var PageView = View.extend(function(el, model, layer) {

    View.call(this, el, model);
    /**
     * The index of the layer on which the view sits
     * @property {Number} layer
     * @default 0
     */
    this.layer = layer || 0;


  }, {

    /**
     * The element containing the view
     * @property {jQuery} shell
     * @default null
     */
    shell: null,

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
     * Renders the view using its template and model, overrides the View class render method
     * @method render
     *
     * @return {Lavaca.util.Promise}  A promise
     */
    render: function() {
      var promise = new Promise(this),
          renderPromise = new Promise(this),
          template = Template.get(this.template),
          model = this.model;
      if (model instanceof Model) {
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
          /**
           * Fires when html from template has rendered
           * @event rendersuccess
           */
          this.trigger('rendersuccess', {html: html});
          renderPromise.resolve();
        })
        .error(function(err) {
          /**
           * Fired when there was an error during rendering process
           * @event rendererror
           */
          this.trigger('rendererror', {err: err});
          renderPromise.reject();
        });
      template
        .render(model)
        .success(promise.resolver())
        .error(promise.rejector());

      return renderPromise;
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

  return PageView;

});
