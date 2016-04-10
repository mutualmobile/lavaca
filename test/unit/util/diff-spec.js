import { arrayDiff as diff } from 'lavaca/util/diff';

describe('arrayDiff', function() {

  it('should detect an add at the beginning', function() {
    let result = diff(
      ['b', 'c', 'd'],
      ['a', 'b', 'c', 'd']
    );

    expect(result.added).to.deep.equal([
      {
        index: 0,
        item: 'a'
      }
    ]);
    expect(result.removed).to.be.empty;
    expect(result.moved).to.be.empty;
  });

  it('should detect an add at the end', function() {
    let result = diff(
      ['a', 'b', 'c'],
      ['a', 'b', 'c', 'd']
    );

    expect(result.added).to.deep.equal([
      {
        index: 3,
        item: 'd'
      }
    ]);
    expect(result.removed).to.be.empty;
    expect(result.moved).to.be.empty;
  });

  it('should detect an add in the middle', function() {
    let result = diff(
      ['a', 'c', 'd'],
      ['a', 'b', 'c', 'd']
    );

    expect(result.added).to.deep.equal([
      {
        index: 1,
        item: 'b'
      }
    ]);
    expect(result.removed).to.be.empty;
    expect(result.moved).to.be.empty;
  });

  it('should detect a move', function() {
    let result = diff(
      ['a', 'b', 'c', 1],
      [1, 'a', 'b', 'c']
    );

    expect(result.added).to.be.empty;
    expect(result.removed).to.be.empty;
    expect(result.moved).to.deep.equal([
      {
        fromIndex: 3,
        toIndex: 0,
        item: 1
      }
    ]);
  });

  it('should allow a custom equals() function', function() {
    let a = [
      { id: 100, name: 'foo' },
      { id: 101, name: 'bar' },
      { id: 102, name: 'baz' }
    ];

    let b = [
      { id: 100, name: 'foo' },
      { id: 101, name: 'bar' }
    ];

    let equals = function(a, b) {
      return a.id === b.id;
    };

    let result = diff(a, b, equals);

    expect(result.added).to.be.empty;
    expect(result.removed).to.deep.equal([
      {
        index: 2,
        item: { id: 102, name: 'baz' }
      }
    ]);
    expect(result.moved).to.be.empty;
  });

  it.skip('should handle large arrays in < 1 ms (for worst-case event loop usage)', function() {
    let a = [];
    let b = [];

    for (let i = 0; i < 1000; i++) {
      a.push({
        id: i,
        name: 'foo_' + i
      });

      b.push({
        id: i,
        name: 'foo_' + i
      });
    }

    b.splice(100, 1);

    let equals = function(a, b) {
      return a.id === b.id;
    };

    //console.profile();
    let start = performance.now();
    let result = diff(a, b, equals);
    let end = performance.now();
    let elapsed = end - start;
    //console.profileEnd();
    console.trace(elapsed);

    expect(elapsed).to.be.below(1);
    expect(result.added).to.be.empty;
    expect(result.removed).to.deep.equal([
      {
        index: 100,
        item: { id: 100, name: 'foo_100' }
      }
    ]);
    expect(result.moved).to.be.empty;
  });

});
