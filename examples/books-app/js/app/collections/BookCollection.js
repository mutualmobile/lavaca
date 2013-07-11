define(function(require) {
  var Collection = require('lavaca/mvc/Collection');
  var BookModel = require('app/models/BookModel');
  var stateModel = require('app/models/StateModel');
  var favoriteCollection = require('app/collections/FavoriteCollection');
  var Config = require('lavaca/util/Config');

  var BookCollection = Collection.extend(function() {
    Collection.apply(this, arguments);

    stateModel.on('search:term', this.search, this);
    stateModel.on('search:more', this.moreBooks, this);
  },{

    /**
     * @field {Object} TModel
     * The type of model object to use for items in this collection
     */
    TModel: BookModel,
    /**
     * @field {String} itemsProperty
     * The name of the property containing the collection's items when using toObject()
     */
    itemsProperty: 'books',

    url: '/books/v1/volumes',

    maxResults: 40,

    page: 0,

    loading: false,

    totalItems: null,

    previousSearch: null,

    search: function (e) {
      var searchTerm = e.term,
          reset = e.reset;

      if (this.loading) {
        return true;
      }

      if (reset) {
        this.clearModels();
      }
      var opts = {};

      var url = Config.get('apiBaseUrl') + this.url;

      opts = {
        dataType: Config.get('apiPrefix')? 'json' : 'jsonp',
        url: url,
        data: {
          q: searchTerm,
          maxResults: this.maxResults,
          startIndex: this.page * this.maxResults,
          fields: 'totalItems,items(id,volumeInfo/title,volumeInfo/subtitle,volumeInfo/authors,volumeInfo/publishedDate,volumeInfo/description,volumeInfo/imageLinks)'
        }
      };


      stateModel.trigger("search:start", { start: 'start'});

      this.loading = true;

      this.fetch(opts)
        .then(this.searchSuccess.bind(this),
              this.searchFailure.bind(this));

      this.previousSearch = searchTerm;
    },

    searchSuccess: function(res) {
      stateModel.trigger('search:stop', 'stop');
      this.loading = false;
      if (this.count() === 0) {
        stateModel.trigger("search:noResults", { message: "No Books Found :(" });
      }
    },


    searchFailure: function(res) {
      stateModel.trigger("search:error", "Error, please retry later :s");
      this.loading = false;
    },

    responseFilter: function (res) {
      if (typeof res === 'object' && res.items) {
        if (res && res.hasOwnProperty('totalItems')) {
          this.totalItems = res.totalItems;
          this.page++;
        }
        return res.items;
      } else {
        return null;
      }
    },

    moreBooks: function () {
      if(this.length >= this.totalItems) {
        return true;
      }

      this.search({ term: this.previousSearch, reset: false });
    },

    dispose: function () {
      stateModel.off('search:term', this.search, this);
      stateModel.off('search:more', this.moreBooks, this);

      return Collection.prototype.dispose.apply(this, arguments);
    }

  });

  return BookCollection;
});