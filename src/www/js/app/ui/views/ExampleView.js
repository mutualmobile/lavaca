define(function(require) {

  var ScrollableView = require('./ScrollableView');
  require('rdust!templates/example');

  /**
   * @class app.ui.ExampleView
   * @super app.ui.ScrollableView
   * Example view type
   */
  var ExampleView = ScrollableView.extend({
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
