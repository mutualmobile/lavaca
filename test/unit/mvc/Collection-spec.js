import Collection from 'lavaca/mvc/Collection';
import Model from 'lavaca/mvc/Model';

describe('A Collection', function() {
  it('converts added items into Model instances', function() {
    let list = new Collection();
    list.push({
      foo: 'bar'
    });
    expect(list[0].constructor).to.equal(Model);
  });

  it('can add models with a custom model type', function() {
    let TestModel = Model.extend({
      fetch: function() {}
    });
    let TestCollection = Collection.extend(function TestCollection() {
      return Collection.apply(this, arguments);
    }, {
      TModel: TestModel
    });
    let list = new TestCollection([
      {
        foo: 'bar'
      }
    ]);
    expect(list[0].fetch).to.be.a('function');
  });

  it('can deep-merge Arrays into itself with $merge()', function(done) {
    let TestModel = Model.extend({
      isTestModel: true
    });
    let TestCollection = Collection.extend({
      TModel: TestModel,
      $equals: function(a, b) {
        return a.id === b.id;
      }
    });

    let list = new TestCollection([
      { id: 1, color: 'red' },
      { id: 2, color: 'green' },
      { id: 3, color: 'blue' }
    ]);

    list.$on('change', function(changes) {
      expect(changes).to.have.lengthOf(2);
      expect(changes).to.deep.include.members([
        {
          op: 'add',
          path: [3],
          value: { id: 4, color: 'violet' }
        },
        {
          op: 'replace',
          path: [2, 'color'],
          oldValue: 'blue',
          value: 'orange'
        }
      ]);
      done();
    });

    // testing that order doesn't matter and items are matched by their id via
    // the $equals override
    list.$merge([
      { id: 4, color: 'violet' },
      { id: 3, color: 'orange' },
      { id: 2, color: 'green' },
      { id: 1, color: 'red' }
    ]);
  });

  describe('can use native Array methods with custom model types', function() {
    let TestModel = Model.extend({});
    let TestCollection = Collection.extend({
      TModel: TestModel
    });
    let list = new TestCollection([]);

    beforeEach(function() {
      list = new TestCollection([]);
    });

    it('Array.prototype.push', function() {
      list.push({
        foo: 'bar'
      });
      expect(list[0].constructor).to.equal(TestModel);
    });

    it('Array.prototype.splice', function() {
      list.splice(0, 0, {
        foo: 'bar'
      });
      expect(list[0].constructor).to.equal(TestModel);
    });

    it('Array.prototype.unshift', function() {
      list.unshift({
        foo: 'bar'
      });
      expect(list[0].constructor).to.equal(TestModel);
    });

    it('Array.prototype.concat', function() {
      let copy = list.concat([{
        foo: 'bar'
      }]);
      list.$apply(copy);
      expect(list[0].constructor).to.equal(TestModel);
    });

    it('direct access', function() {
      list[0] = {
        foo: 'bar'
      };
      expect(list[0].constructor).to.not.equal(TestModel);
      list.$apply();
      expect(list[0].constructor).to.equal(TestModel);
    });

  });

});
