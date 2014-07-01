define(function(require) {

  var $ = require('$');
  var View = require('lavaca/mvc/View');
  var Model = require('lavaca/mvc/Model');
  var Template = require('lavaca/ui/Template');
  var Widget = require('lavaca/ui/Widget');

  describe('A View', function() {
    var testView,
        el,
        model;
    beforeEach(function() {
      el = $('<div><div class="childView"></div></div>');
      $('body').append('<script type="text/dust-template" data-name="hello-world"><form>Hello World <input type="text"><div class="button">Button</div></form></script>');
      model = new Model({color: 'blue', primary: true});
      Template.init();
      testView = new View(el);
    });
    afterEach(function() {
      $('script[data-name="hello-world"]').remove();
      testView.dispose();
    });
    it('can be initialized', function() {
      expect(testView instanceof View).toEqual(true);
    });
    it('can be initialized with an el, a model and a parentView', function() {
      var parentView = new View(el, model);
      testView = new View(el, model, parentView);
      expect(testView.el).toEqual(el);
      expect(testView.model).toEqual(model);
      expect(testView.parentView).toBe(parentView);
    });
    it('can be initialized with different values for layer', function() {
      var view1 = new View(el, model);
      var view2 = new View(el, model, 2);
      expect(view1.layer).toEqual(0);
      expect(view2.layer).toEqual(2);
    });
    describe('can map childViews', function() {
      var multiChildEl,
          multiChildView,
          handler;
      beforeEach(function() {
        multiChildEl = $(['<div>',
                          '<div class="childView" data-id="abc"></div>',
                          '<div class="childView" data-id="def"></div>',
                          '<div class="altChild1"></div>',
                          '<div class="altChild2"></div>',
                          '</div>'].join());
        multiChildView = new View(multiChildEl, model);
        handler = {
          fn: function(index, el) {
            return new Model({index: index, id: $(el).attr('data-id')});
          }
        };
        spyOn(handler, 'fn').andCallThrough();
      });
      it('with the same model as the parent view', function() {
        testView.mapChildView('.childView', View);
        testView.createChildViews();
        var childView = testView.childViews.toArray()[0];
        expect(childView instanceof View).toEqual(true);
        expect(childView.model).toBe(testView.model);
      });
      it('with a custom model', function() {
        var model = new Model({color: 'red'});
        testView.mapChildView('.childView', View, model);
        testView.createChildViews();
        var childView = testView.childViews.toArray()[0];
        expect(childView instanceof View).toEqual(true);
        expect(childView.model).toBe(model);
      });
      it('with a function that returns a model', function() {
        multiChildView.mapChildView('.childView', View, handler.fn);
        multiChildView.createChildViews();
        expect(handler.fn.callCount).toEqual(2);
        var childViews = multiChildView.childViews.toArray();
        expect(childViews[0].model.get('index')).toBe(0);
        expect(childViews[0].model.get('id')).toBe('abc');
        expect(childViews[1].model.get('index')).toBe(1);
        expect(childViews[1].model.get('id')).toBe('def');
      });
      it('from a hash', function() {
        multiChildView.mapChildView({
          '.childView': {
            TView: View,
            model: handler.fn
          },
          '.altChild1': {
            TView: View
          },
          '[data-id="abc"]': {
            TView: View,
            model: new Model({color: 'purple'})
          }
        });
        multiChildView.createChildViews();
        var childViews = multiChildView.childViews.toArray();
        expect(childViews.length).toEqual(4);
        expect(childViews[0].model.get('id')).toEqual('abc');
        expect(childViews[2].model).toBe(multiChildView.model);
        expect(childViews[3].model.get('color')).toEqual('purple');
      });
    });
    it('can be rendered', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><h2>Hello World</h2><p>Color is {color}.</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
          done = true;
        });
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can redraw whole view', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><h2>Hello World</h2><p>Color is {color}.</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
          model.set('color', 'red');
          return testView.redraw();
        }).then(function() {
          expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is red.</p>');
          done = true;
        }).catch(function(e) {
          debugger;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can redraw whole view using a custom model', function() {
      var done = false;
      runs(function() {
        var otherModel = new Model({color: 'orange', primary: false});
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          return testView.redraw(otherModel);
        }).then(function() {
          expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can redraw part of a based on a selector', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          model.set('color', 'orange');
          model.set('primary', false);
          return testView.redraw('p.redraw');
        }).then(function() {
          expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can redraw part of a based on a selector with a custom model', function() {
      var done = false;
      runs(function() {
        var otherModel = new Model({color: 'orange', primary: false});
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          return testView.redraw('p.redraw', otherModel);
        }).then(function() {
          expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can re-render without redrawing', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          model.set('color', 'orange');
          model.set('primary', false);
          return testView.redraw(false);
        }).then(function(html) {
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can re-render using a custom model without redrawing', function() {
      var done = false;
      runs(function() {
        var otherModel = new Model({color: 'orange', primary: false});
        $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
        Template.init();

        testView = new View(el, model);
        testView.template = 'model-tmpl';
        testView.render().then(function() {
          expect(testView.hasRendered).toEqual(true);
          expect($(testView.el).length).toBe(1);
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          return testView.redraw(false, otherModel);
        }).then(function(html) {
          expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can map a widget', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="widget-tmpl"><div class="widget" id="widget"></div></script>');
        Template.init();

        var MyWidget = Widget.extend(function MyWidget() {
          Widget.apply(this, arguments);
          this.testProp = 'abc';
        });

        testView = new View(el, new Model());
        testView.template = 'widget-tmpl';
        testView.mapWidget('.widget', MyWidget);
        testView.render().then(function() {
          expect(testView.widgets.get('widget').testProp).toEqual('abc');
          done = true;
        });
        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    it('can map a widget with custom arguments', function() {
      var done = false;
      runs(function() {
        $('body').append('<script type="text/dust-template" data-name="widget-tmpl"><div class="widget" id="widget"></div><div class="other-widget" id="other-widget"></div></script>');
        Template.init();

        var MyWidget = Widget.extend(function MyWidget(el, testProp) {
          Widget.apply(this, arguments);
          this.testProp = testProp;
        });
        var MyOtherWidget = Widget.extend(function MyOtherWidget(el, testStr, testInt) {
          Widget.apply(this, arguments);
          this.testStr = testStr;
          this.testInt = testInt;
        });

        testView = new View(el, new Model());
        testView.template = 'widget-tmpl';
        testView.mapWidget({
          '.widget': {
            TWidget: MyWidget,
            args: 'xyz'
          },
          '.other-widget': {
            TWidget: MyOtherWidget,
            args: ['qwert', 12345]
          }
        });
        testView.render().then(function() {
          expect(testView.widgets.get('widget').testProp).toEqual('xyz');
          expect(testView.widgets.get('other-widget').testStr).toEqual('qwert');
          expect(testView.widgets.get('other-widget').testInt).toEqual(12345);
          done = true;
        });

        $('script[data-name="model-tmpl"]').remove();
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
  });

});
