define(function(require) {

  var BaseView = require('./BaseView');

  require('rdust!templates/test');

  /**
   * @class app.ui.views.TestView
   * @super app.ui.views.BaseView
   * Test view type
   */
  var TestView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
  }, {
    /**
     * @field {String} template
     * @default 'example'
     * The name of the template used by the view
     */
    template: 'templates/test',
    /**
     * @field {String} className
     * @default 'example'
     * A class name added to the view container
     */
    className: 'test'

  });

  return TestView;

});