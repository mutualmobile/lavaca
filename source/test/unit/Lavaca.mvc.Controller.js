(function(Controller, Router, ViewManager, $, Promise) { 

var router,
    viewManager,
    testController,
    ob = {
      foo: function() {}
    };

describe('A Controller', function() {
  beforeEach(function(){
    $('body').append('<div id="view-root"></div>');
    viewManager = new ViewManager('#view-root');
    router = new Router(viewManager);
    spyOn(ob, 'foo').andCallThrough();
    testController = Controller.extend(ob);
    router.add({
      '/foo': [testController, 'foo', {}],
    });
  });
  afterEach(function(){
    $('#view-root').remove();
  });
  it('can be instantiated', function() {
    var controller = new testController(router, viewManager);
		expect(controller instanceof testController).toBe(true);
		expect(controller.router).toBe(router);
		expect(controller.viewManager).toBe(viewManager);
  });
  it('can execute an action on itself', function() {
    var controller = new testController(router, viewManager),
        params = {one: 1, two: 2},
        promise = controller.exec('foo', params);
    promise.success(function() {
      expect(ob.foo).toHaveBeenCalled();
      expect(ob.foo.calls[0].args[0].one).toBe(1);
      expect(ob.foo.calls[0].args[0].two).toBe(2);
    });
  });
  it('can make an ajax request', function() {
    var controller = new testController(router, viewManager),
        promise,
        response;
    runs(function() {
      promise = controller.ajax({
        success: new Promise().resolver()
      });
    });
    waitsFor(function() {
      promise.success(function(data) {
        response = data;
      });
      return response;
    }, 'The html to be received', 750);
    runs(function() {
      expect(response).not.toBeUndefined();
    });
  });
  describe('can load a view', function() {
    var noop = {
          success: function() {}
        };
    beforeEach(function(){
      spyOn(noop, 'success');
      $('body').append('<script type="text/dust-template" data-name="hello-world">Hello World</script>');
      Lavaca.ui.Template.init();
    });
    afterEach(function(){
      $('script[data-name="hello-world"]').remove();
    });
    it('with a view helper method', function() {
      var controller = new testController(router, viewManager),
          myView = Lavaca.mvc.View.extend({
            template: 'hello-world'
          }),
          promise,
          response;
        runs(function() {
          promise = controller.view('myView', myView);
        });
        waitsFor(function() {
          promise.success(function() {
            response = this.viewManager.views.get('myView').hasRendered;
          });
          return response;
        }, 'a view to be rendered', 300);
        runs(function() {
          expect(response).toBe(true)
        });
    });
    it('with ajaxThenView helper method', function() {
      var controller = new testController(router, viewManager),
          myView = Lavaca.mvc.View.extend({
            template: 'hello-world'
          }),
          promise,
          response;
      runs(function() {
        promise = controller.ajaxThenView(
          {},
          noop.success,
          'myView', 
          myView
        );
      });
      waitsFor(function() {
        promise.success(function() {
          response = this.viewManager.views.get('myView').hasRendered;
        });
        return response;
      }, 'a view to be rendered', 100);
      runs(function() {
        expect(response).not.toBeUndefined();
        expect(noop.success).toHaveBeenCalled();
      });
    });
  });
  it('can add a state to the browser history', function() {
    var controller = new testController(router, viewManager),
        model = new Lavaca.mvc.Model(),
        history = Lavaca.net.History.init(),
        current,
        promise;
    Lavaca.net.History.overrideStandardsMode();
    (controller.history(model, 'Home Page', window.location.href))();
    current = history.current();
    expect(current.state).toEqual(model);
    expect(current.title).toEqual('Home Page');
  });
  it('can access translated messages', function() {
    var controller = new testController(router, viewManager),
        response;
    $('body').append('<script type="text/x-translation" data-name="en" data-default>{"hello": "Hello {0}!"}</script>');
    Lavaca.util.Translation.init(app.state.get('lang'));
    response = controller.translate('hello', ['Tester']);
    expect(response).toEqual('Hello Tester!');
    $('script[type="text/x-translation"]').remove();
  });
  it('can format urls', function() {
    var controller = new testController(router, viewManager),
        url = '/foo/{0}',
        response;
    response = controller.url(url, ['bar']);
    expect(response).toEqual('/foo/bar');
  });
  describe('can redirect user to another route', function() {
    it('directly', function() {
      var controller = new testController(router, viewManager),
          promise;
      promise = controller.redirect('/foo');
      promise.success(function() {
        expect(ob.foo).toHaveBeenCalled();
      });
    });
    it('after an ajax request', function() {
      var controller = new testController(router, viewManager),
          promise,
          response = true;
      runs(function() {
        promise = controller.ajaxThenRedirect({}, function() {
          return '/foo';
        });
      });
      waitsFor(function() {
        promise.success(function() {
          response = this.foo.wasCalled;
        });
        return response;
      }, 'a redirect to occur', 300);
      runs(function() {
        expect(response).toEqual(true);
      });
    });
  });
});

})(Lavaca.resolve('Lavaca.mvc.Controller', true), Lavaca.resolve('Lavaca.mvc.Router', true), Lavaca.resolve('Lavaca.mvc.ViewManager', true), Lavaca.$, Lavaca.resolve('Lavaca.util.Promise', true));
