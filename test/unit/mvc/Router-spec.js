
//var $ = require('$');
var router = require('lavaca/mvc/Router');
var viewManager = require('lavaca/mvc/ViewManager');
var Controller = require('lavaca/mvc/Controller');

var ob = {
      foo: function() {}
    };

module.exports = describe('A Router', function() {
  beforeEach(function(){
    $('body').append('<div id="view-root"></div>');
    viewManager = new viewManager.constructor('#view-root');
    router = new router.constructor(viewManager);
    sinon.spy(ob, 'foo');
  });
  afterEach(function(){
    $('#view-root').remove();
    ob.foo.restore();
  });
  it('can add routes', function() {
    router.add({
      '/foo/{param1}': [Controller, 'foo', {}],
      '/bar/{param1}': [Controller, 'bar', {}]
    });
    router.add('/foobar/{param1}', Controller, 'foobar', {});
    expect(router.routes.length).to.equal(3);
  });
  it('can exec routes that delegate to a controller', function(done) {
    var testController = Controller.extend(ob);

    router.add('/foo/{param}', testController, 'foo', {});
    router.exec('/foo/bar', null, {one: 1}).then(function() {
      expect(ob.foo.args[0][0].param).to.equal('bar');
      expect(ob.foo.args[0][0].one).to.equal(1);
      expect(ob.foo.args[0][1]).to.be.undefined;
      done();
    });
  });
});

