import $ from 'jquery';
import { default as Cache } from '../util/Cache';
import { default as Disposable } from '../util/Disposable';
import { default as History } from '../net/History';
import {fillIn, merge} from 'mout/object';
import {removeAll, contains} from 'mout/array';

var ChildViewManager = Disposable.extend(function ChildViewManager(el, routes, parent, id){
  Disposable.call(this);
  this.history = [];
  this.animationBreadcrumb = [];
  this.step = 1;
  this.initialStep = 1;
  this.routes = [];
  this.currentView = false;
  this.isRoutingBack = false;
  this.childViews = new Cache();
  this.layers = [];
  this.exitingViews = [];
  this.enteringViews = [];
  this.routes = {};
  this.elName = el;
  this.parentView = parent;
  this.id = id;
  if (typeof routes === 'object') {
    for (var r in routes) {
      this.routes[r] = routes[r];
    }
  }
  else{
    console.warn('You must pass mapChildViewManager an element string and object of the routes.');
    return;
  }
  $(window).on('cvmexec.'+this.id,_exec.bind(this));
}, {
  init(view, id) {
    this.el = view.find(this.elName);
    if (!this.el.hasClass('cvm')){
      this.el.addClass('cvm');
      this.exec();
    }
  },
  back() {
    if(!this.history || this.history.length - 1 <= 0){
      History.back();
    }
    else{
      this.history.pop();
      var route = this.history.pop();
      this.isRoutingBack = true;
      var _always = () => {
        this.isRoutingBack = false;
      };
      this.exec(route).then(_always, _always);
    }
  },
  stepBack() {
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
  exec(route, params) {
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
    if(!model){
      model = this.parentView ? this.parentView.model : null;
    }
    var layer = ChildView.prototype.layer || 0,
        childView = new ChildView(null, model, this.parentView);

        params = params || {};
        if (typeof params === 'number') {
          layer = params;
        } else if (params.layer) {
          layer = params.layer;
        }
        childView.layer = layer;

        if (typeof this.childViewMixin === 'object') {
          merge(childView, this.childViewMixin);
        }
        if (typeof this.childViewFillin === 'object') {
          fillIn(childView, this.childViewFillin);
        }
        if (typeof params === 'object') {
          merge(childView, params);
        }

        childView.isChildViewManagerView = true;

    return childView.render().then(() => {
        this.currentView = childView;
        this.enteringViews = [childView];
        return Promise.all([
          (() => {
            if (this.layers[layer] !== childView) {
              return childView.enter(this.el, this.exitingViews);
            }
            return Promise.resolve();
          })(),
          (() => {
            return this.dismissLayersAbove(layer-1, childView);
          })()
        ]);
      })
      .then(() => {
        this.enteringPageViews = [];
        this.step = this.routes[route].step;
        this.layers[layer] = childView;
        if (this.parentView && 
            this.parentView.onChildViewManagerExec && 
            typeof this.parentView.onChildViewManagerExec === 'function') {
          this.parentView.onChildViewManagerExec(route, this.step);
        }
      });
  },
  dismiss(layer) {
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
  dismissLayersAbove(index, exceptForView) {
    var toDismiss = this.layers.slice(index+1)
      .filter((layer) => {
        return (layer && (!exceptForView || exceptForView !== layer));
      });
    this.layers = this.layers.map((layer) => {
      if (contains(toDismiss, layer)) {
        return null;
      }
      return layer;
    });

    var promises = toDismiss.map((layer) => {
        return Promise.resolve()
          .then(() => {
            this.exitingViews.push(layer);
            return layer.exit(this.el, this.enteringViews);
          })
          .then(() => {
            removeAll(this.exitingViews, layer);
            layer.dispose();
          });
      });

    return Promise.all(promises);
  },
  dispose() {
    this.model = this.parentView = null;
    $(window).off('cvmexec.'+this.id);
    Disposable.prototype.dispose.call(this);
  },
  flush() {
    this.history = [];
    this.childViews.dispose();
    this.childViews = new Cache();
  }
});

let _getRoute = function(url){
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

let _exec = function(e,obj){
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

export default ChildViewManager;