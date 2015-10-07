define(function(require) {

  var $ = require('$'),
    Cache = require('lavaca/util/Cache'),
    Disposable = require('lavaca/util/Disposable'),
    contains = require('mout/array/contains'),
    History = require('lavaca/net/History'),
    removeAll = require('mout/array/removeAll');

  var ChildViewManager = Disposable.extend(function(el, routes, parent) {
    Disposable.call(this);
    this.childViews = new Cache();
    this.layers = [];
    this.exitingViews = [];
    this.enteringViews = [];
    this.routes = {};
    this.elName = el;
    this.parentView = parent;
    if (typeof routes === 'object') {
      for (var r in routes) {
        this.routes[r] = { TView: routes[r].TView, model: routes[r].model , step: routes[r].step};
      }
    }
    else{
      console.warn('You must pass mapChildViewManager an element string and object of the routes.');
      return;
    }
    $(window).on('cvmexec.'+this.id,_exec.bind(this));
  }, {
    history:[],
    animationBreadcrumb:[],
    step:1,
    initialStep:1,
    routes:[],
    currentView:false,
    isRoutingBack:false,
    init: function(view) {
      this.el = view.find(this.elName);
      this.el.addClass('cvm');
      this.exec();
    },
    back:function(){
      if(!this.history || this.history.length - 1 <= 0){
        History.back();
      }
      else{
        this.history.pop();
        var route = this.history.pop();
        this.isRoutingBack = true;
        var _always = function() {
          this.isRoutingBack = false;
        }.bind(this);
        this.exec(route).then(_always, _always);
      }
    },
    stepBack:function(){
      if(this.history.length > 1){
        var route = _getRoute.call(this, this.history[this.history.length - 1]);
        if(this.routes[route].step !== this.initialStep){
          this.back();
        }
        else{
          History.back();
        }
      }
      else{
        this.back();
      }
    },
    exec: function(route) {
      if(!route){
        route = 1;
      }
      route = _getRoute.call(this, route);
      if(!route){
        return;
      }
      this.history.push(route);
      var ChildView = this.routes[route].TView, 
          model = this.routes[route].model;

      var layer = ChildView.prototype.layer || 0,
          childView = new ChildView(null, model, this.parentView);
          childView.layer = layer;
      return childView.render().then(function() {
          this.currentView = childView;
          this.enteringViews = [childView];
          return Promise.all([
            (function() {
              if (this.layers[layer] !== childView) {
                return childView.enter(this.el, this.exitingViews);
              }
              return Promise.resolve();
            }.bind(this))(),
            (function() {
              return this.dismissLayersAbove(layer-1, childView);
            }.bind(this))()
          ]);
        }.bind(this))
        .then(function() {
          this.enteringPageViews = [];
          this.step = this.routes[route].step;
          this.layers[layer] = childView;
          if (this.parentView && 
              this.parentView.onChildViewManagerExec && 
              typeof this.parentView.onChildViewManagerExec === 'function') {
            this.parentView.onChildViewManagerExec(route, this.step);
          }
        }.bind(this));
    },
    dismiss: function(layer) {
      if (typeof layer === 'number') {
        return this.dismissLayersAbove(layer - 1);
      // } 
      // else if (layer instanceof View) {
      } else {
        // return this.dismiss(layer.layer);
        layer = $(layer);
        var index = layer.attr('data-layer-index');
        if (index === null) {
          layer = layer.closest('[data-layer-index]');
          index = layer.attr('data-layer-index');
        }
        if (index !== null) {
          return this.dismiss(Number(index));
        }
      }
    },
    dismissLayersAbove: function(index, exceptForView) {
      var toDismiss = this.layers.slice(index+1)
        .filter(function(layer) {
          return (layer && (!exceptForView || exceptForView !== layer));
        });
      this.layers = this.layers.map(function(layer) {
        if (contains(toDismiss, layer)) {
          return null;
        }
        return layer;
      });

      var promises = toDismiss.map(function(layer) {
          return Promise.resolve()
            .then(function() {
              this.exitingViews.push(layer);
              return layer.exit(this.el, this.enteringViews);
            }.bind(this))
            .then(function() {
              removeAll(this.exitingViews, layer);
              layer.dispose();
            }.bind(this));
        }.bind(this));

      return Promise.all(promises);
    },
    dispose:function(){
      this.model = this.parentView = null;
      $(window).off('cvmexec.'+this.id);
      Disposable.prototype.dispose.call(this);
    },
    flush: function() {
      this.history = [];
      this.childViews.dispose();
      this.childViews = new Cache();
    }
  });
  
  function _getRoute(url){
    var route = false;
    if(this.routes){    
      for(var r in this.routes){
        if(r === url || this.routes[r].step === url){
          route = r;
        }
      }
    }
    return route;
  }

  function _exec(e,obj){
    if(obj && obj.childViewSelector === this.elName){
      if(obj.route === 'back' || obj.route === '#back'){
        this.back();
        return;
      }
      if(obj.route === 'stepback' || obj.route === '#stepback'){
        this.stepback();
        return;
      }
      this.exec(obj.route);
    }
  }

  return ChildViewManager;

});