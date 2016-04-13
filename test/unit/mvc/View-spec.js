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
    expect(testView instanceof View).to.equal(true);
  });
  it('can be initialized with an el, a model and a parentView', function() {
    var parentView = new View(el, model);
    testView = new View(el, model, parentView);
    expect(testView.el).to.equal(el);
    expect(testView.model).to.equal(model);
    expect(testView.parentView).to.equal(parentView);
  });
  it('can be initialized with different values for layer', function() {
    var view1 = new View(el, model);
    var view2 = new View(el, model, 2);
    expect(view1.layer).to.equal(0);
    expect(view2.layer).to.equal(2);
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
      sinon.spy(handler, 'fn');
    });
    it('with the same model as the parent view', function() {
      testView.mapChildView('.childView', View);
      testView.createChildViews();
      var childView = values(testView.childViews)[0];
      expect(childView instanceof View).to.equal(true);
      expect(childView.model).to.equal(testView.model);
    });
    it('with a custom model', function() {
      var model = new Model({color: 'red'});
      testView.mapChildView('.childView', View, model);
      testView.createChildViews();
      var childView = values(testView.childViews)[0];
      expect(childView instanceof View).to.equal(true);
      expect(childView.model).to.equal(model);
    });
    it('with a function that returns a model', function() {
      multiChildView.mapChildView('.childView', View, handler.fn);
      multiChildView.createChildViews();
      expect(handler.fn.callCount).to.equal(2);
      var childViews = values(multiChildView.childViews);
      expect(childViews[0].model.index).to.equal(0);
      expect(childViews[0].model.id).to.equal('abc');
      expect(childViews[1].model.index).to.equal(1);
      expect(childViews[1].model.id).to.equal('def');
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
      expect(childViews.length).to.equal(3);
      expect(childViews[0].model.color).to.equal('blue');
      expect(childViews[1].model).to.equal(multiChildView.model);
      expect(childViews[2].model.color).to.equal('purple');
    });
  });
  it('can be rendered', function(done) {
    var TestView = class extends View {
      generateHtml() {
        return '<h2>Hello World</h2><p>Color is blue.</p>';
      }
    };
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<h2>Hello World</h2><p>Color is blue.</p>');
      done();
    });
  });
  it('can redraw whole view', function(done) {
    var TestView = class extends View {
      generateHtml() {
        return '<h2>Hello World</h2><p>Color is ' + this.model.color + '.</p>';
      }
    };
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<h2>Hello World</h2><p>Color is blue.</p>');
      model.color = 'red';
      return testView.render();
    }).then(function() {
      expect($(testView.el).html()).to.equal('<h2>Hello World</h2><p>Color is red.</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw whole view using a custom model', function(done) {
    var TestView = class extends View {
      generateHtml(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p>';
      }
    };

    var otherModel = new Model({color: 'orange'});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p>');
      return testView.render(otherModel);
    }).then(function() {
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is orange.</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw part of a based on a selector', function(done) {
    var TestView = class extends View {
      generateHtml(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    };

    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.color = 'orange';
      model.primary = false;
      return testView.render('p.redraw');
    }).then(function() {
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw part of a based on a selector with a custom model', function(done) {
    var TestView = class extends View {
      generateHtml(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    };

    var otherModel = new Model({color: 'orange', primary: false});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      return testView.render('p.redraw', otherModel);
    }).then(function() {
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render without redrawing', function(done) {
    var TestView = class extends View {
      generateHtml(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    };

    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.color = 'orange';
      model.primary = false;
      return testView.render(false);
    }).then(function(html) {
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      expect(html).to.equal('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render using a custom model without redrawing', function(done) {
    var TestView = class extends View {
      generateHtml(model) {
        return '<p class="redraw">Color is ' + model.color + '.</p><p>It is ' + (model.primary ? '' : 'not ') + 'primary</p>';
      }
    };

    var otherModel = new Model({color: 'orange', primary: false});
    testView = new TestView(el, model);
    testView.render().then(function() {
      expect(testView.hasRendered).to.equal(true);
      expect($(testView.el).length).to.equal(1);
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      return testView.render(false, otherModel);
    }).then(function(html) {
      expect($(testView.el).html()).to.equal('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      expect(html).to.equal('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can map an event', function(done) {
    var TestView = class extends View {
      constructor(...args) {
        super(...args);

        this.mapEvent({
          'input': {
            'click': function() {
              done();
            }
          }
        });
      }

      generateHtml() {
        return '<input type="button" value="Click here!"></input>';
      }
    };

    testView = new TestView(el, new Model());
    testView.render().then(function() {
      testView.el.find('input').trigger('click');
    });
  });
  it('always binds mapped event handlers to itself (`this` === View instance)', function(done) {
    var TestView = class extends View {
      constructor(...args) {
        super(...args);

        var id = this.id;

        this.mapEvent({
          'input': {
            'click': function() {
              expect(this.id).to.equal(id);
              done();
            }
          }
        });
      }

      generateHtml() {
        return '<input type="button" value="Click here!"></input>';
      }
    };

    testView = new TestView(el, new Model());
    testView.render().then(function() {
      testView.el.find('input').trigger('click');
    });
  });
  it('can map a widget', function(done) {
    var TestView = class extends View {
      generateHtml() {
        return '<div class="widget" id="widget"></div>';
      }
    };

    var MyWidget = class extends Widget {
      constructor(...args) {
        super(...args);
        this.testProp = 'abc';
      }
    };

    testView = new TestView(el, new Model());
    testView.mapWidget('.widget', MyWidget);
    testView.render().then(function() {
      expect(testView.widgets['widget'].testProp).to.equal('abc');
      done();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can map a widget with custom arguments', function(done) {
    var TestView = class extends View {
      generateHtml() {
        return '<div class="widget" id="widget"></div><div class="other-widget" id="other-widget"></div>';
      }
    };

    var MyWidget = class extends Widget {
      constructor(el, testProp) {
        super(el, testProp);
        this.testProp = testProp;
      }
    };

    var MyOtherWidget = class extends Widget {
      constructor(el, testStr, testInt) {
        super(el, testStr, testInt);
        this.testStr = testStr;
        this.testInt = testInt;
      }
    };

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
      expect(testView.widgets['widget'].testProp).to.equal('xyz');
      expect(testView.widgets['other-widget'].testStr).to.equal('qwert');
      expect(testView.widgets['other-widget'].testInt).to.equal(12345);
      done();
    }).catch(function(e) {
      fail(e);
      done();
    });

    $('script[data-name="model-tmpl"]').remove();
  });
});
