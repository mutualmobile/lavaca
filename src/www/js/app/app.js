define(function(require) {
  var History = require('lavaca/net/History');
  var Detection = require('lavaca/env/Detection');
  var ExampleController = require('./net/ExampleController');
  var Connectivity = require('lavaca/net/Connectivity');
  var Application = require('lavaca/mvc/Application');
  var LoadingIndicator = require('lavaca/ui/LoadingIndicator');
  var Translation = require('lavaca/util/Translation');
  var localStore = require('./cache/localStore');
  var models = require('./cache/models');
  var globalUI = require('./cache/globalUI');
  var state = models.get('state');
  require('lavaca/ui/DustTemplate');
  require('jquery-mobile/events/touch');
  require('jquery-mobile/events/orientationchange');

  // Uncomment this section to use hash-based browser history instead of HTML5 history.
  // You should use hash-based history if there's no server-side component supporting your app's routes.
  History.overrideStandardsMode();

  /**
   * @class app
   * @super Lavaca.mvc.Application
   * Global application-specific object
   */
  var app = new Application(function() {
     // Demonstration of extending Detection module
    Detection.addCustomDetection(!Detection.mobileOS || Detection.otherBrowser, 'nonMobile');
    Detection.addCustomDetection(function() {
      return Detection.agent.search(/chrome|safari/i) > -1 && Detection.viewportWidth > 1024;
    }, 'wideWebkit');
    // Initialize the routes
    this.router.add({
      '/': [ExampleController, 'home'],
      '/lang': [ExampleController, 'lang'],
      '/test': [ExampleController, 'test']
    });
    state.set('lang', localStore.get('lang') || 'en_US');
    Translation.init(state.get('lang'));
    // render global views
    globalUI.toArray().forEach(function(view) {
      view.render();
    });
     // Initialize the loading indicator
    this.loadingIndicator = LoadingIndicator.init();
  });

  // Setup offline AJAX handler
  Connectivity.registerOfflineAjaxHandler(function() {
    var hasLoaded = Translation.hasLoaded;
    alert(hasLoaded ? Translation.get('error_offline') : 'No internet connection available. Please check your settings and connection and try again.');
  });

  return app;

});