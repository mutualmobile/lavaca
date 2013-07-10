define(function(require) {

  var BaseView = require('./BaseView');
  require('rdust!templates/example');
  var Config = require('lavaca/util/Config');

  /**
   * Example view type
   * @class app.ui.views.ExampleView
   * @extends app.ui.views.BaseView
   */
  var ExampleView = BaseView.extend({
    /**
     * The name of the template used by the view
     * @property {String} template
     * @default 'example'
     */
    template: 'templates/example',
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'example'
     */
    className: 'example'

  });

  return ExampleView;

});
