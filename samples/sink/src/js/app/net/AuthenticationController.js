/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Controller, Promise, $, Model) {

/**
 * @class app.net.AuthenticationController
 * @super Lavaca.mvc.Controller
 * Authentication controller
 */
ns.AuthenticationController = Controller.extend({
  /**
   * @method signIn
   * Sign-in action, shows the sign-in popover
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  signIn: function(params, model) {
    return this.view(null, app.ui.views.SignInView, {submitURL: '/sign-in/submit'}, 1);
  },
  /**
   * @method signInSubmit
   * Submits the sign in form
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  signInSubmit: function(params, model) {
    // Mocked authenication
    if (params.username == 'jsmith' && params.password == 'password') {
      return this.ajaxThenRedirect({
          url: '/mock/signin.json'
        },
        function(response) {
          app.state.set('user', new Model(response), Model.SENSITIVE);
          return '/welcome';
        });
    } else {
      app.showErrors(this.translate('error_auth'));
      return (new Promise(this)).reject();
    }
  },
  /**
   * @method signOut
   * Signs the user out
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  signOut: function(params, model) {
    app.state.clear(Model.SENSITIVE);
    return this.ajaxThenRedirect({
        url: '/mock/signout.json'
      },
      function(response) {
        return '/';
      });
  },
  /**
   * @method welcome
   * Shows the welcome page
   *
   * @param {Object} params  Action arguments
   * @param {Object} model  History state model
   * @return {Lavaca.util.Promise}  A promise
   */
  welcome: function(params, model) {
    var user = app.state.get('user');
    if (user) {
      return this
        .view(null, app.ui.views.WelcomeView, user)
        .then(this.history(model, 'Welcome', params.url));
    } else {
      return this.redirect('/');
    }
  }
});

})(Lavaca.resolve('app.net', true), Lavaca.mvc.Controller, Lavaca.util.Promise, Lavaca.$, Lavaca.mvc.Model);