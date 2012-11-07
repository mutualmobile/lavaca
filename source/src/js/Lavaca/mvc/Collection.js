/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Model, Cache, Promise, ArrayUtils) {

var UNDEFINED;

function _triggerItemEvent(collection, event, previousIndex, index, model) {
  collection.trigger(event, {
    previousIndex: previousIndex,
    index: index,
    model: model
  });
}

function _getComparator(attr, descending) {
  var compareVal = descending ? 1 : -1;
  return function(modelA, modelB) {
    var attrA = modelA.get(attr),
        attrB = modelB.get(attr);
    return attrA == attrB
            ? 0
            : attrA < attrB
              ? compareVal
              : -compareVal;
  };
}

// Virtual type
/**
 * @class Lavaca.mvc.ItemEvent
 * @super Event
 * Event type used when a model in a collection has an event
 *
 * @field {Lavaca.mvc.Collection} target
 * @default null
 * The collection that contains (or contained) the model that caused the event
 *
 * @field {Lavaca.mvc.Model} model
 * @default null
 * The model that caused the event
 *
 * @field {Number} index
 * @default null
 * The index of the event-causing model in the collection
 *
 * @field {Number} previousIndex
 * @default null
 * The index of the event-causing model before the event
 */

/**
 * @class Lavaca.mvc.Collection
 * @super Lavaca.mvc.Model
 * Basic model collection type
 *
 * @event change
 * @event invalid
 * @event fetchSuccess
 * @event fetchError
 * @event saveSuccess
 * @event saveError
 * @event changeItem
 * @event invalidItem
 * @event saveSuccessItem
 * @event saveErrorItem
 * @event moveItem
 *
 * @constructor
 *
 * @constructor
 * @param {Array} models  A list of models to add to the collection
 *
 * @constructor
 * @param {Array} models  A list of models to add to the collection
 * @param {Object} map  A parameter hash to apply to the collection
 */
ns.Collection = Model.extend(function(models, map) {
  Model.call(this, map);
  this.models = [];
  this.changedOrder = false;
  this.addedItems = [];
  this.removedItems = [];
  this.changedItems = [];
  if (models) {
    this.suppressEvents = true;
    this.add.apply(this, models);
    this.suppressEvents = false;
  }
}, {
  /**
   * @field {Function} TModel
   * @default [[Lavaca.mvc.Model]]
   * The type of model object to use for items in this collection
   */
  TModel: ns.Model,
  /** 
   * @field {String} itemsProperty
   * @default 'items'
   * The name of the property containing the collection's items when using toObject()
   */
  itemsProperty: 'items',
  /**
   * @method clear
   * Removes and disposes of all models in the collection
   */
  clear: function() {
    Model.prototype.clear.apply(this, arguments);
    var i = -1,
        model;
    while (model = this.models[++i]) {
      this.remove(model);
    }
    this.changedOrder = false;
    this.addedItems.length
      = this.removedItems.length
      = this.changedItems.length
      = this.models.length = 0;
  },
  /**
   * @method prepare
   * Readies data to be an item in the collection
   *
   * @param {Object} data  The model or object to be added
   * @return {Lavaca.mvc.Model}  The model derived from the data
   */
  prepare: function(data) {
    var model = data instanceof this.TModel
          ? data
          : this.TModel.prototype instanceof ns.Collection
            ? new this.TModel(data[this.TModel.prototype.itemsProperty], data)
            : new this.TModel(data),
        index = ArrayUtils.indexOf(this.models, model);
    if (index == -1) {
      model
        .on('change', this.onItemEvent, this)
        .on('invalid', this.onItemEvent, this)
        .on('saveSuccess', this.onItemEvent, this)
        .on('saveError', this.onItemEvent, this);
    }
    return model;
  },
  /**
   * @method canSet
   * Determines whether or not an attribute can be assigned
   *
   * @param {String} attribute  The name of the attribute
   * @return {Boolean}  True if you can assign to the attribute
   */
  canSet: function(attribute) {
    return attribute != this.itemsProperty;
  },
  /**
   * @method add
   * Adds one or more items to the collection
   *
   * @event add
   *
   * @sig
   * @params {Object} item  The items to add to the collection
   * @return {Boolean}  True if an item was added, false otherwise
   *
   * @sig
   * @params {Array} items  An array of items to add to the collection
   * @return {Boolean}  True if an item was added, false otherwise
   */
  add: function(/* item1, item2, itemN */) {
    if (arguments.length && arguments[0] instanceof Array) {
      return this.add.apply(this, arguments[0]);
    }
    var result = false,
        obj,
        i,
        j,
        model,
        isModel,
        isModelInArray;
    for (i = 0, j = arguments.length; i < j; i++) {
      model = arguments[i];
      isModel = model instanceof this.TModel;
      isModel || (obj = model);
      model = this.prepare(model);
      isModelInArray = this.first(obj || model.toObject());
      if (!isModelInArray) {
        this.models.push(model);
        if (!this.suppressTracking) {
          ArrayUtils.remove(this.removedItems, model);
          ArrayUtils.remove(this.changedItems, model);
          ArrayUtils.pushIfNotExists(this.addedItems, model);
        }
        _triggerItemEvent(this, 'addItem', null, this.models.length - 1, model);
        result = true;
      }
    }
    return result;
  },
  /**
   * @method moveTo
   * Moves an item
   *
   * @sig
   * @param {Lavaca.mvc.Model} model  The model to move
   * @param {Number} newIndex  The new index at which the model should be placed
   *
   * @sig
   * @param {Number} oldIndex  The current index of the model
   * @param {Number} newIndex  The new index at which the model should be placed
   */
  moveTo: function(oldIndex, newIndex) {
    if (oldIndex instanceof this.TModel) {
      oldIndex = ArrayUtils.indexOf(this.models, oldIndex);
    }
    if (oldIndex > -1) {
      var model = this.models.splice(oldIndex, 1)[0];
      if (model) {
        this.models.splice(newIndex, 0, model);
        if (!this.suppressTracking) {
          this.changedOrder = true;
        }
        _triggerItemEvent(this, 'moveItem', oldIndex, newIndex, model);
      }
    }
  },
  /**
   * @method remove
   * Removes an item from the collection
   *
   * @event remove
   *
   * @sig
   * @params {Lavaca.mvc.Model} item  The models to remove from the collection
   * @return {Boolean}  True if an item was removed, false otherwise
   *
   * @sig
   * @param {Object} attributes  A set of attributes matching any models to remove
   * @return {Boolean}  True if at least one item was removed, false otherwise
   *
   * @sig
   * @param {Function} test  A function to check each model in the collection in the form
   *     test(index, model). If the test function returns true, the model will be removed
   * @return {Boolean}  True if at least one item was removed, false otherwise
   */
  remove: function(item) {
    if (item instanceof this.TModel) {
      var index = ArrayUtils.remove(this.models, item);
      if (index > -1) {
        if (!this.suppressTracking) {
          ArrayUtils.remove(this.addedItems, item);
          ArrayUtils.remove(this.changedItems, item);
          ArrayUtils.pushIfNotExists(this.removedItems, item);
        }
        item
          .off('change', this.onItemEvent)
          .off('invalid', this.onItemEvent)
          .off('saveSuccess', this.onItemEvent)
          .off('saveError', this.onItemEvent);
        _triggerItemEvent(this, 'removeItem', index, null, item);
        return true;
      } else {
        return false;
      }
    } else {
      var items = this.filter(item),
          i = -1,
          removed = false;
      while (item = items[++i]) {
        removed = this.remove(item) || removed;
      }
      return removed;
    }
  },
  /**
   * @method filter
   *
   * @sig
   * Compiles a list of items matching an attribute hash
   * @param {Object} The attributes to test against each model
   * @return {Array}  A list of this collection's models that matched the attributes
   *
   * @sig
   * Compiles a list of items matching an attribute hash
   * @param {Object} attributes  The attributes to test against each model
   * @param {Number} maxResults  The maximum number of results to return
   * @return {Array}  A list of this collection's models that matched the attributes
   *
   * @sig
   * Compiles a list of items passing a test
   * @param {Function} test  A function to check each model in the collection in the form
   *     test(index, model). If the test function returns true, the model will be included
   *     in the result
   * @return {Array}  A list of this collection's models that passed the test
   *
   * @sig
   * Compiles a list of items passing a test
   * @param {Function} test  A function to check each model in the collection in the form
   *     test(index, model). If the test function returns true, the model will be included
   *     in the result
   * @param {Number} maxResults  The maximum number of results to return
   * @return {Array}  A list of this collection's models that passed the test
   */
  filter: function(test, maxResults) {
    maxResults = maxResults === UNDEFINED ? Number.MAX_VALUE : maxResults;
    var result = [],
        i = -1,
        item,
        attrs,
        n;
    if (typeof test != 'function') {
      attrs = test;
      test = function(index, item) {
        for (n in attrs) {
          if (item.get(n) != attrs[n]) {
            return false;
          }
        }
        return true;
      };
    }
    while (item = this.models[++i]) {
      if (test(i, item)) {
        result.push(item);
        if (--maxResults < 1) {
          break;
        }
      }
    }
    return result;
  },
  /**
   * @method first
   *
   * @sig
   * Finds the first item matching an attribute hash
   * @param {Object} attributes  The attributes to test against each model
   * @return {Lavaca.mvc.Model}  The first model that matched the attributes (or null)
   *
   * @sig
   * Finds the first item that passed a functional test
   * @param {Function} test  A function to check each model in the collection in the form
   *     test(index, model). If the test function returns true, the model will be included
   *     as the result
   * @return {Lavaca.mvc.Model}  The first model that passed the test (or null)
   */
  first: function(test) {
    return this.filter(test, 1)[0] || null;
  },
  /**
   * @method itemAt
   * Gets the item at a specific index
   *
   * @param {Number} index  The index of the item
   * @return {Lavaca.mvc.Model}  The model at that index
   */
  itemAt: function(index) {
    return this.models[index];
  },
  /**
   * @method count
   * Gets the number of items in the collection
   *
   * @return {Number}  The number of items in the collection
   */
  count: function() {
    return this.models.length;
  },
  /**
   * @method each
   * Executes a callback for each model in the collection
   *
   * @sig
   * @param {Function} callback  A function to execute for each item, callback(index, model)
   *
   * @sig
   * @param {Function} callback  A function to execute for each item, callback(index, model)
   * @param {Object} thisp  The context of the callback
   */
  each: function(cb, thisp) {
    var i = -1,
        item;
    while (item = this.itemAt(++i)) {
      cb.call(thisp || this, i, item);
    }
  },
  /**
   * @method sort
   *
   * @sig
   * Sorts the models in the collection using the specified attribute, in ascending order.
   * @param {String} attribute  Attribute to sort by
   * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
   *
   * @sig
   * Sorts the models in the collection using the specified attribute, in either ascending or descending order.
   * @param {String} attribute  Attribute to sort by
   * @param {Boolean}  descending  Use descending sort. Defaults to false
   * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
   *
   * @sig
   * Sorts the models in the collection according to the specified compare function.
   * @param {Function} compareFunction  A function that compares two models. It should work
   *     in the same manner as the default Array.sort method in javascript.  i.e. the function
   *     should have a signature of function(modelA, modelB) and should return a negative integer
   *     if modelA should come before modelB, a positive integer if modelB should come before modelA
   *     and integer 0 if modelA and modelB are equivalent.
   * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
   */
  sort: function(attribute, descending) {
    var comparator = typeof attribute === "function" ? attribute : _getComparator(attribute, descending),
        oldModels = Lavaca.clone(this.models);
    this.models.sort(comparator, this);
    if (!this.suppressTracking) {
      this.changedOrder = true;
    }
    this.trigger('rearrange', {oldModels: oldModels, newModels: this.models});
    return this;
  },
  /**
   * @method reverse
   * Reverses the order of the models in the collection
   *
   * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
   */
  reverse: function() {
    var oldModels = Lavaca.clone(this.models);
    this.models.reverse();
    if (!this.suppressTracking) {
      this.changedOrder = true;
    }
    this.trigger('rearrange', {oldModels: oldModels, newModels: this.models});
    return this;
  },
  /**
   * @method onItemEvent
   * Handler invoked when an item in the collection has an event. Triggers an [[Lavaca.mvc.ItemEvent]].
   *
   * @param {Lavaca.mvc.ModelEvent} e  The item event
   */
  onItemEvent: function(e) {
    var model = e.target,
        index = ArrayUtils.indexOf(this.models, model);
    if (e.type == 'change') {
      ArrayUtils.pushIfNotExists(this.changedItems, model);
    } else if (e.type == 'saveSuccess') {
      ArrayUtils.remove(this.changedItems, model);
    }
    this.trigger(e.type + 'Item', Lavaca.merge({}, e, {
      target: model,
      model: model,
      index: index,
      previousIndex: null
    }));
  },
  /**
   * @method onFetchSuccess
   * Processes the data received from a fetch request
   *
   * @param {Object} response  The response data
   */
  onFetchSuccess: function(response) {
    response = this.parse(response);
    var list = response;
    if (!(list instanceof Array)) {
      this.apply(response);
      list = response[this.itemsProperty];
    }
    this.add.apply(this, list);
    this.trigger('fetchSuccess', {response: response});
  },
  /**
   * @method saveToServer
   * Saves the model to the server via POST
   *
   * @param {String} url  The URL to which to post the data
   * @return {Lavaca.util.Promise}  A promise
   */
  saveToServer: function(url) {
    return this.save(function(model, changedAttributes, attributes) {
      var id = this.id(),
          data;
      if (this.isNew()) {
        data = attributes;
      } else {
        changedAttributes[this.idAttribute] = id;
        data = changedAttributes;
      }
      return (new Promise(this)).when(Lavaca.net.Connectivity.ajax({
        url: url,
        cache: false,
        type: 'POST',
        data: data,
        dataType: 'json'
      }));
    });
  },
  /**
   * @method toObject
   * Converts this model to a key-value hash
   *
   * @param {Boolean} idOnly  When true, only include item IDs for pre-existing items
   * @return {Object}  The key-value hash
   */
  toObject: function(idOnly) {
    var obj = Model.prototype.toObject.apply(this, arguments),
        prop = this.itemsProperty,
        items = obj[prop] = [],
        i = -1,
        item;
    while (item = this.models[++i]) {
      items[obj[prop].length] = idOnly && !item.isNew() ? item.id() : item.toObject();
    }
    return obj;
  }
});

})(Lavaca.mvc, Lavaca.mvc.Model, Lavaca.util.Cache, Lavaca.util.Promise, Lavaca.util.ArrayUtils);