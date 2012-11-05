/*
Lavaca 1.0.5
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