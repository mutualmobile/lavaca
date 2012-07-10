(function(Cache) { 

var cache;

describe('A Cache', function() {
	beforeEach(function() {
  	cache = new Cache();
  });
  it('can assign and retrieve an item', function() {
  	cache.set('foo', 'bar')
  	expect(cache.get('foo')).toEqual('bar');
  });
  it('can retrieve an item with supplying a default', function() {
  	expect(cache.get('foo')).toBe(null);
  	expect(cache.get('foo', 'bar')).toEqual('bar');
  });
  it('can add an item and return an id', function() {
  	var id = cache.add('bar');
  	expect(cache.get(id)).toEqual('bar');
  });
  it('can remove an item by a key if it exists', function() {
  	var id = cache.add('bar');
  	expect(cache.get(id)).not.toBe(undefined);
  	cache.remove(id)
  	expect(cache.get(id)).toEqual(null);
  });
  it('can interate over each item', function() {
  	var noop = {
  				cb: function() {}
  			};
  	spyOn(noop, 'cb');
  	cache.add('red');
  	cache.add('green');
  	cache.add('blue');
  	cache.add('yellow');
  	cache.each(noop.cb);
  	expect(noop.cb.callCount).toBe(4)
  });
  it('can return an object of the key-value hash', function() {
  	cache.add('red');
  	cache.add('green');
  	cache.set('special', 'blue');
  	cache.add('yellow');
  	expect(typeof cache.toObject()).toEqual('object')
  });
  it('can return JSON string of the key-value hash', function() {
  	cache.add('red');
  	cache.add('green');
  	cache.set('special', 'blue');
  	cache.add('yellow');
  	expect(typeof cache.toJSON()).toEqual('string')
  });
});

})(Lavaca.resolve('Lavaca.util.Cache', true));
