define(function(require) {
	var History = require('lavaca/net/History');
	var Application = require('lavaca/mvc/Application');
	var TodosController = require('app/net/TodosController');
	require('lavaca/ui/DustTemplate');
	require('jquery-mobile/events/touch');
	require('jquery-mobile/events/orientationchange');

	// Uncomment this section to use hash-based browser history instead of HTML5 history.
	// You should use hash-based history if there's no server-side component supporting your app's routes.
	History.overrideStandardsMode();

	// Override Lavaca's default view-root selector to match
	// the TodoMVC template file better
	Application.prototype.viewRootSelector = '#todoapp';

	/**
	 * @class app
	 * @super Lavaca.mvc.Application
	 * Global application-specific object
	 */
	var app = new Application(function() {

		// Initialize the routes
		this.router.add({
			'/': [TodosController, 'home', {filter: 'all'}],
			'/active': [TodosController, 'home', {filter: 'active'}],
			'/completed': [TodosController, 'home', {filter: 'completed'}]
		});
	});

	return app;

});