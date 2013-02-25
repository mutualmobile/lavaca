/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
define(function(require) {

  var Device = require('lavaca/env/Device');
  var PageView = require('lavaca/mvc/PageView');
  var Promise = require('lavaca/util/Promise');
  require('lavaca/fx/Animation'); //jquery plugins

  var UNDEFINED;

  /**
   * @class app.ui.BaseView
   * @super Lavaca.mvc.View
   *
   * A View from which all other application Views can extend.
   * Adds support for animating between views.
   */
  var BaseView = PageView.extend(function() {
    PageView.apply(this, arguments);
    //this
      // .mapWidget('.scrollable', Lavaca.ui.Scrollable)
      //.mapEvent('.cancel', 'tap', this.onTapCancel);
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
      if (Device.animations) {
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
      app.viewManager.dismiss(e.currentTarget);
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
          if (Device.animations && (this.layer > 0 || exitingViews.length > 0)) {
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
      if (Device.animations && (this.layer > 0 || enteringViews.length > 0)) {
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
