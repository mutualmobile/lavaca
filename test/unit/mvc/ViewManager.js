define(function(require) {

  var $ = require('$');
  var View = require('lavaca/mvc/View');
  var Cache = require('lavaca/util/Cache');
  var Template = require('lavaca/ui/Template');
  var viewManager = require('lavaca/mvc/ViewManager');

  describe('A viewManager', function() {
    beforeEach(function(){
      $('body').append('<div id="view-root"></div><script type="text/dust-template" data-name="hello-world">Hello World</script>');
      Template.init();
      viewManager = new viewManager.constructor();
      viewManager.setEl('#view-root');
    });
    afterEach(function(){
      $('#view-root').remove();
      $('script[data-name="hello-world"]').remove();
    });
    it('can be instantiated via its module constructor', function() {
      expect(viewManager instanceof viewManager.constructor).toBe(true);
    });
    it('can load a view', function() {
      var myPageView = View.extend(function(){View.apply(this, arguments);},{
            template: 'hello-world'
          }),
          done = false;
      runs(function() {
        Promise.resolve()
          .then(function() {
            return viewManager.load('myView', myPageView);
          })
          .then(function() {
            var response = viewManager.pageViews.get('myView').hasRendered;
            expect(response).toBe(true);
            done = true;
          });
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });
    describe('can remove', function() {
      it('a view on a layer and all views above', function() {
        var myPageView = View.extend(function(){View.apply(this, arguments);},{
            template: 'hello-world',
            }),
            done = false;

        runs(function() {
          Promise.resolve()
            .then(function() {
              return viewManager.load('myView', myPageView);
            })
            .then(function() {
              return viewManager.load('anotherView', myPageView, null, 1);
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(2);
              return viewManager.dismiss(0);
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(0);
              done = true;
            });
        });
        waitsFor(function() {
          return !!done;
        }, 'promises to resolve', 100);
      });
      it('a view on layer without removing views below', function() {
        var myPageView = View.extend(function(){View.apply(this, arguments);},{
            template: 'hello-world',
            }),
            done = false;
        runs(function() {
          Promise.resolve()
            .then(function() {
              return viewManager.load('myView', myPageView);
            })
            .then(function() {
              return viewManager.load('anotherView', myPageView, null, 1);
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(2);
              return viewManager.dismiss(1);
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(1);
              done = true;
            });
        });
        waitsFor(function() {
          return !!done;
        }, 'promises to resolve', 100);
      });
      it('a layer by an el', function() {
        var myPageView = View.extend(function(){View.apply(this, arguments);},{
              template: 'hello-world',
              className: 'test-view',
            }),
            done = false;
        runs(function() {
          Promise.resolve()
            .then(function() {
              return viewManager.load('myView', myPageView);
            })
            .then(function() {
              return viewManager.dismiss('.test-view');
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(0);
              done = true;
            });
        });
        waitsFor(function() {
          return !!done;
        }, 'promises to resolve', 100);
      });
      it('a layer relative to view object in the cache', function() {
        var myPageView = View.extend(function(){View.apply(this, arguments);},{
              template: 'hello-world',
              className: 'test-view',
            }),
            done = false;
        runs(function() {
          Promise.resolve()
            .then(function() {
              return viewManager.load('myView', myPageView);
            })
            .then(function() {
              return viewManager.dismiss(viewManager.pageViews.get('myView'));
            })
            .then(function() {
              expect($('#view-root').children().length).toBe(0);
              done = true;
            });
        });
        waitsFor(function() {
          return !!done;
        }, 'promises to resolve', 100);
      });
    });
    it('can empty the view cache', function() {
      var myPageView = View.extend(function(){View.apply(this, arguments);},{
              template: 'hello-world',
          }),
          done = false;

      runs(function() {
        Promise.resolve()
          .then(function() {
            return viewManager.load('myView', myPageView);
          })
          .then(function() {
            return viewManager.load('anotherView', myPageView, null, 1);
          })
          .then(function() {
            return viewManager.dismiss(1);
          })
          .then(function() {
            viewManager.flush();
            expect(viewManager.pageViews).toEqual(new Cache());
            expect(viewManager.layers[0].cacheKey).toEqual('myView');
            done = true;
          });
      });
      waitsFor(function() {
        return !!done;
      }, 'promises to resolve', 100);
    });

  });

});
