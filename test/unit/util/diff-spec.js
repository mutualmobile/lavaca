import diff from 'lavaca/util/diff';
import { deepClone as clone } from 'mout/lang';

describe('diff', function() {

  it('should detect an add at the beginning', function() {
    let result = diff(
      ['b', 'c', 'd'],
      ['a', 'b', 'c', 'd']
    );

    expect(result).to.deep.equal([
      {
        op: 'add',
        path: [0],
        value: 'a'
      }
    ]);
  });

  it('should detect an add at the end', function() {
    let result = diff(
      ['a', 'b', 'c'],
      ['a', 'b', 'c', 'd']
    );

    expect(result).to.deep.equal([
      {
        op: 'add',
        path: [3],
        value: 'd'
      }
    ]);
  });

  it('should detect an add in the middle', function() {
    let result = diff(
      ['a', 'c', 'd'],
      ['a', 'b', 'c', 'd']
    );

    expect(result).to.deep.equal([
      {
        op: 'add',
        path: [1],
        value: 'b'
      }
    ]);
  });

  it('should detect a remove', function() {
    let result = diff(
      ['a', 'b', 'c', 'd'],
      ['a', 'c', 'd']
    );

    expect(result).to.deep.equal([
      {
        op: 'remove',
        path: [1],
        value: 'b'
      }
    ]);
  });

  it('should detect a move', function() {
    let result = diff(
      ['a', 'b', 'c', 1],
      [1, 'a', 'b', 'c']
    );

    expect(result).to.deep.equal([
      {
        op: 'move',
        from: [3],
        path: [0],
        value: 1
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

    let result = diff(a, b);

    // using the default of object identity, there are 3 removes and 2 adds
    expect(result).to.have.lengthOf(5);

    let equals = function(a, b) {
      return a.id === b.id;
    };

    result = diff(a, b, equals);

    expect(result).to.deep.equal([
      {
        op: 'remove',
        path: [2],
        value: { id: 102, name: 'baz' }
      }
    ]);
  });

  it('should detect a replace', function() {
    let a = { foo: 'bar' };
    let b = { foo: 'baz' };

    let result = diff(a, b);
    expect(result).to.deep.equal([
      {
        op: 'replace',
        path: ['foo'],
        oldValue: 'bar',
        value: 'baz'
      }
    ]);
  });

  it('should detect a nested replace', function() {
    let from = {
      a: {
        b: {
          c: 'foo'
        }
      }
    };
    let to = clone(from);
    to.a.b.c = 'bar';

    let result = diff(from, to);
    expect(result).to.deep.equal([
      {
        op: 'replace',
        path: ['a', 'b', 'c'],
        oldValue: 'foo',
        value: 'bar'
      }
    ]);
  });

  it('should detect a move and a replace', function() {
    let from = [
      { id: 100, a: 1 },
      { id: 101, b: 2 },
      { id: 102, c: 3 }
    ];
    let to = [
      { id: 101, b: 2 },
      { id: 102, c: 3 },
      { id: 100, a: 5 }
    ];

    let equals = function(a, b) {
      return a.id === b.id;
    };

    let result = diff(from, to, equals);
    expect(result).to.have.lengthOf(2);
    expect(result).to.deep.contain.members([
      {
        op: 'replace',
        path: [2, 'a'],
        oldValue: 1,
        value: 5
      },
      {
        op: 'move',
        from: [0],
        path: [2],
        value: { id: 100, a: 5 }
      }
    ]);
  });

  it('should detect a replace and an add', function() {
    let from = [
      { id: 100, a: 1 },
      { id: 101, b: 2 },
      { id: 102, c: 3 }
    ];
    let to = [
      { id: 100, a: 1 },
      { id: 101, b: 2 },
      { id: 102, c: 300 },
      { id: 103, d: 4 }
    ];

    let equals = function(a, b) {
      return a.id === b.id;
    };

    let result = diff(from, to, equals);
    expect(result).to.have.lengthOf(2);
    expect(result).to.deep.contain.members([
      {
        op: 'replace',
        path: [2, 'c'],
        oldValue: 3,
        value: 300
      },
      {
        op: 'add',
        path: [3],
        value: { id: 103, d: 4 }
      }
    ]);
  });

  it('should detect a nested operation, array inside object', function() {
    let from = {
      a: {
        b: {
          c: ['foo', 'bar']
        }
      }
    };
    let to = clone(from);
    to.a.b.c = ['foo'];

    let result = diff(from, to);
    expect(result).to.deep.equal([
      {
        op: 'remove',
        path: ['a', 'b', 'c', 1],
        value: 'bar'
      }
    ]);
  });

  it('should detect a nested operation, object inside array', function() {
    let from = [
      { id: 100, a: 1 },
      { id: 101, b: 2 },
      { id: 102, c: 3 }
    ];
    let to = clone(from);
    to[0].a = 5;

    let equals = function(a, b) {
      return a.id === b.id;
    };

    let result = diff(from, to, equals);
    expect(result).to.deep.equal([
      {
        op: 'replace',
        path: [0, 'a'],
        oldValue: 1,
        value: 5
      }
    ]);
  });

  it('should detect a nested operation, array inside array', function() {
    let nested = [1, 2, 3];
    nested.id = 0;
    let from = [nested];

    let nestedTo = [1, 2, 100];
    nestedTo.id = 0;
    let to = [nestedTo];

    let equals = function(a, b) {
      return a.id === b.id;
    };

    let result = diff(from, to, equals);
    expect(result).to.deep.equal([
      {
        op: 'replace',
        path: [0, 2],
        oldValue: 3,
        value: 100
      }
    ]);
  });

/*
 *  it.only('should handle large arrays in < 1 ms (for worst-case event loop usage)', function() {
 *    let a = [];
 *    let b = [];
 *
 *    let itemTemplate = { foo: 'bar' };
 *    for (let i = 0; i < 100; i++) {
 *      itemTemplate[i.toString(16)] = i;
 *    }
 *
 *    for (let i = 0; i < 100; i++) {
 *      let item = clone(itemTemplate);
 *      item.id = i;
 *      a.push(item);
 *
 *      item = clone(itemTemplate);
 *      item.id = i;
 *      b.push(item);
 *    }
 *
 *    b[0] = {};
 *    b[b.length - 1] = {};
 *
 *    let mid = Math.floor(b.length / 2);
 *    b[mid].foo = 'baz';
 *
 *    let equals = function(a, b) {
 *      return a.id === b.id;
 *    };
 *
 *    console.profile();
 *    let start = performance.now();
 *    let result = diff(a, b, equals);
 *    let end = performance.now();
 *    let elapsed = end - start;
 *    console.log(elapsed);
 *
 *    setTimeout(function() {
 *      console.profileEnd();
 *    }, 100);
 *    //expect(elapsed).to.be.below(1);
 *    expect(result).to.deep.equal([
 *      {
 *        op: 'replace',
 *        path: [mid, 'foo'],
 *        value: 'baz'
 *      }
 *    ]);
 *  });
 */

});
