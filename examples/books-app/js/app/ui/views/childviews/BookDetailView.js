define(function(require) {

  var View = require('lavaca/mvc/View'),
      stateModel = require('app/models/StateModel');
  require('rdust!templates/book-detail');

  /**
   * @class app.ui.views.childviews.BookDetailView
   * @super Lavaca.mvc.View
   * Book Detail view type
   */
  var BookDetailView = View.extend(function () {
      View.apply(this, arguments);

      this.mapEvent({
        '.favorite span': {
          tap: 'onTapFavorite'
        }
      });


      stateModel.on('favorite:searchResult', this.onSearchResult, this);
      stateModel.trigger('favorite:search', { id: this.model.get('id')});


    }, {
    /**
     * @field {String} template
     * @default 'templates/book-detail'
     * The name of the template used by the view
     */
    template: 'templates/book-detail',
    /**
     * @field {String} className
     * @default 'book-detail'
     * A class name added to the view container
     */
    className: 'modal bookDetail',

    onSearchResult: function (e) {
      var isFavorite = e.isFavorite;
      if (isFavorite) {
        this.model.set('isFavorite', 'true');
      }
      this.render();
    },

    onTapFavorite: function (e) {
      var $target = $(e.currentTarget);
      if ($target.hasClass('add')) {
        stateModel.trigger('favorite:add', {model: this.model});
        $target.addClass('remove').removeClass('add').html('Remove from Favorites');
      } else {
        stateModel.trigger('favorite:remove', {model: this.model});
        $target.addClass('add').removeClass('remove').html('Add to Favorites');
      }

    },

    dispose: function () {
      stateModel.off('favorite:searchResult', this.onSearchResult, this);
      View.prototype.dispose.apply(this, arguments);
    }

  });

  return BookDetailView;
});