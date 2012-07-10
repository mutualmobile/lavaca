/*
Lavaca 1.0.1
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Contains components from or inspired by:

Simple Reset
(c) 2011 Eric Meyer
Released to public domain

jQuery v1.7.1
(c) 2011, John Resig
Dual licensed under the MIT or GPL Version 2 licenses.

Sizzle.js
(c) 2011, The Dojo Foundation
Released under the MIT, BSD, and GPL licenses.

Backbone.js 0.9.1 and Underscore.js 1.3.1
(c) 2012, Jeremy Ashkenas, DocumentCloud Inc
Released under the MIT license.

Dust.js v0.3.0
(c) 2010, Aleksander Williams
Released under the MIT license.

Zepto.js 0.8.0
(c) 2011 Thomas Fuchs
Released under the MIT license

jMiny 0.5.0
(c) 2012 Dan Nichols
Released under the MIT license

ChildBrowser
(c) 2012 Jesse MacFadyen, Nitobi
Released under the MIT license

lz77.js
(c) 2009 Olle Törnström
Released under the MIT license

iScroll 4.1.9
(c) 2011 Matteo Spinelli
Released under the MIT license
*/
(function(a){window.app=new a.mvc.Application(function(){a.net.Connectivity.registerOfflineAjaxHandler(app.onOfflineAjax);app.models.init();app.router.add({"/":[app.net.ExampleController,"home"],"/lang":[app.net.ExampleController,"lang"]});app.loadingIndicator=a.ui.LoadingIndicator.init()});app.showErrors=function(a){return this.viewManager.load(null,app.ui.views.ErrorsView,{errors:a},900)};app.onOfflineAjax=function(){plugins.notification.alert(a.util.Translation.get("error_offline"))}})(Lavaca,
Lavaca.$);(function(a){var c,b={};a.SENSITIVE="sensitive";a.get=function(b){return c.get(b)};a.set=function(a,f,g){c.set(a,f);g&&((f=b[g])||(f=b[g]=[]),f.push(a))};a.clear=function(e){if(e){for(var f=b[e]||[],g=-1,h,d;h=f[++g];)(d=c.get(h))&&d instanceof Lavaca.utils.Disposable&&d.dispose(),c.remove(h);b[e]=[]}else a.init()};a.init=function(){a.dispose();c=new Lavaca.util.Cache};a.dispose=function(){c&&(c.dispose(),c=null)}})(Lavaca.resolve("app.models",!0));
(function(a,c){a.ExampleController=c.extend({home:function(b,a){a||(a={column:0});return this.view("home",app.ui.views.ExampleView,a).then(this.history(a,"Home Page",b.url))},lang:function(b){b=b.locale||"en_US";Lavaca.util.Translation.setDefault(b);localStorage.setItem("app:lang",b);this.viewManager.flush();app.state.set("lang",b);return this.redirect("/?lang={0}",[b])}})})(Lavaca.resolve("app.net",!0),Lavaca.mvc.Controller,Lavaca.util.Promise,Lavaca.$);
(function(a,c,b){function e(b){b.preventDefault();app.viewManager.dismiss(b.currentTarget)}a.BaseView=b.extend(function(){b.apply(this,arguments);this.mapWidget(".scrollable",Lavaca.ui.Scrollable).mapEvent(".cancel","tap",e)},{template:"default",animation:"slide",onRenderSuccess:function(a){b.prototype.onRenderSuccess.apply(this,arguments);app.animations&&this.shell.addClass(this.animation)},enter:function(a,c){if(app.animations&&(this.shell.removeClass("reverse"),c.length||a[0].childNodes.length)){if(void 0!==
this.model.column)for(var e=-1,d;d=c[++e];)d.layer==this.layer&&(void 0!==d.model.column&&d.model.column>this.model.column)&&(this.shell.addClass("reverse"),d.shell.addClass("reverse"));this.shell.removeClass("out").addClass("in")}return b.prototype.enter.apply(this,arguments)},exit:function(a,c){if(app.animations){this.shell.removeClass("reverse");var e=this,d=new Lavaca.util.Promise(this);this.shell.nextAnimationEnd(function(a){b.prototype.exit.apply(e,arguments).then(function(){d.resolve()})}).removeClass("in").addClass("out");
return d}return b.prototype.exit.apply(e,arguments)}})})(Lavaca.resolve("app.ui.views",!0),Lavaca.$,Lavaca.mvc.View);
(function(a,c,b){a.PopoverView=b.extend({animation:"pop",overlayAnimation:"fade",overlayWrapper:function(){return c('<div class="ui-blocker"></div>')},onRenderSuccess:function(a){b.prototype.onRenderSuccess.apply(this,arguments);app.animations&&this.overlay.addClass(this.overlayAnimation)},render:function(){this.overlay&&this.overlay.remove();this.overlay=this.overlayWrapper();this.overlay.attr("data-layer-index",this.layer);this.overlayClassName&&this.overlay.addClass(this.overlayClassName);return b.prototype.render.apply(this,
arguments)},insertInto:function(a){var c=this.el.parent()[0]!=a[0];b.prototype.insertInto.apply(this,arguments);c&&this.overlay.insertBefore(this.shell)},enter:function(a,c){app.animations&&this.overlay.removeClass("out").addClass("in");return b.prototype.enter.apply(this,arguments)},exit:function(a,f){app.animations&&this.overlay.nextAnimationEnd(function(a){c(a.currentTarget).remove()}).removeClass("in").addClass("out");return b.prototype.exit.apply(this,arguments)}})})(app.ui.views,Lavaca.$,app.ui.views.BaseView);
(function(a,c,b){a.ScrollableView=b.extend(function(){b.apply(this,arguments);this.mapWidget("self",Lavaca.ui.Scrollable)})})(app.ui.views,Lavaca.$,app.ui.views.BaseView);(function(a,c,b){a.ExampleView=b.extend({template:"example",className:"example"})})(app.ui.views,Lavaca.$,app.ui.views.ScrollableView);
