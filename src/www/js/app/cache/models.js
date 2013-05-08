define(function(require) {
	var Cache = require('lavaca/util/Cache');
  var Model = require('lavaca/mvc/Model');
	var models = new Cache();
	models.set('state', new Model());
	models.set('header', new Model({ name: 'Lavaca' }));
	return models;
});