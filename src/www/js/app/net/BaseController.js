define(function(require) {

  var Controller = require('lavaca/mvc/Controller');
  var merge = require('mout/object/merge');
  var state = require('../cache/models').get('state');

  /**
   * @class app.net.BaseController
   * @super Lavaca.mvc.Controller
   * Base controller
   */
  var BaseController = Controller.extend(function(){
      Controller.apply(this, arguments);
    }, {
    updateState: function(historyState, title, url, stateProps){
      var defaultStateProps = {pageTitle: title};
      this.history(historyState, title, url)();

      stateProps = merge(stateProps || {}, defaultStateProps);
      state.apply(stateProps, true);
      state.trigger('change');
    }
  });

  return BaseController;

});