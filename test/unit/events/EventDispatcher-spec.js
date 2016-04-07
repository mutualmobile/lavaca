
// var $ = require('$');
var EventDispatcher = require('lavaca/events/EventDispatcher');

describe('An EventDispatcher', function() {
  var eventDispatcher;
  beforeEach(function() {
    eventDispatcher = new EventDispatcher();
  });
  it('can be initialized', function() {
    var type = typeof eventDispatcher;
    expect(type).to.equal(typeof new EventDispatcher());
  });
  describe('can bind', function() {
    it('an event handler', function(done) {
      eventDispatcher.on('test', done);
      eventDispatcher.trigger('test');
    });
    it('an event handler with a namespace', function(done) {
      eventDispatcher.on('test.ns', function() {
        done();
      });
      eventDispatcher.trigger('test');
    });
    it('an event handler with an event triggered', function(done) {
      eventDispatcher.on('test', function(e) {
        expect(e.type).to.equal('click');
        done();
      });
      eventDispatcher.trigger('test', { type: 'click'});
    });
  });
  describe('can unbind', function() {
    var handler, called;
    beforeEach(function() {
      called = [];
      handler = function() {
        called.push('test - specific handler');
      };
      eventDispatcher.on('test', handler);
      eventDispatcher.on('test', function() {
        called.push('test');
      });
      eventDispatcher.on('test.namespace', function() {
        called.push('test.namespace');
      });
      eventDispatcher.on('test.namespace2', function() {
        called.push('test.namespace2');
      });
      eventDispatcher.on('test.namespace.namespace2', function() {
        called.push('test.namespace.namespace2');
      });
      eventDispatcher.on('test2', function() {
        called.push('test2');
      });
      eventDispatcher.on('test2.namespace', function() {
        called.push('test2.namespace');
      });
      eventDispatcher.on('test2.namespace2', function() {
        called.push('test2.namespace2');
      });
      eventDispatcher.on('test2.namespace.namespace2', function() {
        called.push('test2.namespace.namespace2');
      });
    });
    it('all event handlers', function(done) {
      eventDispatcher.off();

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).not.to.contain('test - specific handler');
        expect(called).not.to.contain('test');
        expect(called).not.to.contain('test.namespace');
        expect(called).not.to.contain('test.namespace2');
        expect(called).not.to.contain('test.namespace.namespace2');
        expect(called).not.to.contain('test2');
        expect(called).not.to.contain('test2.namespace');
        expect(called).not.to.contain('test2.namespace2');
        expect(called).not.to.contain('test2.namespace.namespace2');
        done();
      }, 0);

      setTimeout(done, 0);
    });
    it('all event handlers for an event', function(done) {
      eventDispatcher.off('test');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).not.to.contain('test - specific handler');
        expect(called).not.to.contain('test');
        expect(called).not.to.contain('test.namespace');
        expect(called).not.to.contain('test.namespace2');
        expect(called).not.to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('all event handlers for a namespace', function(done) {
      eventDispatcher.off('.namespace');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).not.to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).not.to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).not.to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).not.to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('all event handlers for an event and a namespace', function(done) {
      eventDispatcher.off('test.namespace');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).not.to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).not.to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('a specific event handler', function(done) {
      eventDispatcher.off('test', handler);

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).not.to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('a nonexistant event', function(done) {
      eventDispatcher.off('test100');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('a nonexistant namespace', function(done) {
      eventDispatcher.off('.namespace100');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('a nonexistant event and namespace', function(done) {
      eventDispatcher.off('test100.namespace100');

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
    it('a nonexistant specific event handler', function(done) {
      eventDispatcher.off('test', undefined);

      eventDispatcher.trigger('test');
      eventDispatcher.trigger('test2');

      setTimeout(function() {
        expect(called).to.contain('test - specific handler');
        expect(called).to.contain('test');
        expect(called).to.contain('test.namespace');
        expect(called).to.contain('test.namespace2');
        expect(called).to.contain('test.namespace.namespace2');
        expect(called).to.contain('test2');
        expect(called).to.contain('test2.namespace');
        expect(called).to.contain('test2.namespace2');
        expect(called).to.contain('test2.namespace.namespace2');
        done();
      }, 0);
    });
  });
});
