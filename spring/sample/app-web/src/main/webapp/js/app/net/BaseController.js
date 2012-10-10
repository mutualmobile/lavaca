/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Controller, Promise, $) {

/**
 * @class app.net.BaseController
 * @super Lavaca.mvc.Controller
 * Example controller
 */
ns.BaseController = Controller.extend({
  /**
   * @method serverEquivalent
   * Returns the server equivalent for a route, provided the route is not in the history
   *
   * @sig
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @param {String} cacheKey  A cache key under which to store the view
   * @param {Function} TView  The type of view to return
   * @param {String} title  The new title of the page
   * @return {Lavaca.util.Promise}  A promise
   * 
   * @sig
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @param {String} cacheKey  A cache key under which to store the view
   * @param {Function} TView  The type of view to return
   * @param {Function} title  A function that, when passed the params and model, return the title
   * @return {Lavaca.util.Promise}  A promise
   */
  serverEquivalent: function(params, model, cacheKey, TView, title) {
    var promise = new Promise(this),
        returnPromise = new Promise(this),
        url = params.url.split('?');
    promise.error(returnPromise.rejector());
    if (!model) {
      if (url[0].toLowerCase().indexOf('.json') == -1) {
        url[0] += '.json';
      }
      url = url.join('?');
      promise.when(this.ajax({url: url}));
    } else {
      promise.resolve(model);
    }
    promise
      .success(function(model) {
        if (typeof model == 'string') {
          model = JSON.parse(model);
        }
        if (model.redirect) {
          returnPromise.when(this.redirect(model.redirect));
        } else {
          returnPromise.when(this
              .view(cacheKey, TView, model)
              .then(this.history(model, title instanceof Function ? title.call(this, params, model) : title, params.url)));
        }
      })
      .error(returnPromise.rejector());
    return returnPromise;
  }
});

})(Lavaca.resolve('app.net', true), Lavaca.mvc.Controller, Lavaca.util.Promise, Lavaca.$);