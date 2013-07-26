define(function(require) {

  var BaseView = require('./BaseView');

  require('rdust!templates/test');

  /**
   * Test view type
   * @class app.ui.views.TestView
   * @extends app.ui.views.BaseView
   */
  var TestView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
  }, {
    /**
     * The name of the template used by the view
     * @property {String} template
     * @default 'example'
     */
    template: 'templates/test',
    /**
     * A class name added to the view container
     * @property {String} className
     * @default 'example'
   
     */
    className: 'test'

  });

  return TestView;

});