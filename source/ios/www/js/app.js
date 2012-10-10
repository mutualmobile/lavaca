/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Contains components from or inspired by:

Simple Reset
(c) 2011 Eric Meyer
Released to public domain

jQuery v1.7.1
(c) 2011, John Resig
Dual licensed under the MIT or GPL Version 2 licenses.

Sizzle.js
(c) 2011, The Dojo Foundation
Released under the MIT, BSD, and GPL licenses.

Backbone.js 0.9.1 and Underscore.js 1.3.1
(c) 2012, Jeremy Ashkenas, DocumentCloud Inc
Released under the MIT license.

Dust.js v0.3.0
(c) 2010, Aleksander Williams
Released under the MIT license.

Zepto.js 0.8.0
(c) 2011 Thomas Fuchs
Released under the MIT license

ChildBrowser
(c) 2012 Jesse MacFadyen, Nitobi
Released under the MIT license

lz77.js
(c) 2009 Olle Törnström
Released under the MIT license

iScroll 4.1.9
(c) 2011 Matteo Spinelli
Released under the MIT license
*/

/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(Lavaca, $) {

/*
// Uncomment this section to use hash-based browser history instead of HTML5 history.
// You should use hash-based history if there's no server-side component supporting your app's routes.

Lavaca.net.History.overrideStandardsMode();
*/

/**
 * @class app
 * @super Lavaca.mvc.Application
 * Global application-specific object
 */
window.app = new Lavaca.mvc.Application(function() {
  // Setup offline AJAX handler
  Lavaca.net.Connectivity.registerOfflineAjaxHandler(app.onOfflineAjax);
  // Initialize the models cache
  app.models.init();
  // Initialize the routes
  app.router.add({
    '/': [app.net.ExampleController, 'home'],
    '/lang': [app.net.ExampleController, 'lang']
  });
  // Initialize the loading indicator
  app.loadingIndicator = Lavaca.ui.LoadingIndicator.init();
});

/**
 * @method showErrors
 * Shows the errors dialog
 *
 * @param {Array} errors  A list of error messages
 * @return {Lavaca.util.Promise}  A promise
 */
app.showErrors = function(errors) {
  return this.viewManager.load(null, app.ui.views.ErrorsView, {errors: errors}, 900);
};

/**
 * @method onOfflineAjax
 * Handles attempts to make an AJAX request when the application is offline
 */
app.onOfflineAjax = function() {
  plugins.notification.alert(Lavaca.util.Translation.get('error_offline'));
};

})(Lavaca, Lavaca.$);
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
 * @class app.models
 *  Application models cache
 */
