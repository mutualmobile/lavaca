define(function(require) {
  var Model = require('lavaca/mvc/Model');


  var BookModel = Model.extend(function() {
    Model.apply(this, arguments);
  },{

  });

  return BookModel;
});