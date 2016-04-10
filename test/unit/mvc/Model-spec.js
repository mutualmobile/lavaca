import Model from 'lavaca/mvc/Model';

describe('A Model', function() {
  it('can be initialized', function() {
    let testModel = new Model();
    var type = typeof testModel;
    expect(type).to.equal(typeof new Model());
  });

  it('can be initialized with a hash of attributes', function() {
    let testModel = new Model({
      myAttribute: true,
      myNumber: 12,
      myString: 'Hello, World!'
    });
    expect(testModel).to.deep.equal({
      myAttribute: true,
      myNumber: 12,
      myString: 'Hello, World!'
    });
  });

  it('can fire an onChange event for changed properties', function(done) {
    let testModel = new Model();
    testModel.someAttribute = 'old';

    setTimeout(function() {
      testModel.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          type: 'changed',
          key: 'someAttribute',
          oldValue: 'old',
          newValue: 'new'
        }]);
        done();
      });

      testModel.someAttribute = 'new';
    }, 0);
  });

});
