(function(Collection, Model) {

describe('A Collection', function() {
  var testCollection,
      colors = [
        {color: 'reb', primary: true},
        {color: 'green', primary: true},
        {color: 'blue', primary: true},
        {color: 'yellow', primary: false}
      ];
  beforeEach(function() {
    testCollection = new Collection();
  }); 
  afterEach(function() {
   // testCollection.clear();
  });
  it('can be initialized', function() {
    expect(testCollection instanceof Collection).toEqual(true);
  });
  it('can be initialized with a list of models', function() {
    testCollection = new Collection(colors);
    expect(testCollection.count()).toEqual(4);
  });
  it('can be initialized with a hash of attributes', function() {
    testCollection = new Collection(colors, {
      extra: 'stuff'
    });
    expect(testCollection.get('extra')).toEqual('stuff');
  });
  it('can be cleared of all its models', function() {
    testCollection = new Collection(colors);
    testCollection.clear();
    expect(testCollection.count()).toEqual(0);
  });
  it('can add models with a custom model type', function() {
    var colorModel = Model.extend({
          isBlack: function() {
            return this.get('color') == 'black';
          }
        }),
        colorCollection = Collection.extend({
          TModel: colorModel
        });
    testCollection = new colorCollection(colors);
    expect(testCollection.models[0] instanceof colorModel).toEqual(true);
  });
  it('can move an item to a new index', function() {
    testCollection = new Collection(colors);
    testCollection.on('moveItem', function(e) {
      expect(testCollection.itemAt(3).toObject()).toEqual(colors[0]);
      expect(e.index).toBe(3);
    });
    testCollection.moveTo(0, 3);
  });
  it('can be filtered by attributes', function() {
    var filteredArray;
    testCollection = new Collection(colors);
    filteredArray = testCollection.filter({'primary': true});
    expect(filteredArray.length).toEqual(3);
    filteredArray = testCollection.filter({'primary': true}, 2);
    expect(filteredArray.length).toEqual(2);
  });
  it('can be filtered by a function', function() {
    var filteredArray;
    testCollection = new Collection(colors);
    filteredArray = testCollection.filter(function(i, item) {
      return item.get('primary');
    });
    expect(filteredArray.length).toEqual(3);
    filteredArray = testCollection.filter(function(i, item) {
      return item.get('primary');
    }, 2);
    expect(filteredArray.length).toEqual(2);
  });
  it('can return the first item that matches a test', function() {
    var filteredArray;
    testCollection = new Collection(colors);
    filteredArray = testCollection.first({'primary': true});
    expect(filteredArray instanceof Model).toEqual(true);
    filteredArray = testCollection.first(function(i, item) {
      return item.get('primary');
    });
    expect(filteredArray instanceof Model).toEqual(true);
  });
  it('can iterate on its models with each()', function() {
    var myCount = 0;
    testCollection = new Collection(colors);
    testCollection.each(function(i, item) {
      if(item.get('primary')) {
        myCount++;
      } 
    });
    expect(myCount).toEqual(3);
  });
  it('can convert its models into an object of attributes', function() {
    testCollection = new Collection(colors);
    expect(testCollection.toObject().items).toEqual(colors);
  });
  it('triggers addItem event when a model is added', function() {
    var noop = {
          addItem: function() {}
        };
    spyOn(noop, 'addItem');
    testCollection = new Collection(colors);
    testCollection.on('addItem', noop.addItem);
    testCollection.add({color: 'purple', primary: false});
    expect(noop.addItem).toHaveBeenCalled();
  });
  it('triggers changeItem event when a model is changed', function() {
    var noop = {
          addItem: function(e) { 
            expect(e.model).toEqual(testCollection.itemAt(4));
          }
        };
    spyOn(noop, 'addItem').andCallThrough();
    testCollection = new Collection(colors);
    testCollection.on('changeItem', noop.addItem);
    testCollection.add({color: 'purple', primary: false});
    testCollection
      .itemAt(4)
      .set('color', 'grey');
    expect(noop.addItem).toHaveBeenCalled();
  });
  it('can sort via a specified attribute name', function() {
    testCollection.add([
    	{ testVal: 'B' },
    	{ testVal: 'C' },
    	{ testVal: 'A' }
    ]);
    expect(testCollection.sort('testVal').toObject()).toEqual({
    	items: [
				{ testVal: 'A' },
				{ testVal: 'B' },
				{ testVal: 'C' }
    	]
    });
  });
  it('can sort via a specified attribute name in descending order', function() {
    testCollection.add([
    	{ testVal: 'B' },
    	{ testVal: 'C' },
    	{ testVal: 'A' }
    ]);
    expect(testCollection.sort('testVal', true).toObject()).toEqual({
    	items: [
				{ testVal: 'C' },
				{ testVal: 'B' },
				{ testVal: 'A' }
    	]
    });
  });
  it('can sort via a compare function', function() {
    testCollection.add([
    	{ testVal: 'B' },
    	{ testVal: 'C' },
    	{ testVal: 'A' }
    ]);
    var compareFunc = function(modelA, modelB) {
    	var a = modelA.get('testVal'),
    			b = modelB.get('testVal');
    	return a == b
    						? 0
    						: a < b
    							? -1
    							: 1;
    }
    expect(testCollection.sort(compareFunc).toObject()).toEqual({
    	items: [
				{ testVal: 'A' },
				{ testVal: 'B' },
				{ testVal: 'C' }
    	]
    });
  });
  it('can reverse order of models', function() {
    testCollection.add([
    	{ testVal: 'A' },
    	{ testVal: 'B' },
    	{ testVal: 'C' }
    ]);
    expect(testCollection.reverse().toObject()).toEqual({
    	items: [
				{ testVal: 'C' },
				{ testVal: 'B' },
				{ testVal: 'A' }
    	]
    });
  });

});

})(Lavaca.resolve('Lavaca.mvc.Collection', true), Lavaca.resolve('Lavaca.mvc.Model', true));