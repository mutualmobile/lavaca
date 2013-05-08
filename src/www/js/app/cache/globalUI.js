define(function(require) {
	var Cache = require('lavaca/util/Cache');
	var models = require('app/cache/models');
  var HeaderView = require('app/ui/views/globalUI/HeaderView');
	var globalUI = new Cache();
	globalUI.set('header', new HeaderView('#nav-header', models.get('header')));
	return globalUI;
});