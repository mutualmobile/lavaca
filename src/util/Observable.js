/* eslint-disable camelcase */
import { default as EventDispatcher } from '../events/EventDispatcher';
import { mixIn as mixin, get } from 'mout/object';
import { difference, unique, equals } from 'mout/array';
import { forEach } from 'mout/collection';
import { clone, isFunction } from 'mout/lang';
import diff from './diff';

let defineHiddenProperty = function(obj, key, value) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: value
  });
};

let deepClone = function(src) {
  let cloneHiddenProperties = function(src, dst) {
    let keys = Object.getOwnPropertyNames(src);
    for (let i = 0; i < keys.length; i++) {
      if (!src.propertyIsEnumerable(keys[i]) && keys[i] !== 'length') {
        defineHiddenProperty(dst, keys[i], src[keys[i]]);
      }
    }
  };
  let clone = function(src) {
    let dst;
    if (src && typeof src === 'object') {
      if (Array.isArray(src)) {
        dst = [];
        for (let i = 0; i < src.length; i++) {
          dst[i] = clone(src[i]);
        }
      }
      else {
        dst = {};
        let keys = Object.keys(src);
        for (let i = 0; i < keys.length; i++) {
          dst[keys[i]] = clone(src[keys[i]]);
        }
      }
      cloneHiddenProperties(src, dst);
    }
    else {
      dst = src;
    }
    return dst;
  };
  return clone(src);
};

let setEqualTo = function(a, b) {
  if (Array.isArray(b)) {
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

let traverse = function(root, iterator) {
  let visit = function(context) {
    if (iterator(context) === false) {
      return;
    }
    if (context.node && typeof context.node === 'object') {
      if (Array.isArray(context.node)) {
        for (let i = 0; i < context.node.length; i++) {
          visit({
            parent: context.node,
            node: context.node[i],
            path: [...context.path, i]
          });
        }
      }
      else {
        let keys = Object.keys(context.node);
        for (let i = 0; i < keys.length; i++) {
          visit({
            parent: context.node,
            node: context.node[keys[i]],
            path: [...context.path, keys[i]]
          });
        }
      }
    }
  };
  visit({
    node: root,
    parent: null,
    path: []
  });
};

let traverseUp = function(node, parentKey, iterator) {
  let getKey = function(parent, child) {
    if (Array.isArray(parent)) {
      return parent.indexOf(child);
    }
    else {
      let keys = Object.keys(parent);
      for (let i = 0; i < keys.length; i++) {
        if (parent[keys[i]] === child) {
          return keys[i];
        }
      }
    }
    return null;
  };
  let visit = function(context) {
    let parents = context.node[parentKey];
    if (!parents.length) {
      context.isRoot = true;
    }
    if (iterator(context) === false) {
      return;
    }
    for (let i = 0; i < parents.length; i++) {
      let key = getKey(parents[i], context.node);
      visit({
        node: parents[i],
        path: [key, ...context.path],
        ancestors: [...context.ancestors, parents[i]]
      });
    }
  };
  visit({
    node: node,
    path: [],
    ancestors: []
  });
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

let getPrototypeChain = function(obj) {
  let result = [];
  let proto = Object.getPrototypeOf(obj);
  while (proto !== Object.prototype) {
    result.unshift(proto);
    proto = Object.getPrototypeOf(proto);
  }
  return result;
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
  if (Array.isArray(obj)) {
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
    traverse(this, (context) => {
      if (context.node && typeof context.node === 'object') {
        if (!context.node.$$_uuid) {
          defineHiddenProperty(context.node, '$$_uuid', Observable.uuid++);
        }
        if (context.parent) {
          addParent(context.node, context.parent);
        }
      }
    });
    this.$$_snapshot = deepClone(this);
  },

  $$_markDirty() {
    Observable.schedule(this);
  }

});

let getChanges = function(obj) {
  let prev = obj.$$_snapshot;
  let curr = obj;
  let shallowEquals = function(a, b) {
    if (a.$$_uuid && b.$$_uuid) {
      return a.$$_uuid === b.$$_uuid;
    }
    return a === b;
  };
  let changes = diff(prev, curr, shallowEquals);
  return changes;
};

let resolveParentsFromChanges = function(changeMap) {
  let uuidMap = {};
  for (let node of cloneMap(changeMap).keys()) {
    uuidMap[node.$$_uuid] = node;
  }
  for (let [node, changes] of cloneMap(changeMap).entries()) {
    changes.forEach(function(item) {
      if (
        item.value
        &&
        typeof item.value === 'object'
        &&
        item.value.$$_uuid
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
    let childChanges = result.get(child) || [];
    traverseUp(child, '$$_parents', (context) => {
      if (context.node === child) {
        return;
      }
      let parent = context.node;
      let parentChanges = result.get(parent) || [];
      let changes = childChanges.map(function(c) {
        c = clone(c);
        c.path = [...context.path, ...c.path];
        return c;
      });
      result.set(parent, [...parentChanges, ...changes]);
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
