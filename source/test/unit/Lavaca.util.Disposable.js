(function(Disposable) { 

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
  it('can be readied for GC', function() {
  	ob.dispose();
  	expect(ob).toEqual(new Type());
  });
  it('containing another type Disposbale can be readied for GC', function() {
  	var Type2 = Type.extend({
			  	colors: ['blue', 'green'],
			  	numbers: [1,2,3,4]	
		  	});
  	ob.newType = new Type2();
  	ob.newType.bool = false;
  	ob.str = 'Another String';
  	ob.dispose();
  	expect(ob).toEqual(new Type());
  });
});

})(Lavaca.resolve('Lavaca.util.Disposable', true));
