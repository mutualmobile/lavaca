define(function(require) {

  var BaseView = require('./BaseView');

  /**
   * @class app.ui.ScrollableView
   * @super app.ui.BaseView
   * A view that can be touch-scrolled
   */
  var ScrollableView = BaseView.extend(function() {
    BaseView.apply(this, arguments);
    // this.mapWidget('self', Lavaca.ui.Scrollable);
  });

  return ScrollableView;

});
