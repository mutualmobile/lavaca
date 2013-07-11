define(function(require) {

  var View = require('lavaca/mvc/View'),
      stateModel = require('app/models/StateModel');
  require('rdust!templates/menu');

  /**
   * @class app.ui.views.controls.MenuView
   * @super Lavaca.mvc.View
   * Menu view type
   */
  var MenuView = View.extend(function () {
      View.apply(this, arguments);

      this.render();

    }, {
    /**
     * @field {String} template
     * @default 'templates/menu'
     * The name of the template used by the view
     */
    template: 'templates/menu',
    /**
     * @field {String} className
     * @default 'menu'
     * A class name added to the view container
     */
    className: 'menu'

  });

  return MenuView;
});