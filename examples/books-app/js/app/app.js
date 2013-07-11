define(function(require) {
  var History = require('lavaca/net/History');
  var Config = require('lavaca/util/Config');
  var Detection = require('lavaca/env/Detection');
  var BookController = require('./net/BookController');
  var ModalView = require('app/ui/views/controls/ModalView');
  var MenuView = require('app/ui/views/controls/MenuView');
  var Connectivity = require('lavaca/net/Connectivity');
  var BooksApplication = require('app/mvc/BooksApplication');
  var Translation = require('lavaca/util/Translation');
  var localStore = require('./cache/localStore');
  var stateModel = require('app/models/StateModel');
  var favoriteCollection = require('app/collections/FavoriteCollection');
  require('lavaca/ui/DustTemplate');
  require('jquery-mobile/events/touch');
  require('jquery-mobile/events/orientationchange');


  History.overrideStandardsMode();

  /**
   * @class app
   * @super Lavaca.mvc.Application
   * Global application-specific object
   */
  var app = new BooksApplication(function () {
    // Initialize the routes
    this.router.add({
      '/': [BookController, 'index'],
      '/favorites' : [BookController, 'favorites']
    });
    stateModel.set('lang', localStore.get('lang') || 'en_US');
    //initialize translations
    Translation.init(stateModel.get('lang'));
    //render controls
    var modal = new ModalView('#modal');
    var menu = new MenuView('#menu');
  });

  // Setup offline AJAX handler
  Connectivity.registerOfflineAjaxHandler(function() {
    var hasLoaded = Translation.hasLoaded;
    alert(hasLoaded ? Translation.get('error_offline') : 'No internet connection available. Please check your settings and connection and try again.');
  });

  return app;

});