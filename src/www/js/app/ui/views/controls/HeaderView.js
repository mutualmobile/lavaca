define(function(require) {

  var View = require('lavaca/mvc/View'),
      stateModel = require('app/models/StateModel');
  require('rdust!templates/header');

  /**
   * @class app.ui.views.globalUI.HeaderView
   * @super Lavaca.mvc.View
   * Header view type
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
     * @field {String} template
     * @default 'templates/header'
     * The name of the template used by the view
     */
    template: 'templates/header',
    /**
     * @field {String} className
     * @default 'header'
     * A class name added to the view container
     */
    className: 'header',

    onModelChange: function() {
      this.redraw('.title');
    }
  });

  return new HeaderView('#nav-header', stateModel);
});