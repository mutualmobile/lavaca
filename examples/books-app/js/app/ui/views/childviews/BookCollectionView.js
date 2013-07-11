define(function(require) {

  var View = require('lavaca/mvc/View'),
      BookItemView = require('app/ui/views/childviews/BookItemView'),
      BookModel = require('app/models/BookModel'),
      clone = require('mout/lang/deepClone'),
      stateModel = require('app/models/StateModel');
  require('rdust!templates/book-list');

  /**
   * @class app.ui.views.childviews.BookCollectionView
   * @super Lavaca.mvc.View
   * Book Collection view type
   */
  var BookCollectionView = View.extend(function () {
      View.apply(this, arguments);

      this.mapEvent({
        model: {
          fetchSuccess: 'onBookFetch'
        }
      });


      this.render();

      this.el.find('#bookList').on('scroll', this.loadMoreBooks.bind(this));

      this.ui=  {
        books: this.el.find('.books'),
        bookList: this.el.find('#bookList')
      };

      stateModel.on('search:error', this.showMessage, this);
      stateModel.on('search:noSearchTerm', this.showMessage , this);
      stateModel.on('search:noResults', this.showMessage, this);
      stateModel.on('search:clearMessage', this.clearMessage, this);

    }, {
    /**
     * @field {String} template
     * @default 'templates/book-list'
     * The name of the template used by the view
     */
    template: 'templates/book-list',
    /**
     * @field {String} className
     * @default 'book-list'
     * A class name added to the view container
     */
    className: 'book-list',

    itemView: BookItemView,

    bookViews: [],

    bookViewIndex: 0,

    onBookFetch: function (e) {
      var fragment = document.createDocumentFragment();
      for (var l = this.model.count(); this.bookViewIndex < l; this.bookViewIndex++) {
        var model = this.model.itemAt(this.bookViewIndex);
        this.bookViews.push(new this.itemView($('<div>'), model));
        fragment.appendChild(this.bookViews[this.bookViews.length - 1].el[0]);
      }
      this.ui.books.append(fragment);
    },

    showMessage: function (e) {
      var message = e.message;
      this.ui.books.html('<h1 class="notFound">' + message + '</h1>');
    },

    clearMessage: function () {
      this.ui.books.html('');
      this.bookViewIndex = 0;
    },

    loadMoreBooks: function () {
      var totalHeight = this.el.find('#bookList > div').height(),
        scrollTop = this.ui.bookList.scrollTop() + this.ui.bookList.height(),
        margin = 200;

      // if we are closer than 'margin' to the end of the content, load more books
      if (scrollTop + margin >= totalHeight) {
        stateModel.trigger("search:more");
      }
    },

    dispose: function () {
      stateModel.off('search:error', this.showMessage, this);
      stateModel.off('search:noSearchTerm', this.showMessage , this);
      stateModel.off('search:noResults', this.showMessage, this);
      stateModel.off('search:clearMessage', this.clearMessage, this);
      stateModel.set('previousSearch', this.collection.previousSearch);
      this.el.find('#bookList').off('scroll', this.loadMoreBooks.bind(this));
      return View.prototype.dispose.apply(this, arguments);
    }

  });

  return BookCollectionView;
});