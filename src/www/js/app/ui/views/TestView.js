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

    this.on('rendersuccess', this.loguihash, this);
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
    className: 'test',

    ui: {
      header3: 'h3'
    },

    loguihash: function(e) {
      console.log(this.ui);
    }

  });

  return TestView;

});