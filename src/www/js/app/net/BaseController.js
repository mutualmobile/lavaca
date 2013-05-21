define(function(require) {

  var Controller = require('lavaca/mvc/Controller');
  var merge = require('mout/object/merge');
  var stateModel = require('app/models/StateModel');

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
      stateModel.apply(stateProps, true);
      stateModel.trigger('change');
    }
  });

  return BaseController;

});