import {EventDispatcher, Model} from 'lavaca';
import Observable from '../util/Observable';
import {merge} from 'mout/object';

let Collection = Model.extend(function Collection(list = []) {
  Model.call(this);
  _init.call(this,list);
}, {
  /**
   * The type of model object to use for items in this collection
   * @property TModel
   * @default [[Lavaca.mvc.Model]]
   *
   * @type Function
   */

  TModel: Model,
  /**
   * The name of the property containing the collection's items when using toObject()
   * @property itemsProperty
   * @default 'items'
   *
   * @type String
   */
 itemsProperty: 'items',
  /**
   * The name of the property containing the collection's items when using toObject()
   * @property itemsProperty
   * @default 'items'
   *
   * @type String
   */
  on(key,callback) {
    if(key.split('.')[0] == 'change'){
      return this.models.$on(key,callback);
    }
    return EventDispatcher.prototype.on.call(this, key, callback);
  },
  /**
   * Bind an event handler to this object
   * @method off
   *
   *
   * @param {String} type  The name of the event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
   */
  off(key,callback) {
    if(key.split('.')[0] == 'change'){
      return this.models.$off(key,callback);
    }
    return EventDispatcher.prototype.off.call(this, key, callback);
  },
  /**
   * Removes and disposes of all models in the collection
   * @method clear
   *
   */
  clear() {
    Model.prototype.clear.apply(this, arguments);
    this.clearModels();
  },
  /**
   * clears only the models in the collection
   * @method clearModels
   *
   */
  clearModels() {
    this.models.$apply([]);
  },
  /**
   * Converts this model to a key-value hash
   * @method toObject
   *
   * @return {Object}  The key-value hash
   */
  toObject() {
    var obj = Model.prototype.toObject.apply(this, arguments),
        prop = this.itemsProperty,
        items = obj[prop] = [],
        i = -1,
        item;
    while (!!(item = this.models[++i])) {
      if(item.toObject){
        items[obj[prop].length] = item.toObject();
      }
    }
    return obj;
  },
  /**
   * Processes the data received from an object and apply it to self and the child models.
   * @method deepApply
   *
   * @param {Object} obj  An object to apply to self and children
   */
  deepApply(obj) {
    var list;
    obj = this.parse(obj);
    list = obj;
    if (!(list instanceof Array)) {
      this.apply(obj);
      if (obj && obj.hasOwnProperty(this.itemsProperty)) {
        list = obj[this.itemsProperty];
      }
    }
    this.models.push(list);
    this.models.$apply();
    this.trigger('deepApply', {obj: obj});
  }
});

function _init(arr){
  arr = Array.isArray(arr) ? arr.map(_coerceIntoModel.bind(this, this.TModel)) : [];
  this.models = new Observable(arr);
  this.models.TModel = this.TModel;
  this.models.push = _push;
  this.models.unshift = _unshift;
  this.models.splice = _splice;
  this.models.$apply = _apply;
}

function _equals(a, b) {
  return a === b;
}

function _apply(list) {
  if (list) {
    list = intersection(list, this, _equals.bind(this))
      .filter((item) => {
        return item.left !== undefined;
      })
      .map((item) => {
        if (item.right) {
          return item.right.$apply(item.left);
        }
        else {
          return item.left;
        }
      });

    Array.prototype.splice.apply(this, [0, this.length, ...list]);
  }

  for (let i = 0; i < this.length; i++) {
    this[i] = _coerceIntoModel(this.TModel, this[i]);
  }

  return Observable.prototype.$apply.call(this);
}

function _push(...list) {
  this.$$_markDirty();
  list = list.map(_coerceIntoModel.bind(this, this.TModel));
  return Array.prototype.push.apply(this, list);
}

function _splice(start, deleteCount, ...list) {
  this.$$_markDirty();
  if (arguments.length <= 2) {
    return Array.prototype.splice.apply(this, arguments);
  }
  list = list.map(_coerceIntoModel.bind(this, this.TModel));
  return Array.prototype.splice.call(this, start, deleteCount, ...list);
}

function _unshift(...list) {
  this.$$_markDirty();
  list = list.map(_coerceIntoModel.bind(this, this.TModel));
  return Array.prototype.unshift.apply(this, list);
}

function _coerceIntoModel(TModel, item) {
  if (item.constructor === TModel) {
    return item;
  }
  return new TModel(item);
}

function intersection(a, b, equals) {
  let result = [];
  let matchIndexes = [];

  for (let i = 0; i < a.length; i++) {
    let didInsert = false;
    for (let j = 0; j < b.length; j++) {
      if (equals(a[i], b[j])) {
        result.push({
          left: a[i],
          right: b[j]
        });
        matchIndexes.push(j);
        didInsert = true;
        break;
      }
    }
    if (!didInsert) {
      result.push({
        left: a[i],
        right: undefined
      });
    }
  }

  for (let i = 0; i < b.length; i++) {
    if (matchIndexes.indexOf(i) === -1) {
      result.push({
        left: undefined,
        right: b[i]
      });
    }
  }

  return result;
}

export default Collection;
