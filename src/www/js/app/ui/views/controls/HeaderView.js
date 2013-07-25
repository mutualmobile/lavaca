define(function(require) {

  var View = require('lavaca/mvc/View'),
      stateModel = require('app/models/StateModel');
  require('rdust!templates/header');

  /**
   * Header view type
   * @class app.ui.views.globalUI.HeaderView
   * @super Lavaca.mvc.View
   */
  var HeaderView = View.extend(function(){
      View.apply(this, arguments);

      this.mapEvent({
        model: {
          change: this.onModelChange.bind(this)
        }
      });
    }, {
    /**
     * The name of the template used by the view
     * @property {String} template
     * @default 'templates/header'
     */
    template: 'templates/header',
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'header'
     */
    className: 'header',

    onModelChange: function() {
      this.redraw('.title');
    }
  });

  return new HeaderView('#nav-header', stateModel);
});