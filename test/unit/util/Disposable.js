define(function(require) {

  var Disposable = require('lavaca/util/Disposable');

  var Type,
      ob;

  describe('A Disposable', function() {
    beforeEach(function() {
      Type = Disposable.extend({
        foo: 'bar',
        oof: 'rab'
      });
      ob = new Type();
      ob.bool = true;
      ob.str = 'A String';
      ob.num = 1;
      ob.obj = {
        item0: 1,
        item1: 2
      };
    });
    it('provides a dispose function', function() {
      expect(typeof ob.dispose ==='function').toEqual(true);
    });
  });

});
