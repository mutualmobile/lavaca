define(function(require) {
  var Model = require('lavaca/mvc/Model');

  var SearchModel = Model.extend(function() {
    Model.apply(this, arguments);

    var storedTerm = localStorage.getItem('books:search');

    if (storedTerm) {
      this.set('term', storedTerm);
    }

    this.on('change', this.onSearchChange, this);


  },{

    onSearchChange: function (e) {
      localStorage.setItem('books:search', this.get('term'));
    }

  });

  return SearchModel;
});