(function(ns) {

var _modelsCache,
    _flags = {};

/** 
 * @field {String} SENSITIVE
 * @static
 * @default "sensitive"
 * The sensitive flag
 */
ns.SENSITIVE = 'sensitive';

/**
 * @method get
 * @static
 * Gets a model by name
 *
 * @param {String} name  The name under which the model is stored
 * @return {Object} The model stored under that name
 */
ns.get = function(name) {
  return _modelsCache.get(name);
};

/**
 * @method set
 * @static
 * Sets a model
 *
 * @sig
 * @param {String} name  The name under which to store the value
 * @param {Object} value  The value to store
 *
 * @sig
 * @param {String} name  The name under which to store the value
 * @param {Object} value  The value to store
 * @param {String} flag  A meta data flag to assign to the data
 */
ns.set = function(name, value, flag) {
  _modelsCache.set(name, value);
  if (flag) {
    var keys = _flags[flag];
    if (!keys) {
      keys = _flags[flag] = [];
    }
    keys.push(name);
  }
};

/**
 * @method clear
 * @static
 *
 * @sig
 * Removes all cached model data
 *
 * @sig
 * Removes all flagged cached model data
 * @param {String} flag  The meta data flag assigned to the data
 */
ns.clear = function(flag) {
  if (flag) {
    var keys = _flags[flag] || [],
        i = -1,
        key,
        item;
    while (key = keys[++i]) {
      item = _modelsCache.get(key);
      if (item && item instanceof Lavaca.utils.Disposable) {
        item.dispose();
      }
      _modelsCache.remove(key);
    }
    _flags[flag] = [];
  } else {
    ns.init();
  }
};

/**
 * @method init
 * @static
 * Readies the models cache for use
 */
ns.init = function() {
  ns.dispose();
  _modelsCache = new Lavaca.util.Cache();
};

/**
 * @method dispose
 * @static
 * Destroys the models cache
 */
ns.dispose = function() {
  if (_modelsCache) {
    _modelsCache.dispose();
    _modelsCache = null;
  }
};

})(Lavaca.resolve('app.models', true));
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Controller, Promise, $) {

/**
 * @class app.net.ExampleController
 * @super Lavaca.mvc.Controller
 * Example controller
 */
ns.ExampleController = Controller.extend({
  /**
   * @method home
   * Home action, creates a history state and shows a view
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  home: function(params, model) {
    if (!model) {
      model = {};
    }
    return this
      .view('home', app.ui.views.ExampleView, model)
      .then(this.history(model, 'Home Page', params.url));
  },
  /**
   * @method lang
   * Switches the user to a specific language
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise} A promise
   */
  lang: function(params, model) {
    var locale = params.locale || 'en_US';
    Lavaca.util.Translation.setDefault(locale);
    localStorage.setItem('app:lang', locale);
    this.viewManager.flush();
    app.state.set('lang', locale);
    return this.redirect('/?lang={0}', [locale]);
  }
});

})(Lavaca.resolve('app.net', true), Lavaca.mvc.Controller, Lavaca.util.Promise, Lavaca.$);
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, View) {

var UNDEFINED;

/**
 * @class app.ui.BaseView
 * @super Lavaca.mvc.View
 * Default view type
 */
ns.BaseView = View.extend(function() {
	View.apply(this, arguments);
	this
  	.mapWidget('.scrollable', Lavaca.ui.Scrollable)
  	.mapEvent('.cancel', 'tap', this.onTapCancel);
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
   * Executes when the template renders successfully
   *
   * @param {Event} e  The render event. This object should have a string property named "html"
   *   that contains the template's rendered HTML output.
   */
  onRenderSuccess: function(e) {
    View.prototype.onRenderSuccess.apply(this, arguments);
    if (app.animations) {
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
   * Executes when the user navigates to this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} exitingViews  The views that are exiting as this one enters
   * @return {Lavaca.util.Promise} A promise
   */
  enter: function(container, exitingViews) {
    return View.prototype.enter.apply(this, arguments)
      .then(function() {
        if (app.animations && (this.layer > 0 || exitingViews.length > 0)) {
          this.shell.removeClass('reverse');
          if (exitingViews.length || container[0].childNodes.length) {
            if (this.column !== UNDEFINED) {
              var i = -1,
                  exitingView;
              while (exitingView = exitingViews[++i]) {
                if (exitingView.layer == this.layer
                    && exitingView.column !== UNDEFINED
                    && exitingView.column > this.column) {
                  this.shell.addClass('reverse');
                  exitingView.shell.addClass('reverse');
                }
              }
            }
            this.shell
              .removeClass('out')
              .addClass('in');
          }
        }
      });
  },
  /**
   * @method exit
   * Executes when the user navigates away from this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} enteringViews  The views that are entering as this one exits
   * @return {Lavaca.util.Promise} A promise
   */
  exit: function(container, enteringViews) {
    if (app.animations && (this.layer > 0 || enteringViews.length > 0)) {
      this.shell.removeClass('reverse');
      var self = this,
          args = arguments,
          promise = new Lavaca.util.Promise(this);
      this.shell
        .nextAnimationEnd(function(e) {
          View.prototype.exit.apply(self, arguments).then(function() {
            promise.resolve();
          });
        })
        .removeClass('in')
        .addClass('out');
      return promise;
    } else {
      return View.prototype.exit.apply(this, arguments);
    }
  }
});

})(Lavaca.resolve('app.ui.views', true), Lavaca.$, Lavaca.mvc.View);
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, BaseView) {

/**
 * @class app.ui.PopoverView
 * @super app.ui.BaseView
 * Base popover view type
 */
ns.PopoverView = BaseView.extend({
  /**
   * @field {String} animation
   * @default 'pop'
   * The name of the animation used by the view
   */
  animation: 'pop',
  /**
   * @field {String} overlayAnimation
   * @default 'fade'
   * The name of the animation used by the overlay
   */
  overlayAnimation: 'fade',
  /**
   * @method overlayWrapper
   * Creates the view's overlay element
   *
   * @return {jQuery} The overlay element
   */
  overlayWrapper: function() {
    return $('<div class="ui-blocker"></div>');
  },
  /**
   * @method onrendersuccess
   * Executes when the template renders successfully
   *
   * @param {Event} e  The render event. This object should have a string property named "html"
   *   that contains the template's rendered HTML output.
   */
  onRenderSuccess: function(e) {
    BaseView.prototype.onRenderSuccess.apply(this, arguments);
    if (app.animations) {
      this.overlay.addClass(this.overlayAnimation);
    }
  },
  /**
   * @method render
   * Renders the view using its template and model
   *
   * @event rendersuccess
   * @event rendererror
   *
   * @return {Lavaca.util.Promise} A promise
   */
  render: function() {
    if (this.overlay) {
      this.overlay.remove();
    }
    this.overlay = this.overlayWrapper();
    this.overlay.attr('data-layer-index', this.layer);
    if (this.overlayClassName) {
      this.overlay.addClass(this.overlayClassName);
    }
    return BaseView.prototype.render.apply(this, arguments);
  },
  /**
   * @method insertInto
   * Adds this view to a container
   *
   * @param {jQuery} container  The containing element
   */
  insertInto: function(container) {
    var doInsert = this.el.parent()[0] != container[0];
    BaseView.prototype.insertInto.apply(this, arguments);
    if (doInsert) {
      this.overlay.insertBefore(this.shell);
    }
  },
  /**
   * @method enter
   * Executes when the user navigates to this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} exitingViews  The views that are exiting as this one enters
   * @return {Lavaca.util.Promise} A promise
   */
  enter: function(container, exitingViews) {
    if (app.animations) {
      this.overlay
        .removeClass('out')
        .addClass('in');
    }
    return BaseView.prototype.enter.apply(this, arguments);
  },
  /**
   * @method exit
   * Executes when the user navigates away from this view
   *
   * @param {jQuery} container  The parent element of all views
   * @param {Array} enteringViews  The views that are entering as this one exits
   * @return {Lavaca.util.Promise} A promise
   */
  exit: function(container, enteringViews) {
    if (app.animations) {
      this.overlay
        .nextAnimationEnd(function(e) {
          $(e.currentTarget).remove();
        })
        .removeClass('in')
        .addClass('out');
    }
    return BaseView.prototype.exit.apply(this, arguments);
  }
});

})(app.ui.views, Lavaca.$, app.ui.views.BaseView);
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, BaseView) {

/**
 * @class app.ui.ScrollableView
 * @super app.ui.BaseView
 * A view that can be touch-scrolled
 */
ns.ScrollableView = BaseView.extend(function() {
	BaseView.apply(this, arguments);
	this.mapWidget('self', Lavaca.ui.Scrollable);
});

})(app.ui.views, Lavaca.$, app.ui.views.BaseView);
/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, ScrollableView) {

/**
 * @class app.ui.ExampleView
 * @super app.ui.ScrollableView
 * Example view type
 */
ns.ExampleView = ScrollableView.extend({
  /**
   * @field {String} template
   * @default 'example'
   * The name of the template used by the view
   */
  template: 'example',
  /**
   * @field {String} className
   * @default 'example'
   * A class name added to the view container
   */
  className: 'example'
});

})(app.ui.views, Lavaca.$, app.ui.views.ScrollableView);