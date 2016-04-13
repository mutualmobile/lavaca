/* eslint-disable camelcase */
import { default as EventDispatcher } from '../events/EventDispatcher';
import { mixIn as mixin } from 'mout/object';
import { difference, unique } from 'mout/array';
import { forEach, contains } from 'mout/collection';
import { clone, isFunction, isArray, isObject } from 'mout/lang';
import diff from './diff';

let cloneWithUuid = function(val) {
  /* eslint-disable no-use-before-define */
  let deepClone = function(val) {
    if (isArray(val)) {
      return cloneArray(val);
    }
    else if (isObject(val)) {
      return cloneObject(val);
    }
    else {
      return val;
    }
  };

  let cloneObject = function(source) {
    var out = {};
    Object.keys(source).forEach(function(key) {
      out[key] = deepClone(source[key]);
    });
    if (!source.$$_uuid) {
      Object.defineProperty(source, '$$_uuid', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: Observable.uuid++
      });
    }
    out.$$_uuid = source.$$_uuid;
    return out;
  };

  let cloneArray = function(arr) {
    var out = [];
    for (let i = 0; i < arr.length; i++) {
      out[i] = deepClone(arr[i]);
    }
    if (!arr.$$_uuid) {
      Object.defineProperty(arr, '$$_uuid', {
        configurable: false,
        enumerable: false,
        writable: true,
        value: Observable.uuid++
      });
    }
    out.$$_uuid = arr.$$_uuid;
    return out;
  };

  return deepClone(val);
  /* eslint-enable no-use-before-define */
};

let setEqualTo = function(a, b) {
  if (isArray(b)) {
    Array.prototype.splice.apply(a, [0, a.length, ...b]);
  }
  else {
    Object.keys(a).forEach((key) => {
      if (!(key in b)) {
        delete a[key];
      }
    });

    Object.keys(b).forEach((key) => {
      a[key] = b[key];
    });
  }
};

let watchProperties = function(obj, callback) {
  if (isArray(obj)) {
    return;
  }

  if (!obj.$$_watchedProperties) {
    Object.defineProperty(obj, '$$_watchedProperties', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {}
    });
  }

  Object.keys(obj)
    .filter((key) => {
      var descriptor = Object.getOwnPropertyDescriptor(obj, key);
      return 'value' in descriptor;
    })
    .forEach((key) => {
      obj.$$_watchedProperties[key] = obj[key];
      Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get: function() {
          return obj.$$_watchedProperties[key];
        },
        set: function(val) {
          obj.$$_watchedProperties[key] = val;
          callback.apply(this, arguments);
        }
      });
    });
};

/*
 *let unwatchProperties = function(obj) {
 *  if (!('$$_watchedProperties' in obj)) {
 *    return;
 *  }
 *  Object.keys(obj.$$_watchedProperties)
 *    .forEach((key) => {
 *      Object.defineProperty(obj, key, {
 *        configurable: true,
 *        enumerable: true,
 *        writable: true,
 *        value: obj.$$_watchedProperties[key]
 *      });
 *    });
 *  delete obj.$$_watchedProperties;
 *};
 */

let getPrototypeChain = function(obj) {
  let result = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto !== Object.prototype) {
    result.unshift(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return result;
};

let addParent = function(child, parent) {
  if (child.$$_parents.indexOf(parent) !== -1) {
    return;
  }

  child.$$_parents.push(parent);
};

let removeParent = function(child, parent) {
  child.$$_parents = child.$$_parents.filter((p) => {
    return parent !== p;
  });
};

let Observable = function Observable(obj = {}) {
  /* eslint-disable consistent-this */
  // We're doing inheritance differently here so that Observables show up as
  // regular Arrays/Objects as far as external libraries are concerned. The
  // passed-in Object keeps its original prototype/constructor and the
  // Observable prototype's methods are mixed in to the object directly. The
  // object is then returned. That means Observable() isn't technically a
  // constructor function; it just adds a lot of non-enumerable
  // methods/properties to passed-in objects.
  let self = {};
  if (isArray(obj)) {
    self = [];
  }

  // For every function in every prototype in obj's chain, insert a
  // $$_markDirty() call and make non-enumerable
  getPrototypeChain(obj).forEach((proto) => {
    difference(Object.getOwnPropertyNames(proto), Object.getOwnPropertyNames(Object.prototype))
      .filter((key) => isFunction(proto[key]))
      .forEach((key) => {
        var descriptor = Object.getOwnPropertyDescriptor(proto, key);
        descriptor.enumerable = false;
        descriptor.value = function() {
          this.$$_markDirty();
          return proto[key].apply(this, arguments);
        };
        Object.defineProperty(self, key, descriptor);
      });
  });

  // Make all properties of Observable or its superclasses non-enumerable
  getPrototypeChain(this).forEach((proto) => {
    Object.getOwnPropertyNames(proto).forEach((key) => {
      var descriptor = Object.getOwnPropertyDescriptor(proto, key);
      descriptor.enumerable = false;
      Object.defineProperty(self, key, descriptor);
    });
  });

  let privateMembers = {};
  privateMembers.$$_isObservable = true;
  privateMembers.$$_eventDispatcher = new EventDispatcher();
  privateMembers.$$_snapshot = null;
  privateMembers.$$_parents = [];

  Object.keys(privateMembers).forEach(function(key) {
    Object.defineProperty(self, key, {
      configurable: false,
      enumerable: false,
      writable: true,
      value: privateMembers[key]
    });
  });

  self.$apply(obj);
  self.$$_takeSnapshot();
  return self;
};

Observable.prototype = Object.create(Object.prototype);
Observable.prototype.constructor = Observable;

mixin(Observable.prototype, {

  $on() {
    var before = this.$$_eventDispatcher.callbacks.length;
    this.$$_eventDispatcher.on.apply(this.$$_eventDispatcher, arguments);
    var after = this.$$_eventDispatcher.callbacks.length;

    if (before === 0 && after > 0) {
      this.$$_takeSnapshot();
      watchProperties(this, this.$$_markDirty.bind(this));
    }

    return this;
  },

  $off() {
    this.$$_eventDispatcher.off.apply(this.$$_eventDispatcher, arguments);
    return this;
  },

  $trigger() {
    this.$$_eventDispatcher.trigger.apply(this.$$_eventDispatcher, arguments);
    return this;
  },

  $apply(obj) {
    if (obj) {
      setEqualTo(this, obj);
    }

    watchProperties(this, this.$$_markDirty.bind(this));
    this.$$_markDirty();
    return this;
  },

  $$_takeSnapshot() {
    this.$$_snapshot = cloneWithUuid(this);
    forEach(this, (val, key) => {
      if (!(val && val.$$_isObservable)) {
        return;
      }

      addParent(val, this, key);
    });
  },

  $$_markDirty() {
    Observable.schedule(this);
  }

});

let flattenChanges = function(changes) {
  let result = [];
  let keys = Object.keys(changes);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    result = result.concat((changes[key] || []).map((item) => {
      item.type = key;
      return item;
    }));
  }
  return result;
};

