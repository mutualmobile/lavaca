(function(ArrayUtils) { 

var arr;

describe('Lavaca', function() {
  beforeEach(function() {
    arr = [1,2,3,4,2];
  });
  it('has a copy of jQuery or Zepto.js', function() {
    expect(Lavaca.$).toEqual(window.Zepto ? window.Zepto : window.jQuery);
  });
  it('can resolve a global object', function() {
    window.foo = {bar: 1};
    expect(Lavaca.resolve('foo.bar')).toBe(1);
    expect(Lavaca.resolve('foo.zed')).toBeNull();
    expect(Lavaca.resolve('foo.zed', true)).toBeTruthy();
  });
  it('can extend a type', function() {
    var BaseType = Lavaca.extend({
            foo: function() {
              return 'bar';
            },
            bar: function() {
              return 'foo';
            }
          }),
        SubType1 = BaseType.extend({
            bar: function() {
              return 'zed';
            }
          }),
        SubType2 = BaseType.extend(function(v) {
            this.zed = v;
          }, {
            toString: function() {
              return this.zed;
            }
          }),
        base = new BaseType(),
        sub1 = new SubType1(),
        sub2 = new SubType2('value');
    expect(BaseType.extend).toBeTruthy();
    expect(SubType1.extend).toBeTruthy();
    expect(base.foo()).toEqual('bar');
    expect(base.bar()).toEqual('foo');
    expect(sub1.foo()).toEqual('bar');
    expect(sub1.bar()).toEqual('zed');
    expect(sub2.toString()).toEqual('value');
    expect(base instanceof BaseType).toBe(true);
    expect(base instanceof SubType1).toBe(false);
    expect(base instanceof SubType2).toBe(false);
    expect(sub1 instanceof BaseType).toBe(true);
    expect(sub1 instanceof SubType1).toBe(true);
    expect(sub1 instanceof SubType2).toBe(false);
    expect(sub2 instanceof BaseType).toBe(true);
    expect(sub2 instanceof SubType1).toBe(false);
    expect(sub2 instanceof SubType2).toBe(true);
    expect(sub2.zed).toBe('value');
  });
  it('can generate unique numbers', function() {
    var first = Lavaca.uuid(),
        second = Lavaca.uuid();
    expect(first).not.toEqual(second);
  });
  it('can delay a function\'s execution', function() {
    var noop = {bar: 0};
    runs(function() {
      Lavaca.delay(function() {
        noop.bar = 1;
      });
      expect(noop.bar).toEqual(0);
    });
    waitsFor(function() {
      return noop.bar == 1;
    });
    runs(function() {
      expect(noop.bar).toEqual(1);
    });
    runs(function() {
      expect(Lavaca.delay(function() {
        this.bar = 2;
      }, noop)).toBeDefined();
      expect(noop.bar).toEqual(1);
    });
    waitsFor(function() {
      return noop.bar == 2;
    });
    runs(function() {
      expect(noop.bar).toEqual(2);
    });
  });
  it('can clone an object', function() {
    var obj = {foo: 1, bar: {zed: 2}},
        shallow = Lavaca.clone(obj),
        deep = Lavaca.clone(obj, true);
    expect(shallow.foo).toEqual(1);
    expect(shallow.bar === obj.bar).toBe(true);
    expect(deep.foo).toEqual(1);
    expect(deep.bar !== obj.bar).toBe(true);
    expect(deep.bar.zed).toEqual(2);
  });
  it('can merge multiple objects', function() {
    var obj1 = {foo: 1, zed: 4},
        obj2 = {bar: 2, zed: {abc: 3}},
        merged = Lavaca.merge(obj1, obj2);
    expect(obj1.foo).toEqual(1);
    expect(obj1.bar).toEqual(2);
    expect(obj1.zed.abc).toEqual(3);
    expect(obj1.zed === obj2.zed).toBe(true);
    expect(obj2.foo).not.toBeDefined();
  });
  it('can collect HTMLElement data attributes', function() {
    var elem = document.createElement('div'),
        data;
    elem.setAttribute('id', 'foo');
    elem.setAttribute('data-foo', '1');
    elem.setAttribute('data-bar', '2');
    data = $(elem).dataAttrs();
    expect(data.foo).toEqual('1');
    expect(data.bar).toEqual('2');
    expect(data.id).not.toBeDefined();
    expect(data['data-foo']).not.toBeDefined();
    expect(data['data-bar']).not.toBeDefined();
  });
  it('ensures that $.proxy is defined', function() {
    expect(Lavaca.$.proxy).toBeDefined();
  });
  it('ensures that $.fn.detach is defined', function() {
    expect(Lavaca.$.fn.detach).toBeDefined();
  });
});

})();
