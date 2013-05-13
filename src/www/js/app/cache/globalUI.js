define(function(require) {
	var Cache = require('lavaca/util/Cache');
  var HeaderView = require('app/ui/views/globalUI/HeaderView');
  var state = require('../cache/models').get('state');
	var globalUI = new Cache();
	globalUI.set('header', new HeaderView('#nav-header', state));
	return globalUI;
});