/*
Lavaca 1.0.3
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
      model = {
        column: 0
      };
    }
    return this
      .view('home', app.ui.views.HomeView, model)
      .then(this.history(model, 'Home Page', params.url));
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
    // This action uses two promises: one it returns and the other manages alert dialogs
    var result = new Promise(this),
        promise = new Promise(this),
        ajaxPromise = new Promise(this),
        buttons;
    // If no model was passed in, we'll need to generate one
    if (!model) {
      ajaxPromise = this.ajax({
        url: params.url + '.json',
        dataType: 'json'
      });
    } else {
      ajaxPromise.resolve(model);
    }
    // Setup the internal promise's success and failure states
    promise
      .success(function () {
        // When the promise is resolved, navigate to the example view and record a history state
        // After we've navigated to the example view, the returned promise (result) is resolved
        // to coLavacaunicate to other methods that the operation is finished.
        result.when(this
          .view(null, app.ui.views.ExampleView, model)
          .then(this.history(model, this.translate('hello', [model.fruit]), params.url)));
      })
      .error(function() {
        // When the promise is rejected, redirect to the home page
        this.redirect('/');
      });
    ajaxPromise
      .success(function(response) {
        model = response;
        // If a confirm message parameter was passed, show the confirm asking if the user is allergic
        if (model.confirm) {
          // When the user accepts the confirm dialog, the promise is resolved and we navigate to the example view
          // When the user declines the confirm dialog, the promise is rejected and we redirect to the home page
          var buttons = [
                // If the user clicks yes, they're allergic and we should redirect
                {name: this.translate('yes'), exec: promise.rejector()},
                // If the user clicks no, they're ok to proceed
                {name: this.translate('no'), exec: promise.resolver()}
              ];
          promise.when(plugins.notification.confirm('', model.confirm, buttons));
        } else {
          // No dialogs needed, just resolve the promise
          promise.resolve();
        }
      })
      .error(result.rejector());
    return result;
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

})(Lavaca.resolve('app.net', true), Lavaca.mvc.Controller, Lavaca.util.Promise, Lavaca.$);