define(function(require) {

  var BaseView = require('./BaseView');
  var BookItemView = require('app/ui/views/childviews/BookItemView');
  var debounce = require('mout/function/debounce');
  require('rdust!templates/favorites');
  var Config = require('lavaca/util/Config');

  /**
   * @class app.ui.views.FavoritesView
   * @super app.ui.views.BaseView
   * Favorites View
   */
  var FavoritesView = BaseView.extend(function () {
    BaseView.apply(this, arguments);

    this.on('entercomplete', this.initialize, this);

    this.mapEvent({
      model: {
        removeItem: 'onRemoveItem',
        addItem: 'onAddItem'
      }
    });

  },{
    /**
     * @field {String} template
     * @default 'templates/books'
     * The name of the template used by the view
     */
    template: 'templates/favorites',
    /**
     * @field {String} className
     * @default 'books'
     * A class name added to the view container
     */
    className: 'favorites-page',

    itemView: BookItemView,

    bookViews: [],

    initialize: function (e) {
      this.ui=  {
        books: this.el.find('.books'),
        bookList: this.el.find('#bookList')
      };

      this.renderItemViews();
    },

    renderItemViews: function (e) {
      var fragment = document.createDocumentFragment();
      for (var l = this.model.count(), i = 0; i < l; i++) {
        var model = this.model.itemAt(i);
        this.bookViews.push(new this.itemView($('<div>'), model));
        fragment.appendChild(this.bookViews[this.bookViews.length - 1].el[0]);
      }
      this.ui.books.append(fragment);
    },

    onRemoveItem: function(e) {
      this.ui.bookList.find('div[data-book-id="' + e.model.get('id') + '"]')
        .remove();
      for (var l=this.bookViews.length, i=0; i < l; i++) {
        var view  = this.bookViews[i];
        if (view.model.get('id') === e.model.get('id')) {
          var removedView = this.bookViews.splice(i, 1);
          removedView[0].dispose();
          removedView[0] = null;
          removedView = null;
          return;
        }
      }
    },

    onAddItem: function(e) {
      this.bookViews.push(new this.itemView($('<div>'), e.model));
      this.ui.books.append(this.bookViews[this.bookViews.length -1].el[0]);
    }


  });

  return FavoritesView;

});
