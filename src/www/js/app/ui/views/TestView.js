define(function(require) {

  var BaseView = require('./BaseView');
  var viewManager = require('lavaca/mvc/ViewManager');
  var router = require('lavaca/mvc/Router');

  require('rdust!templates/test');

  /**
   * @class app.ui.views.TestView
   * @super app.ui.views.BaseView
   * Test view type
   */
  var TestView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
    setTimeout(function() {
      console.log(viewManager);
      router.exec('/');
    }, 2000);
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
    className: 'example'

  });

  return TestView;

});