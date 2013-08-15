define(function(require) {

  var $ = require('$'),
      Widget = require('./Widget');

  /**
   * Type that shows/hides a loading indicator
   * @class lavaca.ui.LoadingIndicator
   * @extends lavaca.ui.Widget
   *
   * @constructor
   * @param {jQuery} el  The DOM element that is the root of the widget
   */
  var LoadingIndicator = Widget.extend({
    /**
     * Class name applied to the root
     * @property {String} className
     * @default 'loading'
     */
    className: 'loading',
    /**
     * Activates the loading indicator
     * @method show
     */
    show: function() {
      this.el.addClass(this.className);
    },
    /**
     * Deactivates the loading indicator
     * @method hide
     */
    hide: function() {
      this.el.removeClass(this.className);
    }
  });
  /**
   * Creates a loading indicator and binds it to the document's AJAX events
   * @method init
   * @static
   */
   /** Creates a loading indicator and binds it to the document's AJAX events
   * @method init
   * @static
   * @param {Function} TLoadingIndicator  The type of loading indicator to create (should derive from [[Lavaca.ui.LoadingIndicator]])
   */
  LoadingIndicator.init = function(TLoadingIndicator) {
    TLoadingIndicator = TLoadingIndicator || LoadingIndicator;
    var indicator = new TLoadingIndicator(document.body);
    function show() {
      indicator.show();
    }
    function hide() {
      indicator.hide();
    }
    $(document)
      .on('ajaxStart', show)
      .on('ajaxStop', hide)
      .on('ajaxError', hide);
    return indicator;
  };

  return LoadingIndicator.init();

});
