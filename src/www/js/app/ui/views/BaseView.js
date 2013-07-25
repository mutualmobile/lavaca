define(function(require) {

  var Detection = require('lavaca/env/Detection'),
      PageView = require('lavaca/mvc/PageView'),
      Promise = require('lavaca/util/Promise'),
      viewManager = require('lavaca/mvc/ViewManager'),
      History = require('lavaca/net/History');
  require('lavaca/fx/Animation'); //jquery plugins

  /**
   * A View from which all other application Views can extend.
   * Adds support for animating between views.
   *
   * @class app.ui.views.BaseView
   * @extends Lavaca.mvc.View
   *
   */
  var BaseView = PageView.extend(function() {
    PageView.apply(this, arguments);
    this.mapEvent('.cancel', 'tap', this.onTapCancel);
  }, {

    /**
     * The name of the template used by the view
     * @property {String} template
     * @default 'default'
     */
    template: 'default',
    /**
     * The name of the template used by the view
     * @property {Object} pageTransition
     * @default 'default'
     
     */
    pageTransition: {
      'in': '',
      'out': '',
      'inReverse': '',
      'outReverse': ''
    },
    /**
     * Executes when the template renders successfully. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method onRenderSuccess
     *
     * @param {Event} e  The render event. This object should have a string property named "html"
     *   that contains the template's rendered HTML output.
     */
    onRenderSuccess: function() {
      PageView.prototype.onRenderSuccess.apply(this, arguments);
    },
    /**
     * Handler for when a cancel control is tapped
     * @method onTapCancel
     *
     * @param {Event} e  The tap event.
     */
    onTapCancel: function(e) {
      e.preventDefault();
      viewManager.dismiss(e.currentTarget);
    },
    /**
     * Executes when the user navigates to this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method enter
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} exitingViews  The views that are exiting as this one enters
     * @return {Lavaca.util.Promise} A promise
     */
    enter: function(container, exitingViews) {
      return PageView.prototype.enter.apply(this, arguments)
        .then(function() {
          if (History.isRoutingBack) {
            if (History.animationBreadcrumb.length > 0) {
              this.pageTransition = History.animationBreadcrumb.pop();
            }
          } else {
            History.animationBreadcrumb.push(this.pageTransition);
          }
          var animationIn = History.isRoutingBack ? this.pageTransition['inReverse']:this.pageTransition['in'],
              animationOut = History.isRoutingBack ? this.pageTransition['outReverse']:this.pageTransition['out'],
              i = -1,
              exitingView;

          var triggerEnterComplete = function() {
            this.trigger('entercomplete');
            this.shell.removeClass(animationIn);
          };

          if (Detection.animationEnabled && animationIn !== '') {

            if (exitingViews.length) {
              i = -1;
              while (!!(exitingView = exitingViews[++i])) {
                exitingView.shell.addClass(animationOut);
                if (animationOut === '') {
                  exitingView.exitPromise.resolve();
                }
              }
            }

            if ((this.layer > 0 || exitingViews.length > 0)) {
              this.shell
                  .nextAnimationEnd(triggerEnterComplete.bind(this))
                  .addClass(animationIn + ' current');
            } else {
              this.shell.addClass('current');
              this.trigger('entercomplete');
            }
            
          } else {
            this.shell.addClass('current');
            if (exitingViews.length > 0) {
              i = -1;
              while (!!(exitingView = exitingViews[++i])) {
                exitingView.shell.removeClass('current');
                if (exitingView.exitPromise) {
                  exitingView.exitPromise.resolve();
                }
              }
            }
            this.trigger('entercomplete');
          }
        });
    },
    /**
     * Executes when the user navigates away from this view. This implementation
     * adds support for animations between views, based off of the animation
     * property on the prototype.
     * @method exit
     *
     * @param {jQuery} container  The parent element of all views
     * @param {Array} enteringViews  The views that are entering as this one exits
     * @return {Lavaca.util.Promise} A promise
     */
    exit: function(container, enteringViews) {
      var animation = History.isRoutingBack ? this.pageTransition['outReverse'] : (enteringViews.length ? enteringViews[0].pageTransition['out'] : '');

      if (History.isRoutingBack && this.shell.data('layer-index') > 0) {
        this.pageTransition = History.animationBreadcrumb.pop();
        animation = this.pageTransition['outReverse'];
      }

      if (Detection.animationEnabled && animation) {
        this.exitPromise = new Promise(this);

        this.shell
          .nextAnimationEnd(function() {
            PageView.prototype.exit.apply(this, arguments).then(function() {
              this.exitPromise.resolve();
            });
            this.shell.removeClass(animation + ' current');
          }.bind(this))
          .addClass(animation);

        return this.exitPromise;
      } else {
        this.shell.removeClass('current');
        return PageView.prototype.exit.apply(this, arguments);
      }
    }
  });

  return BaseView;

});
