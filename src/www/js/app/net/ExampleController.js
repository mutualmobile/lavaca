define(function(require) {

  var ExampleView = require('app/ui/views/ExampleView'),
      TestView = require('app/ui/views/TestView'),
      BaseController = require('app/net/BaseController'),
      Translation = require('lavaca/util/Translation'),
      localStore = require('app/cache/localStore'),
      stateModel = require('app/models/StateModel');

  /**
   * Example controller
   * @class app.net.ExampleController
   * @extends app.net.BaseController
   */
  var ExampleController = BaseController.extend({
    /**
     * Home action, creates a history state and shows a view
     * @method home
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
        .view(null, ExampleView, model)
        .then(this.updateState(model, 'Home Page', params.url));
    },
    /**
     * Switches the user to a specific language
     * @method lang
     *
     * @param {Object} params  Action arguments
     * @param {Object} model  History state model
     * @return {Lavaca.util.Promise} A promise
     */
    lang: function(params) {
      var locale = params.locale || 'en_US';
      Translation.setDefault(locale);
      localStore.set('lang', locale);
      this.viewManager.flush();
      stateModel.set('lang', locale);
      return this.redirect('/?lang={0}', [locale]);
    },
    test: function(params, model) {
      if (!model) {
        model = {};
      }
      var viewProperties = {
        pageTransition: {
          'in': 'pt-page-rotatePullRight pt-page-delay180',
          'out': 'pt-page-rotatePushLeft',
          'inReverse': 'pt-page-rotatePullLeft pt-page-delay180',
          'outReverse': 'pt-page-rotatePushRight'
        }
      };
      return this
        .view(null, TestView, model, viewProperties)
        .then(this.updateState(model, 'Test Page', params.url));
    }
  });

  return ExampleController;

});
