import Observable from 'lavaca/util/Observable';
import { deepMixIn, filter } from 'mout/object';
import { difference, removeAll } from 'mout/array';
import { clone } from 'mout/lang';

describe('An Observable', function() {

  describe('Object', function() {

    it('should behave like a plain object', function() {
      let obj = new Observable({
        foo: 'bar',
        baz: 3
      });
      expect(obj).to.deep.equal({
        foo: 'bar',
        baz: 3
      });
    });

    it('should fire an onChange event for added properties', function(done) {
      let obj = new Observable();

      obj.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          op: 'add',
          path: ['someAttribute'],
          value: 'new'
        }]);
        done();
      });

      setTimeout(function() {
        obj.someAttribute = 'new';
        obj.$apply();
      }, 100);
    });

    it('should fire an onChange event for removed properties', function(done) {
      let obj = new Observable({
        someAttribute: 'old'
      });

      obj.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          op: 'remove',
          path: ['someAttribute'],
          value: 'old'
        }]);
        done();
      });

      setTimeout(function() {
        delete obj.someAttribute;
        obj.$apply();
      }, 100);
    });

    it('should fire an onChange event for changed properties', function(done) {
      let obj = new Observable({
        someAttribute: 'old'
      });

      obj.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          op: 'replace',
          path: ['someAttribute'],
          oldValue: 'old',
          value: 'new'
        }]);
        done();
      });

      setTimeout(function() {
        obj.someAttribute = 'new';
        obj.$apply();
      }, 100);
    });

    it('should wait until the first .$on() to begin tracking changes', function(done) {
      let obj = new Observable({
        a: 1,
        b: 2,
        c: 3
      });

      obj.a = 100;
      obj.b = 200;
      obj.c = 300;

      obj.$on('change', function(changes) {
        // no events triggered for the obj.a = 100, obj.b = 200, obj.c = 300
        // above
        expect(changes).to.deep.equal([{
          op: 'replace',
          path: ['a'],
          oldValue: 100,
          value: 999
        }]);
        done();
      });

      setTimeout(function() {
        obj.a = 999;
        obj.$apply();
      }, 100);
    });

    it('should aggregate all changes within the same turn of the event loop', function(done) {
      let eventLoopTurn = 0;
      let obj = new Observable({
        foo: 1,
        bar: 2
      });

      obj.$on('change', function(changes) {
        if (eventLoopTurn === 1) {
          expect(changes).to.deep.equal([{
            op: 'remove',
            path: ['foo'],
            value: 1
          }]);
        }
        else if (eventLoopTurn === 2) {
          expect(changes).to.deep.equal([{
            op: 'replace',
            path: ['bar'],
            oldValue: 2,
            value: 200
          }]);
          done();
        }
      });

      setTimeout(function() {
        eventLoopTurn++;
        obj.foo = 100;
        delete obj.foo;
        obj.$apply();
      }, 100);

      setTimeout(function() {
        eventLoopTurn++;
        obj.bar = 200;
        obj.$apply();
      }, 200);
    });

    it('should stop listening for changes on .$off()', function(done) {
      let obj = new Observable({
        a: 1
      });

      obj.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          op: 'replace',
          path: ['a'],
          oldValue: 1,
          value: 2
        }]);
      });

      obj.a = 2;
      obj.$apply();

      setTimeout(function() {
        obj.a = 3; // also testing that changes aren't dispatched until next turn
        obj.$off();
        obj.a = 4;
        obj.$apply({
          a: 0
        });
      }, 100);

      setTimeout(function() {
        obj.$on('change', function(changes) {
          expect(changes).to.deep.equal([{
            op: 'replace',
            path: ['a'],
            oldValue: 0,
            value: 5
          }]);
          done();
        });
        obj.a = 5;
        obj.$apply();
      }, 200);
    });

    it('should propagate nested member changes', function(done) {
      let obj = new Observable({
        a: {
          b: {
            c: {
              d: 'foo'
            }
          }
        }
      });

      obj.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['a', 'b', 'c', 'd'],
          oldValue: 'foo',
          value: 'bar'
        }]);
        done();
      });

      setTimeout(function() {
        obj.a.b.c.d = 'bar';
        obj.$apply();
      }, 100);
    });

    it('should propagate multiple nested member changes', function(done) {
      let member1 = new Observable({
        city: 'Austin'
      });
      let member2 = new Observable({
        state: 'TX'
      });
      let obj = new Observable({
        a: {
          b: {
            c: member1
          }
        },
        y: {
          z: member2
        }
      });

      obj.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(2);
        expect(changes).to.deep.include.members([
          {
            op: 'replace',
            path: ['a', 'b', 'c', 'city'],
            oldValue: 'Austin',
            value: 'New York'
          },
          {
            op: 'replace',
            path: ['y', 'z', 'state'],
            oldValue: 'TX',
            value: 'NY'
          }
        ]);
        done();
      });

      setTimeout(function() {
        member1.city = 'New York';
        member1.$apply();
        member2.state = 'NY';
        member2.$apply();
      }, 100);
    });

    it('should propagate nested member changes to every member in the chain', function(done) {
      let done1 = false;
      let done2 = false;
      let done3 = false;
      let done4 = false;

      let checkDone = function() {
        if (done1 && done2 && done3 && done4) {
          done();
        }
      };

      let obj = new Observable({
        a: new Observable({
          b: new Observable({
            c: new Observable({
              d: 'foo'
            })
          })
        })
      });

      obj.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['a', 'b', 'c', 'd'],
          oldValue: 'foo',
          value: 'bar'
        }]);
        done1 = true;
        checkDone();
      });

      obj.a.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['b', 'c', 'd'],
          oldValue: 'foo',
          value: 'bar'
        }]);
        done2 = true;
        checkDone();
      });

      obj.a.b.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['c', 'd'],
          oldValue: 'foo',
          value: 'bar'
        }]);
        done3 = true;
        checkDone();
      });

      obj.a.b.c.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['d'],
          oldValue: 'foo',
          value: 'bar'
        }]);
        done4 = true;
        checkDone();
      });

      setTimeout(function() {
        obj.a.b.c.d = 'bar';
        obj.$apply();
      }, 100);
    });

    it('should not propagate nested member changes after member is removed', function(done) {
      let done1 = false;
      let done2 = false;

      let checkDone = function() {
        if (done1 && done2) {
          done();
        }
      };

      let member = new Observable({
        foo: 'bar'
      });
      let obj = new Observable({
        a: new Observable({
          b: new Observable({
            c: member
          })
        })
      });

      member.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['foo'],
          oldValue: 'bar',
          value: 'baz'
        }]);
        done1 = true;
        checkDone();
      });

      obj.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'remove',
          path: ['a', 'b', 'c'],
          value: {
            foo: 'bar'
          }
        }]);
        done2 = true;
        checkDone();
      });

      setTimeout(function() {
        delete obj.a.b.c;
        obj.a.b.$apply();
        member.foo = 'baz';
        member.$apply();
      }, 100);
    });

    describe('should work with external libraries', function() {

      it('mout/object/deepMixIn', function(done) {
        let obj = new Observable({
          a: 1,
          b: 2,
          c: 3
        });

        obj.$on('change', function(changes) {
          expect(changes).to.have.lengthOf(2);
          expect(changes).to.deep.include.members([
            {
              op: 'add',
              path: ['d'],
              value: 'foo'
            },
            {
              op: 'replace',
              path: ['a'],
              oldValue: 1,
              value: 100
            }
          ]);
          done();
        });

        deepMixIn(obj, {
          a: 100,
          d: 'foo'
        });
        obj.$apply();
      });

      it('mout/object/filter', function(done) {
        let obj = new Observable({
          a: 1,
          b: 2,
          c: 3
        });

        obj.$on('change', function(changes) {
          expect(changes).to.deep.equal([{
            op: 'remove',
            path: ['a'],
            value: 1
          }]);
          done();
        });

        let copy = filter(obj, function(val, key) {
          return (key !== 'a');
        });
        obj.$apply(copy);
      });

    });

  });

  describe('Array', function() {

    it('should behave like a plain array', function() {
      let list = new Observable([1, 2]);
      expect(list).to.deep.equal([1, 2]);
      expect(Object.getPrototypeOf(list)).to.equal(Array.prototype);
    });

    it('should fire an onChange event for added items', function(done) {
      let list = new Observable([]);

      list.$on('change', function(changes) {
        expect(changes).to.deep.equal([{
          op: 'add',
          value: 'foo',
          path: [0]
        }]);
        done();
      });

      list.push('foo');
      list.$apply();
    });

    it('should fire an onChange event for added items with direct access', function(done) {
      let list = new Observable([]);

      list.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(3);
        expect(changes).to.deep.include.members([
          {
            op: 'add',
            value: undefined,
            path: [0]
          },
          {
            op: 'add',
            value: undefined,
            path: [1]
          },
          {
            op: 'add',
            value: 'foo',
            path: [2]
          }
        ]);
        done();
      });

      list[2] = 'foo';
      list.$apply();
    });

    it('should fire an onChange event for removed items', function(done) {
      let list = new Observable(['foo', 'bar', 'baz']);

      list.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(2);
        expect(changes).to.deep.include.members([
          {
            op: 'remove',
            value: 'bar',
            path: [1]
          },
          {
            op: 'remove',
            value: 'baz',
            path: [2]
          }
        ]);
        done();
      });

      list.pop();
      list.pop();
      list.$apply();
    });

    it('should fire an onChange event for moved items', function(done) {
      let list = new Observable(['foo', 'bar', 'baz']);

      list.$on('change', function(changes) {
        expect(changes).to.deep.equal([
          {
            op: 'move',
            from: [0],
            path: [2],
            value: 'foo'
          }
        ]);
        done();
      });

      list.splice(0, 1);
      list.push('foo');
      list.$apply();
    });

    it('should fire an onChange event for moved items (large Array test)', function(done) {
      let item = {};
      for (let i = 0; i < 50; i++) {
        item[i.toString(16)] = i;
      }
      let list = new Observable([]);
      for (let i = 0; i < 100; i++) {
        list[i] = clone(item);
      }

      list.$on('change', function(changes) {
        expect(changes).to.deep.equal([
          {
            op: 'remove',
            value: item,
            path: [50]
          }
        ]);
        done();
      });

      list.splice(50, 1);
      list.$apply();
    });

    it('should propagate member changes', function(done) {
      let done1 = false;
      let done2 = false;

      let checkDone = function() {
        if (done1 && done2) {
          done();
        }
      };

      let list = new Observable([]);
      let obj = new Observable({
        foo: 'bar'
      });
      list.push(obj);

      obj.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(1);
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: ['foo'],
          oldValue: 'bar',
          value: 'baz'
        }]);
        done1 = true;
        checkDone();
      });

      list.$on('change', function(changes) {
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: [0, 'foo'],
          oldValue: 'bar',
          value: 'baz'
        }]);
        done2 = true;
        checkDone();
      });

      obj.foo = 'baz';
      obj.$apply();
    });

    it('should propagate member changes (large Array)', function(done) {
      let item = {};
      for (let i = 0; i < 50; i++) {
        item[i.toString(16)] = i;
      }
      let list = new Observable([]);
      for (let i = 0; i < 100; i++) {
        list[i] = new Observable(clone(item));
      }

      list.$on('change', function(changes) {
        expect(changes).to.deep.equal([
          {
            op: 'replace',
            path: [50, '1a'],
            oldValue: 26,
            value: 'bar'
          }
        ]);
        done();
      });

      setTimeout(function() {
        list[50]['1a'] = 'bar';
        list.$apply();
      }, 100);
    });

    it('should propagate member changes after member is moved, with member\'s new path', function(done) {
      let list = new Observable([
        new Observable({
          a: 1
        }),
        new Observable({
          b: 2
        }),
        new Observable({
          c: 3
        })
      ]);

      list.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(2);
        expect(changes).to.deep.include.members([
          {
            op: 'replace',
            path: [2, 'a'],
            oldValue: 1,
            value: 100
          },
          {
            op: 'move',
            from: [0],
            path: [2],
            value: {
              a: 100
            }
          }
        ]);
        done();
      });

      list[0].a = 100;
      let obj = list.shift();
      list.push(obj);
      list.$apply();
    });

    it('should not propagate member changes after member is removed', function(done) {
      let list = new Observable([]);
      let obj = new Observable({
        foo: 'bar'
      });
      list.push(obj);

      let count = 0;

      list.$on('change', function(changes) {
        count++;
        if (count === 1) {
          expect(changes).to.have.lengthOf(1);
          expect(changes).to.deep.include.members([{
            op: 'remove',
            path: [0],
            value: {
              foo: 'bar'
            }
          }]);
        }
        else {
          done(new Error('Should only fire 1 onChange event'));
        }
      });

      setTimeout(function() {
        list.$apply([]);
        obj.foo = 'baz';
      }, 100);

      setTimeout(function() {
        done();
      }, 200);
    });

    it('should propagate member changes to multiple parents', function(done) {
      let done1 = false;
      let done2 = false;

      let checkDone = function() {
        if (done1 && done2) {
          done();
        }
      };

      let list1 = new Observable([]);
      let list2 = new Observable([1, 2, 3]);
      let obj = new Observable({
        foo: 'bar'
      });
      list1.push(obj);
      list2.push(obj);

      list1.$on('change', function(changes) {
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: [0, 'foo'],
          oldValue: 'bar',
          value: 'baz'
        }]);
        done1 = true;
        checkDone();
      });

      list2.$on('change', function(changes) {
        expect(changes).to.deep.include.members([{
          op: 'replace',
          path: [3, 'foo'],
          oldValue: 'bar',
          value: 'baz'
        }]);
        done2 = true;
        checkDone();
      });

      setTimeout(function() {
        obj.foo = 'baz';
        obj.$apply();
      }, 100);
    });

    it('should NOT fire an onChange event for immutable operations', function(done) {
      let list = new Observable(['foo', 'bar', 'baz']);

      list.$on('change', function() {
        done(new Error('Change event should not fire if the Observable was not mutated'));
      });

      list.slice(1);
      list.$apply();

      setTimeout(function() {
        done();
      }, 100);
    });

    it('should fire an onChange event for immutable operations when .$apply() is used', function(done) {
      let list = new Observable(['foo', 'bar', 'baz']);

      list.$on('change', function(changes) {
        expect(changes).to.have.lengthOf(2);
        expect(changes).to.deep.include.members([
          {
            op: 'add',
            value: 'foobar',
            path: [2]
          },
          {
            op: 'remove',
            value: 'foo',
            path: [0]
          }
        ]);
        done();
      });

      let copy = list.slice(1);
      copy = copy.concat(['foobar']);
      list.$apply(copy);
    });

    describe('should work with external libraries', function() {

      it('mout/array/difference', function(done) {
        let list = new Observable(['foo', 'bar', 'baz']);

        list.$on('change', function(changes) {
          expect(changes).to.deep.equal([
            {
              op: 'remove',
              value: 'baz',
              path: [2]
            }
          ]);
          done();
        });

        let copy = difference(list, ['baz']);
        list.$apply(copy);
      });

      it('mout/array/removeAll', function(done) {
        let list = new Observable(['foo', 'bar', 'baz', 'foo', 'foo']);

        list.$on('change', function(changes) {
          expect(changes).to.deep.equal([
            {
              op: 'remove',
              value: 'foo',
              path: [0]
            },
            {
              op: 'remove',
              value: 'foo',
              path: [3]
            },
            {
              op: 'remove',
              value: 'foo',
              path: [4]
            }
          ]);
          done();
        });

        removeAll(list, 'foo');
        list.$apply();
      });

    });

  });

});
