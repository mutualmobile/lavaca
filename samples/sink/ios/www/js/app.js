/*
Lavaca 1.0.5
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
(function(a){window.app=new a.mvc.Application(function(){a.net.Connectivity.registerOfflineAjaxHandler(app.onOfflineAjax);app.models.init();app.nav=new app.ui.Nav("#nav-tabs");app.nav.bindTo(app.state);app.router.add({"/":[app.net.ExampleController,"home"],"/sign-in":[app.net.AuthenticationController,"signIn"],"/sign-in/submit":[app.net.AuthenticationController,"signInSubmit"],"/sign-out":[app.net.AuthenticationController,"signOut"],"/welcome":[app.net.AuthenticationController,"welcome"],"/example/{variable}":[app.net.ExampleController,
"example",{foo:1}],"/lang":[app.net.ExampleController,"lang"]});app.loadingIndicator=a.ui.LoadingIndicator.init()});app.showErrors=function(a){return this.viewManager.load(null,app.ui.views.ErrorsView,{errors:a},900)};app.onOfflineAjax=function(){plugins.notification.alert(a.util.Translation.get("error_offline"))}})(Lavaca,Lavaca.$);
(function(a){var c,b={};a.SENSITIVE="sensitive";a.get=function(d){return c.get(d)};a.set=function(d,f,a){c.set(d,f);a&&((f=b[a])||(f=b[a]=[]),f.push(d))};a.clear=function(d){if(d){for(var f=b[d]||[],g=-1,e,h;e=f[++g];)(h=c.get(e))&&h instanceof Lavaca.utils.Disposable&&h.dispose(),c.remove(e);b[d]=[]}else a.init()};a.init=function(){a.dispose();c=new Lavaca.util.Cache};a.dispose=function(){c&&(c.dispose(),c=null)}})(Lavaca.resolve("app.models",!0));
(function(a,c,b,d,f){a.AuthenticationController=c.extend({signIn:function(){return this.view(null,app.ui.views.SignInView,{submitURL:"/sign-in/submit"},1)},signInSubmit:function(d){if("jsmith"==d.username&&"password"==d.password)return this.ajaxThenRedirect({url:"/mock/signin.json"},function(d){app.state.set("user",new f(d),f.SENSITIVE);return"/welcome"});app.showErrors(this.translate("error_auth"));return(new b(this)).reject()},signOut:function(){app.state.clear(f.SENSITIVE);return this.ajaxThenRedirect({url:"/mock/signout.json"},
function(){return"/"})},welcome:function(d,a){var b=app.state.get("user");return b?this.view(null,app.ui.views.WelcomeView,b).then(this.history(a,"Welcome",d.url)):this.redirect("/")}})})(Lavaca.resolve("app.net",!0),Lavaca.mvc.Controller,Lavaca.util.Promise,Lavaca.$,Lavaca.mvc.Model);
(function(a,c,b){a.ExampleController=c.extend({home:function(d,a){a||(a={});return this.view("home",app.ui.views.HomeView,a).then(this.history(a,"Home Page",d.url))},example:function(d,a){var c=new b(this),e=new b(this),h;a||(a={bg:"cherry"==d.variable?"rgba(255,0,0,.1)":"banana"==d.variable?"rgba(255,255,0,.1)":"rgba(0,255,0,.1)",fruit:this.translate(d.variable)},d.confirm&&(a.confirm=this.translate(d.confirm)));e.success(function(){c.when(this.view(null,app.ui.views.ExampleView,a).then(this.history(a,
this.translate("hello",[a.fruit]),d.url)))}).error(function(){this.redirect("/")});a.confirm?(h=[{name:this.translate("yes"),exec:e.rejector()},{name:this.translate("no"),exec:e.resolver()}],e.when(plugins.notification.confirm("",a.confirm,h))):e.resolve();return c},lang:function(a){a=a.locale||"en_US";Lavaca.util.Translation.setDefault(a);localStorage.setItem("app:lang",a);this.viewManager.flush();app.state.set("lang",a);return this.redirect("/?lang={0}",[a])}})})(Lavaca.resolve("app.net",!0),Lavaca.mvc.Controller,
Lavaca.util.Promise,Lavaca.$);
(function(a,c,b){a.Nav=b.extend({template:"nav",bindTo:function(a){this.model=a.on("change","user",this.redraw,this).on("change","lang",this.redraw,this);this.redraw()},redraw:function(){var a=this.model.get("user"),b=this.el,g=a?"auth":"unauth",e=a?"unauth":"auth";Lavaca.ui.Template.render(this.template,a||{}).then(function(a){b.html(a);b.find("a[data-"+g+"-url], a[data-"+g+"-text]").each(function(a,b){var b=c(b),d=b.attr("href"),f=b.attr("data-"+g+"-url")||d,h=b.text(),k=b.attr("data-"+g+"-text")||
h;b.attr("data-"+e+"-url",d).attr("href",f).attr("data-"+e+"-text",h).text(k)})})}})})(Lavaca.resolve("app.ui",!0),Lavaca.$,Lavaca.ui.Widget);
(function(a,c,b){a.BaseView=b.extend(function(){b.apply(this,arguments);this.mapWidget(".scrollable",Lavaca.ui.Scrollable).mapEvent(".cancel","tap",this.onTapCancel)},{column:0,template:"default",animation:"slide",onRenderSuccess:function(a){b.prototype.onRenderSuccess.apply(this,arguments);app.animations&&this.shell.addClass(this.animation)},onTapCancel:function(a){a.preventDefault();app.viewManager.dismiss(a.currentTarget)},enter:function(a,c){return b.prototype.enter.apply(this,arguments).then(function(){if(app.animations&&
(0<this.layer||0<c.length)){if(this.shell.removeClass("reverse"),c.length||a[0].childNodes.length){if(void 0!==this.column)for(var b=-1,e;e=c[++b];)e.layer==this.layer&&(void 0!==e.column&&e.column>this.column)&&(this.shell.addClass("reverse"),e.shell.addClass("reverse"));this.shell.removeClass("out").addClass("in")}}else this.shell.addClass("show")})},exit:function(a,c){if(app.animations&&(0<this.layer||0<c.length)){this.shell.removeClass("reverse");var g=this,e=new Lavaca.util.Promise(this);this.shell.nextAnimationEnd(function(a){g.shell.removeClass("in out show");
b.prototype.exit.apply(g,arguments).then(function(){e.resolve()})}).removeClass("in").addClass("out");return e}this.shell.removeClass("show");return b.prototype.exit.apply(this,arguments)}})})(Lavaca.resolve("app.ui.views",!0),Lavaca.$,Lavaca.mvc.View);
(function(a,c,b){a.PopoverView=b.extend({animation:"pop",overlayAnimation:"fade",overlayWrapper:function(){return c('<div class="ui-blocker"></div>')},onRenderSuccess:function(a){b.prototype.onRenderSuccess.apply(this,arguments);app.animations&&this.overlay.addClass(this.overlayAnimation)},render:function(){this.overlay&&this.overlay.remove();this.overlay=this.overlayWrapper();this.overlay.attr("data-layer-index",this.layer);this.overlayClassName&&this.overlay.addClass(this.overlayClassName);return b.prototype.render.apply(this,
arguments)},insertInto:function(a){var c=this.el.parent()[0]!=a[0];b.prototype.insertInto.apply(this,arguments);c&&this.overlay.insertBefore(this.shell)},enter:function(a,c){app.animations&&this.overlay.removeClass("out").addClass("in");return b.prototype.enter.apply(this,arguments)},exit:function(a,f){app.animations&&this.overlay.nextAnimationEnd(function(a){c(a.currentTarget).remove()}).removeClass("in").addClass("out");return b.prototype.exit.apply(this,arguments)}})})(app.ui.views,Lavaca.$,app.ui.views.BaseView);
(function(a,c,b){a.ScrollableView=b.extend(function(){b.apply(this,arguments);this.mapWidget("self",Lavaca.ui.Scrollable)})})(app.ui.views,Lavaca.$,app.ui.views.BaseView);(function(a,c,b){a.ErrorsView=b.extend({column:1,template:"errors",className:"errors"})})(app.ui.views,Lavaca.$,app.ui.views.PopoverView);(function(a,c,b){a.ExampleView=b.extend({column:1,template:"example",className:"example"})})(app.ui.views,Lavaca.$,app.ui.views.ScrollableView);
(function(a,c,b){a.HomeView=b.extend({column:0,template:"home",className:"home"})})(app.ui.views,Lavaca.$,app.ui.views.ScrollableView);
(function(a,c,b,d){var f=Lavaca.ui.Form.extend({onSubmitSuccess:function(a){app.router.exec("/sign-in/submit",null,a)},onSubmitError:function(a){var b=[],c,f,j,i;for(j in a){i=a[j];for(c=-1;f=i.messages[++c];)b.push(d.StringUtils.format(d.Translation.get(f),i.label))}app.showErrors(b)}});a.SignInView=b.extend(function(){b.apply(this,arguments);this.mapWidget("form",f)},{template:"sign-in",className:"sign-in popover",animation:"slide-up"})})(app.ui.views,Lavaca.$,app.ui.views.BaseView,Lavaca.util);
(function(a,c,b){a.WelcomeView=b.extend({column:0,template:"welcome",className:"welcome"})})(app.ui.views,Lavaca.$,app.ui.views.ScrollableView);
