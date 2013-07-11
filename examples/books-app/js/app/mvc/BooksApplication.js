define(function(require) {

  var Application = require('lavaca/mvc/Application'),
      $ = require('jquery');

  /**
   * @class app.mvc.BooksApplication
   * @super Lavaca.mvc.Application
   * Books Application
   */
  var BooksApplication = Application.extend(function () {
    Application.apply(this, arguments);
  }, {
    /**
     * @method onTapLink
     * Override to handle project specific links
     * @param {Event} e  The event object
     */
    onTapLink: function(e) {
      var link = $(e.currentTarget),
          url = link.attr('href'),
          target = link.attr('target'),
          isExternal = link.is('[data-external]');

      if (link.attr('data-dismiss') === 'modal') {
        return true;
      }
      return Application.prototype.onTapLink.apply(this, arguments);
    }
  });

  return BooksApplication;

});