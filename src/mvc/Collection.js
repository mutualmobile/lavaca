import Model from 'lavaca/mvc/Model';
import Observable from '../util/Observable';

let coerceIntoModel = function(TModel, item) {
  if (item.constructor === TModel) {
    return item;
  }
  return new TModel(item);
};

let intersection = function(a, b, equals) {
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
};

let merge = function(a, b, equals) {
  let result = [];
  let rest = [];
  intersection(a, b, equals)
    .forEach((item) => {
      if (item.left && item.right) {
        result.push(item.right);
      }
      else if (item.left) {
        result.push(item.left);
      }
      else if (item.right) {
        rest.push(item.right);
      }
    });
  result.push(...rest);
  return result;
};

class Collection extends Model {
  constructor(list = []) {
    super(list);
  }

  static get TModel() {
    return Model;
  }

  $equals(a, b) {
    return a === b;
  }

  $merge(list) {
    return this.$apply(
      merge(this, list, this.$equals.bind(this))
    );
  }

  $apply(list) {
    if (list) {
      list = intersection(list, this, this.$equals.bind(this))
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
      this[i] = coerceIntoModel(this.constructor.TModel, this[i]);
    }

    return Observable.prototype.$apply.call(this);
  }

  push(...list) {
    this.$$_markDirty();
    list = list.map(coerceIntoModel.bind(this, this.constructor.TModel));
    return Array.prototype.push.apply(this, list);
  }

  splice(start, deleteCount, ...list) {
    this.$$_markDirty();
    if (arguments.length <= 2) {
      return Array.prototype.splice.apply(this, arguments);
    }
    list = list.map(coerceIntoModel.bind(this, this.constructor.TModel));
    return Array.prototype.splice.call(this, start, deleteCount, ...list);
  }

  unshift(...list) {
    this.$$_markDirty();
    list = list.map(coerceIntoModel.bind(this, this.constructor.TModel));
    return Array.prototype.unshift.apply(this, list);
  }

}

export default Collection;