let getChanges = function(obj) {
  let prev = obj.$$_snapshot;
  let curr = obj;
  let changes = diff(prev, curr, function(a, b) {
    if (a.$$_uuid && b.$$_uuid) {
      return a.$$_uuid === b.$$_uuid;
    }
    return a === b;
  });

  let result = flattenChanges(changes);
  result = result.map((item) => {
    let key = 'value' in item ? 'value' : 'item';
    if (!isObject(item[key])) {
      return item;
    }
    if (item[key].$$_isObservable) {
      return item;
    }
    if (isObject(item[key]) && '$$_uuid' in item[key]) {
      delete item[key].$$_uuid;
    }
    return item;
  });
  return result;
};

let getAncestorChains = function(child) {
  let ret = [];
  let visit = function(node, parents) {
    parents = parents || [];
    if (!node.$$_parents.length) {
      ret = [...ret, parents];
      return;
    }
    for (let i = 0; i < node.$$_parents.length; i++) {
      visit(node.$$_parents[i], [...parents, node.$$_parents[i]]);
    }
  };
  visit(child);
  return ret;
};

let getPaths = function(child, parent) {
  return getAncestorChains(child)
    .filter((chain) => {
      return chain.indexOf(parent) !== -1;
    })
    .map((chain) => {
      let path = [];
      let prev = child;
      chain.every((curr) => {
        forEach(curr, (obj, key) => {
          if (obj === prev) {
            path.unshift(key);
          }
        });
        if (curr === parent) {
          return false;
        }
        prev = curr;
        return true;
      });
      return path.join('.');
    });
};

let propagateChanges = function(changeMap, child, parent) {
  let childChanges = changeMap.get(child) || [];
  let parentChanges = changeMap.get(parent) || [];

  getPaths(child, parent)
    .forEach((path) => {
      let changes = childChanges.map(function(c) {
        c = clone(c);
        c.path = path;
        return c;
      });

      changeMap.set(parent, [...parentChanges, ...changes]);
    });
};

let fixBrokenReferences = function(child) {
  getAncestorChains(child).forEach((chain) => {
    [child, ...chain].forEach((curr, i, list) => {
      if (i === 0) {
        return;
      }
      let prev = list[i - 1];
      if (contains(curr, prev)) {
        return;
      }

      removeParent(prev, curr);

      forEach(curr, (obj) => {
        if (obj === prev) {
          addParent(prev, curr);
        }
      });
    });
  });
};

let cloneMap = function(map) {
  let ret = new Map();
  for (let [obj, changes] of map) {
    ret.set(obj, changes);
  }
  return ret;
};

Observable.uuid = 1;
Observable.queue = [];

Observable.schedule = function(obj) {
  if (Observable.queue.length === 0) {
    window.setTimeout(Observable.drain, 0);
  }

  Observable.queue.push(obj);
};

Observable.drain = function() {
  let queue = unique(Observable.queue);
  let changeMap = new Map();

  for (let i = 0; i < queue.length; i++) {
    let obj = queue[i];
    let c = getChanges(obj);
    if (c.length) {
      changeMap.set(obj, c);
    }
  }

  for (let child of cloneMap(changeMap).keys()) {
    fixBrokenReferences(child);
    getAncestorChains(child).forEach((chain) => {
      chain.forEach((parent) => {
        propagateChanges(changeMap, child, parent);
      });
    });
  }

  for (let i = 0; i < queue.length; i++) {
    let obj = queue[i];
    obj.$$_takeSnapshot();
  }

  Observable.queue = [];

  for (let [obj, changes] of changeMap) {
    obj.$trigger('change', changes);
  }
};

export default Observable;
