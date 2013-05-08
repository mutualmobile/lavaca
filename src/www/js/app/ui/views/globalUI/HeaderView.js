define(function(require) {

  var View = require('lavaca/mvc/View');
  require('rdust!templates/header');

  /**
   * @class app.ui.views.globalUI.HeaderView
   * @super Lavaca.mvc.View
   * Header view type
   */
  var HeaderView = View.extend({
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
    className: 'header'
  });

  return HeaderView;
});