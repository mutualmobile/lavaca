define(function(require) {

  var $ = require('$');
  var View = require('lavaca/mvc/View');
  var Model = require('lavaca/mvc/Model');
  var Template = require('lavaca/ui/Template');

  describe('A View', function() {
    var testView,
        el,
        model;
    beforeEach(function() {
      el = $('<div/>');
      $('body')
        .append('<script type="text/dust-template" data-name="hello-world"><form>Hello World <input type="text"><div class="button">Button</div></form></script>')
        .append(el);
      model = new Model({color: 'blue', primary: true});
      Template.init();
      testView = new View();
    });
    afterEach(function() {
      $('script[data-name="hello-world"]').remove();
      el.remove();
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
    });

    it('can redraw whole view', function() {
      var promise;
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><h2>Hello World</h2><p>Color is {color}.</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
        model.set('color', 'red');
        testView.redraw();
        expect($(testView.el).html()).toBe('<h2>Hello World</h2><p>Color is red.</p>');
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    it('can redraw whole view using a custom model', function() {
      var promise,
          otherModel = new Model({color: 'orange', primary: false});
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
        testView.redraw(otherModel);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    it('can redraw part of a based on a selector', function() {
      var promise;
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
        model.set('color', 'orange');
        model.set('primary', false);
        testView.redraw('p.redraw');
        expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    it('can redraw part of a based on a selector with a custom model', function() {
      var promise,
          otherModel = new Model({color: 'orange', primary: false});
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
        testView.redraw('p.redraw', otherModel);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    it('can re-render without redrawing', function() {
      var promise;
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
        model.set('color', 'orange');
        model.set('primary', false);
        testView.redraw(false)
          .then(function(html) {
            expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
            expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          });
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    it('can re-render using a custom model without redrawing', function() {
      var promise,
          otherModel = new Model({color: 'orange', primary: false});
      $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
      Template.init();

      testView = new View(el, model);
      testView.template = 'model-tmpl';
      promise = testView.render();
      promise.success(function() {
        expect(testView.hasRendered).toEqual(true);
        expect($(testView.el).length).toBe(1);
        expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
        testView.redraw(false, otherModel)
          .then(function(html) {
            expect($(testView.el).html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
            expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          });
      });
      $('script[data-name="model-tmpl"]').remove();
    });
    describe('can map events', function() {
      var initWithEventMap = function(map, callback) {
            var myView;
            runs(function() {
              var MyView = View.extend(function MyView() {
                    View.apply(this, arguments);
                    this.mapEvent(map);
                  }, {
                    template: 'hello-world',
                    onRenderSuccess: function() {
                      View.prototype.onRenderSuccess.apply(this, arguments);
                      setTimeout(function() {
                        renderSuccesful = true;
                      });
                    }
                  });
              myView = new MyView(el, model);
              myView.render();
            });
            waitsFor(function() {
              return !!renderSuccesful;
            });
            runs(function() {
              callback(myView);
            });
          },
          renderSuccesful;

      beforeEach(function() {
        renderSuccesful = false;
      });


      it('to it\'s own el', function() {
        var clickHandler = jasmine.createSpy('clickHandler');
        initWithEventMap({
          self: {
            click: clickHandler
          }
        }, function(myView) {
          myView.el.trigger('click');
          expect(clickHandler.callCount).toBe(1);
          myView.dispose();
        });
      });
      it('to a child of it\'s el', function() {
        var formHandler = jasmine.createSpy('formHandler'),
            buttonHandler = jasmine.createSpy('buttonHandler');
        initWithEventMap({
          'form': {
            click: formHandler
          },
          '.button': {
            click: buttonHandler
          }
        }, function(myView) {
          myView.el.find('form').trigger('click');
          expect(formHandler.callCount).toBe(1);
          expect(buttonHandler.callCount).toBe(0);
          myView.dispose();
        });
      });
      it('to it\'s model', function() {
        var changeHandler = jasmine.createSpy('changeHandler'),
            myPropHandler = jasmine.createSpy('myPropHandler'),
            otherPropHandler = jasmine.createSpy('otherPropHandler');
        initWithEventMap({
          model: {
            'change': changeHandler,
            'change.myProp': myPropHandler,
            'change.otherProp': otherPropHandler
          }
        }, function(myView) {
          model.set('myProp', 'test');
          // Make sure model event handlers are
          // removed when the view is disposed
          myView.dispose();
          model.set('myProp', 'test2');
          expect(changeHandler.callCount).toBe(1);
          expect(myPropHandler.callCount).toBe(1);
          expect(otherPropHandler.callCount).toBe(0);
        });
      });
    });
  });
});
