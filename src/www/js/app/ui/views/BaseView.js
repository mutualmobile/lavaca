define(function(require) {

  var Detection = require('lavaca/env/Detection'),
      PageView = require('lavaca/mvc/PageView'),
      Promise = require('lavaca/util/Promise'),
      viewManager = require('lavaca/mvc/ViewManager');
  require('lavaca/fx/Animation'); //jquery plugins
  var UNDEFINED;

  /**
   * @class app.ui.views.BaseView
   * @super Lavaca.mvc.View
   *
   * A View from which all other application Views can extend.
   * Adds support for animating between views.
   */
  var BaseView = PageView.extend(function() {
    PageView.apply(this, arguments);
  }, {
    /**
     * @field {Number} column
     * @default 0
     * The horizontal column in which the view should live
     */
    column: 0,
    /**
     * @field {String} template
     * @default 'default'
     * The name of the template used by the view
     */
    template: 'default',
    /**
     * @field {String} animation
     * @default 'slide'
     * The name of the animation used by the view
     */
    animation: 'slide',
    /**
     * @method onRenderSuccess
     * Executes when the template renders successfully. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {Event} e  The render event. This object should have a string property named "html"
     *   that contains the template's rendered HTML output.
     */
    onRenderSuccess: function() {
      PageView.prototype.onRenderSuccess.apply(this, arguments);
      if (Detection.animationEnabled) {
        this.shell.addClass(this.animation);
      }
    },
    /**
     * @method onTapCancel
     * Handler for when a cancel control is tapped
     *
     * @param {Event} e  The tap event.
     */
    onTapCancel: function(e) {
      e.preventDefault();
      viewManager.dismiss(e.currentTarget);
    },
    /**
     * @method enter
     * Executes when the user navigates to this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} exitingViews  The views that are exiting as this one enters
     * @return {Lavaca.util.Promise} A promise
     */
    enter: function(container, exitingViews) {
      return PageView.prototype.enter.apply(this, arguments)
        .then(function() {
          if (Detection.animationEnabled && (this.layer > 0 || exitingViews.length > 0)) {
            this.shell.removeClass('reverse');
            if (exitingViews.length || container[0].childNodes.length) {
              if (this.column !== UNDEFINED) {
                var i = -1,
                    exitingView;
                while (!!(exitingView = exitingViews[++i])) {
                  if (exitingView.layer === this.layer
                      && exitingView.column !== UNDEFINED
                      && exitingView.column > this.column) {
                    this.shell.addClass('reverse');
                    exitingView.shell.addClass('reverse');
                  }
                }
              }
              var self = this;
              this.shell
                .nextAnimationEnd(function() {
                  self.trigger('entercomplete');
                })
                .removeClass('out')
                .addClass('in');
            }
          } else {
            this.shell.addClass('show');
            this.trigger('entercomplete');
          }
        });
    },
    /**
     * @method exit
     * Executes when the user navigates away from this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} enteringViews  The views that are entering as this one exits
     * @return {Lavaca.util.Promise} A promise
     */
    exit: function(container, enteringViews) {
      if (Detection.animationEnabled && (this.layer > 0 || enteringViews.length > 0)) {
        this.shell.removeClass('reverse');
        var self = this,
            promise = new Promise(this);
        this.shell
          .nextAnimationEnd(function() {
            self.shell.removeClass('in out show');
            PageView.prototype.exit.apply(self, arguments).then(function() {
              promise.resolve();
            });
          })
          .removeClass('in')
          .addClass('out');
        return promise;
      } else {
        this.shell.removeClass('show');
        return PageView.prototype.exit.apply(this, arguments);
      }
    }
  });

  return BaseView;

});
