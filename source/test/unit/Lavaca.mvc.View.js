(function(View, Model, $) {

describe('A View', function() {
  var testView,
      model = new Model({color: 'blue', primary: true}),
      eventMap = {
        tap: {delegate: '.button', callback: function() {}}
      },
      widgetMap = {
        'self': Lavaca.ui.Form
      };
  beforeEach(function() {
    $('body').append('<script type="text/dust-template" data-name="hello-world"><form>Hello World <input type="text"><div class="button">Button</div></form></script>');
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
});

})(Lavaca.resolve('Lavaca.mvc.View', true), Lavaca.resolve('Lavaca.mvc.Model', true), Lavaca.$);