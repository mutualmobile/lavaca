define(function(require) {

  var BaseView = require('./BaseView');
  require('rdust!templates/example');
  var Config = require('lavaca/util/Config');

  /**
   * @class app.ui.views.ExampleView
   * @super app.ui.views.BaseView
   * Example view type
   */
  var ExampleView = BaseView.extend({
    /**
     * @field {String} template
     * @default 'example'
     * The name of the template used by the view
     */
    template: 'templates/example',
    /**
     * @field {String} className
     * @default 'example'
     * A class name added to the view container
     */
    className: 'example'

  });

  return ExampleView;

});
