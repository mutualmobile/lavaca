var View = require('lavaca/mvc/View');
var Model = require('lavaca/mvc/Model');
var Widget = require('lavaca/ui/Widget');
var values = require('mout/object/values');

describe('A View', function() {
  var testView,
      el,
      model;
  beforeEach(function() {
    el = $('<div><div class="childView"></div></div>');
    model = new Model({color: 'blue', primary: true});
    testView = new View(el);
  });
  afterEach(function() {
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
      spyOn(handler, 'fn').and.callThrough();
    });
    it('with the same model as the parent view', function() {
      testView.mapChildView('.childView', View);
      testView.createChildViews();
      var childView = values(testView.childViews)[0];
      expect(childView instanceof View).toEqual(true);
      expect(childView.model).toBe(testView.model);
    });
    it('with a custom model', function() {
      var model = new Model({color: 'red'});
      testView.mapChildView('.childView', View, model);
      testView.createChildViews();
      var childView = values(testView.childViews)[0];
      expect(childView instanceof View).toEqual(true);
      expect(childView.model).toBe(model);
    });
    it('with a function that returns a model', function() {
      multiChildView.mapChildView('.childView', View, handler.fn);
      multiChildView.createChildViews();
      expect(handler.fn).toHaveBeenCalledTimes(2);
      var childViews = values(multiChildView.childViews);
      expect(childViews[0].model.get('index')).toBe(0);
      expect(childViews[0].model.get('id')).toBe('abc');
      expect(childViews[1].model.get('index')).toBe(1);
      expect(childViews[1].model.get('id')).toBe('def');
    });
    it('from a hash', function() {
      multiChildView.mapChildView({
        '.childView': {
          TView: View
        },
        '.altChild1': {
          TView: View,
          model: new Model({color: 'purple'})
        },
        '[data-id="abc"]': {
          TView: View,
          model: new Model({color: 'orange'})
        }
      });
      multiChildView.createChildViews();
      var childViews = values(multiChildView.childViews);
      // [data-id="abc"] matches '.childView' too, which has already been
      // initialized. it won't be initialized a second time
      expect(childViews.length).toEqual(3);
      expect(childViews[0].model.get('color')).toEqual('blue');
      expect(childViews[1].model).toBe(multiChildView.model);
      expect(childViews[2].model.get('color')).toEqual('purple');
    });
  });
  it('can be rendered', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function() {
        return '<h2>Hello World</h2><p>Color is blue.</p>';
      }
    });
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
      done();
    });
  });
  it('can redraw whole view', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function() {
        return '<h2>Hello World</h2><p>Color is ' + this.model.get('color') + '.</p>';
      }
    });
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
      model.set('color', 'red');
      return testView.render();
    }).then(function() {
      expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is red.</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw whole view using a custom model', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p>';
      }
    });

    var otherModel = new Model({color: 'orange'});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p>');
      return testView.render(otherModel);
    }).then(function() {
      expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw part of a based on a selector', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    });

    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.set('color', 'orange');
      model.set('primary', false);
      return testView.render('p.redraw');
    }).then(function() {
      expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw part of a based on a selector with a custom model', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    });

    var otherModel = new Model({color: 'orange', primary: false});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      return testView.render('p.redraw', otherModel);
    }).then(function() {
      expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render without redrawing', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    });

    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.set('color', 'orange');
      model.set('primary', false);
      return testView.render(false);
    }).then(function(html) {
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render using a custom model without redrawing', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    });

    var otherModel = new Model({color: 'orange', primary: false});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($(testView.el).length).toBe(1);
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      return testView.render(false, otherModel);
    }).then(function(html) {
      expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can map an event', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);

      this.mapEvent({
        'input': {
          'click': function() {
            done();
          }
        }
      });
    },
    {
      generateHtml: function() {
        return '<input type="button" value="Click here!"></input>';
      }
    });

    testView = new TestView(el, new Model());
    testView.render().then(function() {
      testView.el.find('input').trigger('click');
    });
  });
  it('always binds mapped event handlers to itself (`this` === View instance)', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);

      var id = this.id;

      this.mapEvent({
        'input': {
          'click': function() {
            expect(this.id).toEqual(id);
            done();
          }
        }
      });
    },
    {
      generateHtml: function() {
        return '<input type="button" value="Click here!"></input>';
      }
    });

    testView = new TestView(el, new Model());
    testView.render().then(function() {
      testView.el.find('input').trigger('click');
    });
  });
  it('can map a widget', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function() {
        return '<div class="widget" id="widget"></div>';
      }
    });

    var MyWidget = Widget.extend(function MyWidget() {
      Widget.apply(this, arguments);
      this.testProp = 'abc';
    });

    testView = new TestView(el, new Model());
    testView.mapWidget('.widget', MyWidget);
    testView.render().then(function() {
      expect(testView.widgets['widget'].testProp).toEqual('abc');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can map a widget with custom arguments', function(done) {
    var TestView = View.extend(function() {
      View.apply(this, arguments);
    },
    {
      generateHtml: function() {
        return '<div class="widget" id="widget"></div><div class="other-widget" id="other-widget"></div>';
      }
    });

    var MyWidget = Widget.extend(function MyWidget(el, testProp) {
      Widget.apply(this, arguments);
      this.testProp = testProp;
    });

    var MyOtherWidget = Widget.extend(function MyOtherWidget(el, testStr, testInt) {
      Widget.apply(this, arguments);
      this.testStr = testStr;
      this.testInt = testInt;
    });

    testView = new TestView(el, new Model());
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
      expect(testView.widgets['widget'].testProp).toEqual('xyz');
      expect(testView.widgets['other-widget'].testStr).toEqual('qwert');
      expect(testView.widgets['other-widget'].testInt).toEqual(12345);
      done();
    }).catch(function(e) {
      fail(e);
      done();
    });

    $('script[data-name="model-tmpl"]').remove();
  });
});
