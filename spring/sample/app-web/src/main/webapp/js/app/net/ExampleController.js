/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, BaseController, Promise, $) {

/**
 * @class app.net.ExampleController
 * @super app.net.BaseController
 * Example controller
 */
ns.ExampleController = BaseController.extend({
  /**
   * @method home
   * Home action, creates a history state and shows a view
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  home: function(params, model) {
    return this.serverEquivalent(params, model, 'home', app.ui.views.HomeView, 'Home Page');
  },
  /**
   * @method example
   * Example action, creates a history state and shows a view
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise} A promise
   */
  example: function(params, model) {
    return this.serverEquivalent(params, model, null, app.ui.views.ExampleView, function(params, model) { return this.translate('hello', [model.fruit]); });
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
    var locale = params.locale || 'en_US',
        result = new Promise(this);
    this.ajax({
        url: this.url('/lang.json?locale={0}', [locale]),
        dataType: 'json'
      })
      .then(function(response) {
        Lavaca.util.Translation.setDefault(locale);
        localStorage.setItem('app:lang', locale);
        this.viewManager.flush();
        app.state.set('lang', locale);
        this
          .redirect('/?lang={0}', [locale])
          .then(result.resolver(), result.rejector());
      }, result.rejector());
    return result;
  }
});

})(Lavaca.resolve('app.net'), app.net.BaseController, Lavaca.util.Promise, Lavaca.$);