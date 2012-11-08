(function(View, Model, $) {

describe('A View', function() {
  var testView,
      model,
      eventMap = {
        tap: {delegate: '.button', callback: function() {}}
      },
      widgetMap = {
        'self': Lavaca.ui.Form
      };
  beforeEach(function() {
    $('body').append('<script type="text/dust-template" data-name="hello-world"><form>Hello World <input type="text"><div class="button">Button</div></form></script>');
    model = new Model({color: 'blue', primary: true});
    Lavaca.ui.Template.init();
    testView = new View();
  });
  afterEach(function() {
    $('script[data-name="hello-world"]').remove();
    testView.dispose();
  });
  it('can be initialized', function() {
    expect(testView instanceof View).toEqual(true);
  });
  it('can be initialized with a layer, eventMap, and widgetMap', function() {
    testView = new View(model, 0, eventMap, widgetMap);
    expect(testView.layer).toEqual(0);
    expect(testView.eventMap).toEqual(eventMap);
    expect(testView.widgetMap).toEqual(widgetMap);
  });
  it('can enter the DOM, get rendered, and then exit the DOM', function() {
    var promise;
    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'hello-world';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view').length).toBe(1);
      testView.exit();
      expect($('.view').length).toBe(0);
    });
  });
  it('can initialize a widgetMap', function() {
    var promise;
    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'hello-world';
    promise = testView.enter(document.body);
    promise.success(function() {
      var count = 0;
      testView.widgets.each(function(item){
        count++;
      });
      expect(count).toEqual(1);
      testView.exit();
    });
  });
  it('can redraw whole view', function() {
    var promise;
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><h2>Hello World</h2><p>Color is {color}.</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<h2>Hello World</h2><p>Color is blue.</p>');
      model.set('color', 'red');
      testView.redraw();
      expect($('.view-interior').html()).toBe('<h2>Hello World</h2><p>Color is red.</p>');
      testView.exit();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw whole view using a custom model', function() {
    var promise,
        otherModel = new Model({color: 'orange', primary: false});
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      testView.redraw(otherModel);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
      testView.exit();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can redraw part of a based on a selector', function() {
    var promise;
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.set('color', 'orange');
      model.set('primary', false);
      testView.redraw('p.redraw');
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      testView.exit();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
   it('can redraw part of a based on a selector with a custom model', function() {
    var promise,
        otherModel = new Model({color: 'orange', primary: false});
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      testView.redraw('p.redraw', otherModel);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is orange.</p><p>It is primary</p>');
      testView.exit();
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render without redrawing', function() {
    var promise;
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      model.set('color', 'orange');
      model.set('primary', false);
      testView.redraw(false)
        .then(function(html) {
          expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          testView.exit();
        });
    });
    $('script[data-name="model-tmpl"]').remove();
  });
  it('can re-render using a custom model without redrawing', function() {
    var promise,
        otherModel = new Model({color: 'orange', primary: false});
    $('body').append('<script type="text/dust-template" data-name="model-tmpl"><p class="redraw">Color is {color}.</p><p>It is {^primary}not {/primary}primary</p></script>');
    Lavaca.ui.Template.init();

    testView = new View(model, 0, eventMap, widgetMap);
    testView.template = 'model-tmpl';
    promise = testView.enter(document.body);
    promise.success(function() {
      expect(testView.hasRendered).toEqual(true);
      expect($('.view-interior').length).toBe(1);
      expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
      testView.redraw(false, otherModel)
        .then(function(html) {
          expect($('.view-interior').html()).toBe('<p class="redraw">Color is blue.</p><p>It is primary</p>');
          expect(html).toBe('<p class="redraw">Color is orange.</p><p>It is not primary</p>');
          testView.exit();
        });
    });
    $('script[data-name="model-tmpl"]').remove();
  });
});

})(Lavaca.resolve('Lavaca.mvc.View', true), Lavaca.resolve('Lavaca.mvc.Model', true), Lavaca.$);