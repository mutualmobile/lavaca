define(function(require) {

  var Collection = require('lavaca/mvc/Collection');
  var Model = require('lavaca/mvc/Model');
  var ArrayUtils = require('lavaca/util/ArrayUtils');


  describe('A Collection', function() {
    var testCollection,
        colors;
    beforeEach(function() {
      testCollection = new Collection();
      colors = [
        {id: 1, color: 'red', primary: true},
        {id: 2, color: 'green', primary: true},
        {id: 3, color: 'blue', primary: true},
        {id: 4, color: 'yellow', primary: false}
      ];
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
              return this.get('color') === 'black';
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
        return a === b
                  ? 0
                  : a < b
                    ? -1
                    : 1;
      };
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
    it('can clear models without clearing attributes', function() {
      testCollection.add(colors);
      testCollection.set('attrKey', 'attrValue');
      expect(testCollection.count()).toEqual(4);
      testCollection.clearModels();
      expect(testCollection.get('attrKey')).toEqual('attrValue');
      expect(testCollection.count()).toEqual(0);
      expect(testCollection.changedOrder).toEqual(false);
      ['addedItems', 'changedItems', 'models', 'removedItems'].forEach(function(key) {
        expect(ArrayUtils.isArray(testCollection[key])).toBe(true);
        expect(testCollection[key].length).toEqual(0);
      });
    });
    it('can remove one or more items by passing in comma separated params', function () {
      testCollection.add(colors);
      testCollection.remove({color: 'red', primary: true});
      expect(testCollection.count()).toEqual(3);
      testCollection.remove({color: 'blue'}, {color: 'green'});
      expect(testCollection.count()).toEqual(1);
      expect(testCollection.first({color: 'blue'})).toEqual(null);
      expect(testCollection.first({color: 'green'})).toEqual(null);
    });
    it('can remove one or more items by passing in an array', function () {
      testCollection.add(colors);
      testCollection.remove([{color: 'red', primary: true}, {color: 'blue'}]);
      expect(testCollection.count()).toEqual(2);
      expect(testCollection.first({color: 'red'})).toEqual(null);
      expect(testCollection.first({color: 'blue'})).toEqual(null);
    });
    it('should replace the old item(s) when trying to add items with duplicated IDs', function () {
      testCollection.add(colors);
      testCollection.add({ color: 'grey'});
      expect(testCollection.count()).toEqual(5);
      testCollection.add({ id: 1, color: '#f0f0f0'});
      expect(testCollection.count()).toEqual(5);
      expect(testCollection.first({id: 1}).get('color')).toEqual('#f0f0f0');
    });
    it('should not keep items with duplicated IDs when Collection.allowDuplicatedIds flag is default to false', function () {
      var obj = {id: 4, color: '#efefef', primary: false};
      colors.push(obj, obj);
      testCollection.add(colors);
      expect(testCollection.count()).toEqual(4);
      colors.splice(-3, 2);
      expect(testCollection.toObject().items).toEqual(colors);
    });
    it('should keep items with duplicated IDs if Collection.allowDuplicatedIds flag is set to true', function () {
      var TCollection = Collection.extend({
        allowDuplicatedIds: true
      });
      var items = [{id: 4, color: '#efefef', primary: false}, {id: 3, color: 'transparent', primary: true}];
      var testCollection;
      [].push.apply(colors, items);
      testCollection = new TCollection(colors);
      expect(testCollection.count()).toEqual(colors.length);
      expect(testCollection.toObject().items).toEqual(colors);
    });
  });

});
