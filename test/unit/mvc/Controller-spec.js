
//var $ = require('$');
var Controller = require('lavaca/mvc/Controller');
var Model = require('lavaca/mvc/Model');
var History = require('lavaca/net/History');
var router = require('lavaca/mvc/Router');
var viewManager = require('lavaca/mvc/ViewManager');
var View = require('lavaca/mvc/View');


var testController,
    ob = {
      foo: function() {}
    };

module.exports = describe('A Controller', function() {
  beforeEach(function(){
    $('body').append('<div id="view-root"></div>');
    viewManager = (new viewManager.constructor()).setEl('#view-root');
    router = (new router.constructor()).setViewManager(viewManager);
    sinon.spy(ob, 'foo');
    testController = Controller.extend(ob);
    router.add({
      '/foo': [testController, 'foo', {}]
    });
  });
  afterEach(function(){
    $('#view-root').remove();
    ob.foo.restore();
  });
  it('can be instantiated', function() {
    var controller = new testController(router, viewManager);
    expect(controller instanceof testController).to.equal(true);
    expect(controller.router).to.equal(router);
    expect(controller.viewManager).to.equal(viewManager);
  });
  describe('can load a view', function() {
    var noop = {
          success: function() {}
        };
    beforeEach(function(){
      sinon.spy(noop, 'success');
      $('body').append('<script type="text/dust-template" data-name="hello-world">Hello World</script>');
    });
    afterEach(function(){
      $('script[data-name="hello-world"]').remove();
      noop.success.restore();
    });
    it('with a view helper method', function(done) {
      var controller = new testController(router, viewManager),
          myPageView = View.extend({
            template: 'hello-world',
          }),
          response;
      controller.view('myView', myPageView).then(function() {
        response = viewManager.pageViews.get('myView').hasRendered;
        expect(response).to.equal(true);
        done();
      });
    });
  });
  it('can add a state to the browser history', function() {
    var controller = new testController(router, viewManager),
        model = new Model(),
        history = History.init(),
        current;
    History.overrideStandardsMode();
    (controller.history(model, 'Home Page', window.location.href))();
    current = history.current();
    expect(current.state).to.equal(model);
    expect(current.title).to.equal('Home Page');
  });
  it('can format urls', function() {
    var controller = new testController(router, viewManager),
        url = '/foo/{0}',
        response;
    response = controller.url(url, ['bar']);
    expect(response).to.equal('/foo/bar');
  });
  describe('can redirect user to another route', function() {
    it('directly', function(done) {
      var controller = new testController(router, viewManager);
      controller.redirect('/foo').then(function() {
        expect(ob.foo.called).to.be.true;
        done();
      });
    });
  });
});

