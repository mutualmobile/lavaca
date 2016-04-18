/* eslint-disable camelcase */
import { default as EventDispatcher } from '../events/EventDispatcher';
import { mixIn as mixin, get } from 'mout/object';
import { difference, unique, equals } from 'mout/array';
import { forEach } from 'mout/collection';
import { clone, isFunction, isArray, isObject } from 'mout/lang';
import diff from './diff';

let defineHiddenProperty = function(obj, key, value) {
  Object.defineProperty(obj, key, {
    configurable: false,
    enumerable: false,
    writable: true,
    value: value
  });
};

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
      defineHiddenProperty(source, '$$_uuid', Observable.uuid++);
    }
    defineHiddenProperty(out, '$$_uuid', source.$$_uuid);
    return out;
  };

  let cloneArray = function(arr) {
    var out = [];
    for (let i = 0; i < arr.length; i++) {
      out[i] = deepClone(arr[i]);
    }
    if (!arr.$$_uuid) {
      defineHiddenProperty(arr, '$$_uuid', Observable.uuid++);
    }
    defineHiddenProperty(out, '$$_uuid', arr.$$_uuid);
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

let getPrototypeChain = function(obj) {
  let result = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto !== Object.prototype) {
    result.unshift(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return result;
};

let traverse = function(root, iterator) {
  let visit = function(node) {
    if (typeof node !== 'object') {
      return;
    }
    forEach(node, (child) => {
      if (iterator(node, child) === false) {
        return;
      }
      visit(child, node);
    });
  };
  visit(root);
};

let addParent = function(child, parent) {
  if (!child.$$_parents) {
    defineHiddenProperty(child, '$$_parents', []);
  }
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

let addParentsRecursive = function(root) {
  traverse(root, (parent, child) => {
    if (typeof child === 'object') {
      addParent(child, parent);
    }
  });
};

let Observable = function Observable(obj = {}) {
  /* eslint-disable consistent-this */
  // We're doing inheritance differently here so that Observables show up as
  // regular Arrays/Objects as far as external libraries are concerned. Mainly
  // Array.prototype.length behavior and browser Array optimizations. We create
  // a plain Object or Array and mix in the Observable prototype's methods
  // directly. The object is then returned. That means Observable() isn't
  // technically a constructor function; it just adds a lot of non-enumerable
  // methods/properties to a new Object/Array.
  let self = {};
  if (isArray(obj)) {
    self = [];
  }

  // Mixin every function in every prototype in obj's chain
  getPrototypeChain(obj).forEach((proto) => {
    difference(Object.getOwnPropertyNames(proto), Object.getOwnPropertyNames(Object.prototype))
      .filter((key) => isFunction(proto[key]))
      .forEach((key) => {
        var descriptor = Object.getOwnPropertyDescriptor(proto, key);
        descriptor.enumerable = false;
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

  forEach(privateMembers, (val, key) => {
    defineHiddenProperty(self, key, val);
  });

  self.$apply(obj);
  self.$$_takeSnapshot();
  return self;
  /* eslint-enable consistent-this */
};

Observable.prototype = {};
Observable.prototype.constructor = Observable;

mixin(Observable.prototype, {

  $on() {
    var before = this.$$_eventDispatcher.callbacks.length;
    this.$$_eventDispatcher.on.apply(this.$$_eventDispatcher, arguments);
    var after = this.$$_eventDispatcher.callbacks.length;

    if (before === 0 && after > 0) {
      this.$$_takeSnapshot();
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
    this.$$_markDirty();
    return this;
  },

  $$_takeSnapshot() {
    this.$$_snapshot = cloneWithUuid(this);
    addParentsRecursive(this);
  },

  $$_markDirty() {
    Observable.schedule(this);
  }

});

let getChanges = function(obj) {
  let prev = obj.$$_snapshot;
  let curr = cloneWithUuid(obj);
  let shallowEquals = function(a, b) {
    if (a.$$_uuid && b.$$_uuid) {
      return a.$$_uuid === b.$$_uuid;
    }
    return a === b;
  };
  let changes = diff(prev, curr, shallowEquals);
  return changes;
};

let traverseUp = function(node, iterator) {
  let visit = function(node, parents) {
    parents = parents || [];
    if (iterator(node, parents) === false) {
      return;
    }
    for (let i = 0; i < node.$$_parents.length; i++) {
      visit(node.$$_parents[i], [...parents, node.$$_parents[i]]);
    }
  };
  visit(node);
};

let getAncestorChains = function(child) {
  let ret = [];
  traverseUp(child, (node, parents) => {
    if (!node.$$_parents.length) {
      ret = [...ret, parents];
    }
  });
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
      return path;
    });
};

let resolveParentsFromChanges = function(changeMap) {
  let uuidMap = {};
  for (let node of cloneMap(changeMap).keys()) {
    uuidMap[node.$$_uuid] = node;
  }
  for (let [node, changes] of cloneMap(changeMap).entries()) {
    changes.forEach(function(item) {
      if (
        (typeof item.value === 'object')
        &&
        (item.value.$$_uuid)
        &&
        uuidMap[item.value.$$_uuid]
      ) {
        let child = uuidMap[item.value.$$_uuid];
        if (item.op === 'add') {
          addParent(child, node);
        }
        else if (item.op === 'remove') {
          removeParent(child, node);
        }
      }
    });
  }
};

let cloneMap = function(map) {
  let ret = new Map();
  for (let [obj, changes] of map) {
    ret.set(obj, changes);
  }
  return ret;
};

let pushChangesDown = function(changeMap) {
  let addChange = function(map, node, change) {
    let changes = map.get(node) || [];
    map.set(node, [...changes, change]);
  };
  let removeChange = function(map, node, change) {
    let changes = map.get(node) || [];
    changes = changes.filter((item) => {
      return item !== change;
    });
    map.set(node, changes);
  };
  let result = new Map();
  for (let [parent, changes] of cloneMap(changeMap).entries()) {
    changes.forEach((item) => {
      if (item.path.length <= 1) {
        addChange(result, parent, item);
        return;
      }
      removeChange(result, parent, item);
      let child = get(parent, item.path.slice(0, item.path.length - 1).join('.'));
      let change = clone(item);
      change.path = item.path.slice(-1);
      addChange(result, child, change);
    });
  }
  // remove duplicates
  for (let [node, changes] of cloneMap(result).entries()) {
    result.set(node, unique(changes, (a, b) => {
      return (
        (a.op === b.op)
        &&
        equals(a.path, b.path)
      );
    }));
  }
  return result;
};

let propagateChangesUp = function(changeMap) {
  let result = cloneMap(changeMap);
  for (let child of changeMap.keys()) {
    getAncestorChains(child).forEach((chain) => {
      chain.forEach((parent) => {
        let childChanges = result.get(child) || [];
        let parentChanges = result.get(parent) || [];

        getPaths(child, parent)
          .forEach((path) => {
            let changes = childChanges.map(function(c) {
              c = clone(c);
              c.path = [...path, ...c.path];
              return c;
            });

            result.set(parent, [...parentChanges, ...changes]);
          });
      });
    });
  }
  return result;
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

  resolveParentsFromChanges(changeMap);
  changeMap = pushChangesDown(changeMap);
  changeMap = propagateChangesUp(changeMap);

  for (let i = 0; i < queue.length; i++) {
    let obj = queue[i];
    obj.$$_takeSnapshot();
  }

  Observable.queue = [];

  for (let [obj, changes] of changeMap) {
    if (typeof obj.$trigger === 'function') {
      obj.$trigger('change', changes);
    }
  }
};

export default Observable;
