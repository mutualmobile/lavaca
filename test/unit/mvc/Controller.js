define(function(require) {

  var $ = require('$');
  var Controller = require('lavaca/mvc/Controller');
  var Model = require('lavaca/mvc/Model');
  var History = require('lavaca/net/History');
  var router = require('lavaca/mvc/Router');
  var viewManager = require('lavaca/mvc/ViewManager');
  var View = require('lavaca/mvc/View');
  var Translation = require('lavaca/util/Translation');
  var Template = require('lavaca/ui/Template');


  var testController,
      ob = {
        foo: function() {}
      };

  describe('A Controller', function() {
    beforeEach(function(){
      $('body').append('<div id="view-root"></div>');
      viewManager = (new viewManager.constructor()).setEl('#view-root');
      router = (new router.constructor()).setViewManager(viewManager);
      spyOn(ob, 'foo').andCallThrough();
      testController = Controller.extend(ob);
      router.add({
        '/foo': [testController, 'foo', {}]
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
          done = false;
      runs(function() {
        controller.exec('foo', params).then(function() {
          expect(ob.foo).toHaveBeenCalled();
          expect(ob.foo.calls[0].args[0].one).toBe(1);
          expect(ob.foo.calls[0].args[0].two).toBe(2);
          done = true;
        });
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    describe('can load a view', function() {
      var noop = {
            success: function() {}
          };
      beforeEach(function(){
        spyOn(noop, 'success');
        $('body').append('<script type="text/dust-template" data-name="hello-world">Hello World</script>');
        Template.init();
      });
      afterEach(function(){
        $('script[data-name="hello-world"]').remove();
      });
      it('with a view helper method', function() {
        var controller = new testController(router, viewManager),
            myPageView = View.extend({
              template: 'hello-world',
            }),
            done = false,
            response;
          runs(function() {
            controller.view('myView', myPageView).then(function() {
              response = viewManager.pageViews.get('myView').hasRendered;
              expect(response).toBe(true);
              done = true;
            });
          });
          waitsFor(function() {
            return !!done;
          }, 'promises to resolve', 100);
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
      expect(current.state).toEqual(model);
      expect(current.title).toEqual('Home Page');
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
            done = false;
        runs(function() {
          controller.redirect('/foo').then(function() {
            expect(ob.foo).toHaveBeenCalled();
            done = true;
          });
        });
        waitsFor(function() {
          return !!done;
        }, 'promises to resolve', 100);
      });
    });
  });

});
