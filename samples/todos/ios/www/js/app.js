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
(function(c){c.net.History.overrideStandardsMode();window.app=new c.mvc.Application(function(){c.net.Connectivity.registerOfflineAjaxHandler(app.onOfflineAjax);app.models.init();app.models.set("todos",new app.models.TodosCollection("todos"));app.router.add({"/":[app.net.TodosController,"home"],"/todo/clear-done":[app.net.TodosController,"clear"],"/todo/remove/{cid}":[app.net.TodosController,"remove"],"/todo/add":[app.net.TodosController,"add"],"/todo/edit/{cid}":[app.net.TodosController,"edit"],"/todo/mark/{cid}":[app.net.TodosController,
"mark"],"/lang":[app.net.TodosController,"lang"]});c.delay(function(){window.scrollTo(0,0)},this,200)});app.showErrors=function(c){return this.viewManager.load(null,app.ui.views.ErrorsView,{errors:c},900)};app.onOfflineAjax=function(){plugins.notification.alert(c.util.Translation.get("error_offline"))}})(Lavaca,Lavaca.$);
(function(c){var e,d={};c.SENSITIVE="sensitive";c.get=function(a){return e.get(a)};c.set=function(a,b,f){e.set(a,b);f&&((b=d[f])||(b=d[f]=[]),b.push(a))};c.clear=function(a){if(a){for(var b=d[a]||[],f=-1,g,h;g=b[++f];)(h=e.get(g))&&h instanceof Lavaca.utils.Disposable&&h.dispose(),e.remove(g);d[a]=[]}else c.init()};c.init=function(){c.dispose();e=new Lavaca.util.Cache};c.dispose=function(){e&&(e.dispose(),e=null)}})(Lavaca.resolve("app.models",!0));
(function(c,e,d,a){c.StoredCollection=d.extend(function(b,a,c){this.store=new this.TStore(b);b=this.store.all();d.call(this,a?b.concat(a):b,c);this.on("addItem",this.onAddItem,this).on("changeItem",this.onChangeItem,this).on("removeItem",this.onRemoveItem,this)},{TStore:a,storeItem:function(b){this.store.set(b.id(),b)},unstoreItem:function(b){this.store.remove(b.id())},onAddItem:function(b){this.storeItem(b.model)},onChangeItem:function(b){this.storeItem(b.model)},onRemoveItem:function(b){this.unstoreItem(b.model)}})})(app.models,
Lavaca.$,Lavaca.mvc.Collection,Lavaca.storage.LocalStore);(function(c,e){c.Todo=e.extend({idAttribute:"cid"})})(Lavaca.resolve("app.models",!0),Lavaca.mvc.Model);
(function(c,e,d){c.TodosCollection=d.extend(function(){d.apply(this,arguments);this.updateCounts()},{TModel:c.Todo,itemsLeft:function(){return this.filter({done:!1})},itemsCompleted:function(){return this.filter({done:!0})},clearDone:function(){for(var a=this.filter({done:!0}),b,f=-1;b=a[++f];)this.remove(b)},removeTodo:function(a){this.remove({cid:a})},addTodo:function(a){return this.add({text:a,done:!1,cid:(new Date).getTime()})},editTodo:function(a,b){var f=this.first({cid:a});f&&f.set("text",
b);return f},markTodo:function(a,b){var f=this.first({cid:a});f&&f.set("done",b);return f},onAddItem:function(a){d.prototype.onAddItem.apply(this,arguments);this.updateCounts()},onChangeItem:function(a){d.prototype.onChangeItem.apply(this,arguments);this.updateCounts()},onRemoveItem:function(a){d.prototype.onRemoveItem.apply(this,arguments);this.updateCounts()},updateCounts:function(){this.set("doneCount",this.filter({done:!0}).length);this.set("remainingCount",this.filter({done:!1}).length);this.set("hasDone",
0<this.doneCount);this.set("hasRemaining",0<this.remainingCount);this.set("count",this.count())}})})(app.models,Lavaca.$,app.models.StoredCollection);
(function(c,e,d,a){c.TodosController=e.extend({home:function(b,a){return this.view("home",app.ui.views.TodosView,app.models.get("todos")).then(this.history(a,"Lavaca Todos",b.url))},clear:function(){app.models.get("todos").clearDone();return(new a(this)).resolve()},remove:function(b){app.models.get("todos").removeTodo(b.cid);return(new a(this)).resolve()},add:function(b){b=app.models.get("todos").addTodo(b.text);return(new a(this)).resolve(b)},edit:function(b){var c=app.models.get("todos"),d=new a(this);
c.editTodo(b.cid,b.text)?d.resolve():d.reject();return d},mark:function(b){var c=app.models.get("todos"),d=new a(this);c.markTodo(b.cid,b.done)?d.resolve():d.reject();return d},lang:function(b){b=b.locale||"en_US";Lavaca.util.Translation.setDefault(b);localStorage.setItem("app:lang",b);this.viewManager.flush();app.state.set("lang",b);return this.redirect("/?lang={0}",[b])}})})(Lavaca.resolve("app.net",!0),Lavaca.mvc.Controller,app.models.TodosCollection,Lavaca.util.Promise,Lavaca.$);
(function(c,e,d){c.BaseView=d.extend(function(){d.apply(this,arguments);this.mapWidget(".scrollable",Lavaca.ui.Scrollable).mapEvent(".cancel","tap",this.onTapCancel)},{column:0,template:"default",animation:"slide",onRenderSuccess:function(a){d.prototype.onRenderSuccess.apply(this,arguments);app.animations&&this.shell.addClass(this.animation)},onTapCancel:function(a){a.preventDefault();app.viewManager.dismiss(a.currentTarget)},enter:function(a,b){return d.prototype.enter.apply(this,arguments).then(function(){if(app.animations&&
(0<this.layer||0<b.length)){if(this.shell.removeClass("reverse"),b.length||a[0].childNodes.length){if(void 0!==this.column)for(var c=-1,d;d=b[++c];)d.layer==this.layer&&(void 0!==d.column&&d.column>this.column)&&(this.shell.addClass("reverse"),d.shell.addClass("reverse"));this.shell.removeClass("out").addClass("in")}}else this.shell.addClass("show")})},exit:function(a,b){if(app.animations&&(0<this.layer||0<b.length)){this.shell.removeClass("reverse");var c=this,e=new Lavaca.util.Promise(this);this.shell.nextAnimationEnd(function(b){c.shell.removeClass("in out show");
d.prototype.exit.apply(c,arguments).then(function(){e.resolve()})}).removeClass("in").addClass("out");return e}this.shell.removeClass("show");return d.prototype.exit.apply(this,arguments)}})})(Lavaca.resolve("app.ui.views",!0),Lavaca.$,Lavaca.mvc.View);(function(c,e,d){c.ScrollableView=d.extend(function(){d.apply(this,arguments);this.mapWidget("self",Lavaca.ui.Scrollable)})})(app.ui.views,Lavaca.$,app.ui.views.BaseView);
(function(c,e,d){c.TodosView=d.extend(function(){d.apply(this,arguments);this.mapEvent({"#new-todo":{keypress:this.updateInput},"input[type=checkbox]":{tap:this.toggleDone},".todo":{dblclick:this.toggleEdit,swipe:this.toggleEdit},".text-edit":{keypress:this.editTodo,blur:this.editTodo},model:{addItem:this.drawTodo,removeItem:this.redrawTodo,changeItem:this.redrawTodo}})},{column:0,template:"todos",className:"todos",updateScroll:function(){var a,b;for(a in this.widgets)b=this.widgets[a],b instanceof
Lavaca.ui.Scrollable&&b.refresh()},updateInput:function(a){if(13==a.keyCode){var b=e(a.currentTarget);app.router.exec("/todo/add",null,{text:b.val()}).then(function(){b.val("")})}},redrawMeta:function(a){var b=this.el.find(".todo-meta"),c=this;Lavaca.ui.Template.render("todo-meta",a.currentTarget.toObject()).then(function(a){b.html(a);c.updateScroll()})},redrawTodo:function(a){var b=this.el.find('li[data-cid="'+a.model.get("cid")+'"]'),c=this;"removeItem"==a.type?b.remove():Lavaca.ui.Template.render("todo",
a.model.toObject()).then(function(a){b.replaceWith(a);c.updateScroll()});this.redrawMeta(a)},drawTodo:function(a){var b=this.el.find(".todo-list"),c=this;Lavaca.ui.Template.render("todo",a.model.toObject()).then(function(a){b.append(a);c.updateScroll()});this.redrawMeta(a)},toggleDone:function(a){var b=e(a.currentTarget).parent(),a=b.attr("data-cid"),b=b.hasClass("done");app.router.exec("/todo/mark/"+a,null,{done:!b})},editTodo:function(a){if(!(a.which&&13!=a.which))if(13==a.which)e(a.currentTarget).blur();
else{var a=e(a.currentTarget),b=a.parent().toggleClass("edit").attr("data-cid"),c=a.val();a.remove();app.router.exec("/todo/edit/"+b,null,{text:c})}},toggleEdit:function(a){var a=e(a.currentTarget).toggleClass("edit"),b;a.hasClass("edit")&&(b=a.find("label").text(),a.append('<input type="text" class="text-edit" value="'+b+'">'),a.find(".text-edit").focus())}})})(app.ui.views,Lavaca.$,app.ui.views.ScrollableView);
