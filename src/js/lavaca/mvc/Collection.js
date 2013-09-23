define(function(require) {

  var Model = require('lavaca/mvc/Model'),
      Connectivity = require('lavaca/net/Connectivity'),
      ArrayUtils = require('lavaca/util/ArrayUtils'),
      Promise = require('lavaca/util/Promise'),
      clone = require('mout/lang/deepClone'),
      merge = require('mout/object/merge');

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
      return (attrA === attrB)
              ? 0
              : attrA < attrB
                ? compareVal
                : -compareVal;
    };
  }

  // Virtual type
  /**
   * Event type used when a model in a collection has an event
   * @class lavaca.mvc.ItemEvent
   * @extends lavaca.events.EventDispatcher

   *
   * @property {Lavaca.mvc.Collection} target
   * @default null
   * The collection that contains (or contained) the model that caused the event
   *
   * @property {Lavaca.mvc.Model} model
   * @default null
   * The model that caused the event
   *
   * @property {Number} index
   * @default null
   * The index of the event-causing model in the collection
   *
   * @property {Number} previousIndex
   * @default null
   * The index of the event-causing model before the event
   */

  /**
   * @class lavaca.mvc.Collection
   * @super Model
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
   *
   * @constructor
   * @param {Array} models  A list of models to add to the collection
   * @param {Object} [map]  A parameter hash to apply to the collection
   */
  var Collection = Model.extend(function(models, map) {
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
     * Whether to allow duplicated IDs in collection items. If false, a later added item will overwrite the one with same ID.
     * @property allowDuplicatedIds
     * @default false
     *
     * @type Boolean
     */
    allowDuplicatedIds: false,
    /**
     * Removes and disposes of all models in the collection
     * @method clear
     *
     */
//  @event removeItem
    clear: function() {
      Model.prototype.clear.apply(this, arguments);
      this.clearModels();
    },
    /**
     * clears only the models in the collection
     * @method clearModels
     *
     */
    clearModels: function() {
      var model;
      while (!!(model = this.models[0])) {
        this.remove(model);
      }
      this.changedOrder = false;
      this.addedItems.length
        = this.removedItems.length
        = this.changedItems.length
        = this.models.length
        = 0;
    },
    /**
     * Readies data to be an item in the collection
     * @method prepare
     *
     * @param {Object} data  The model or object to be added
     * @return {Lavaca.mvc.Model}  The model derived from the data
     */
    prepare: function(data) {
      var model = data instanceof this.TModel
            ? data
            : this.TModel.prototype instanceof Collection
              ? new this.TModel(data[this.TModel.prototype.itemsProperty], data)
              : new this.TModel(data),
          index = ArrayUtils.indexOf(this.models, model);
      if (index === -1) {
        model
          .on('change', this.onItemEvent, this)
          .on('invalid', this.onItemEvent, this)
          .on('saveSuccess', this.onItemEvent, this)
          .on('saveError', this.onItemEvent, this);
      }
      return model;
    },
    /**
     * Determines whether or not an attribute can be assigned
     * @method canSet
     *
     * @param {String} attribute  The name of the attribute
     * @return {Boolean}  True if you can assign to the attribute
     */
    canSet: function(attribute) {
      return attribute !== this.itemsProperty;
    },
    /**
     * Inserts one or more items into the collection at the specified index
     * @method insert
     *
     * @param {Number} insertIndex  index at which items will be inserted
     * @param {Array} newItems  Array of objects or Models to insert
     * @return {Boolean}  false if no items were able to be added, true otherwise.
     */
    /**
     * Inserts one or more items into the collection at the specified index
     * @method insert
     * @param {Number} insertIndex  index at which items will be inserted
     * @params {Object} items  One or more objects or Models to insert
     * @return {Boolean}  false if no items were able to be added, true otherwise.
     */
//@event addItem
    
    insert: function(insertIndex, item /*, item1, item2, item3...*/) {
      var result = false,
          idAttribute = this.TModel.prototype.idAttribute,
          compareObj = {},
          id,
          i,
          j,
          model,
          index,
          items;
      items = item && ArrayUtils.isArray(item) ? item : Array.prototype.slice.call(arguments, 1);
      for (i = 0, j = items.length; i < j; i++) {
        model = items[i];
        if (typeof model === 'object') {
          model = this.prepare(model);

          // If it's a duplicate, remove the old item
          id = model.get(idAttribute);
          if (id !== null) {
            compareObj[idAttribute] = id;
            index = this.indexOf(compareObj);
            if (index > -1 && !this.allowDuplicatedIds) {
              this.remove(index);
            }
          }

          this.models.splice(insertIndex, 0, model);
          if (!this.suppressTracking) {
            ArrayUtils.remove(this.removedItems, model);
            ArrayUtils.remove(this.changedItems, model);
            ArrayUtils.pushIfNotExists(this.addedItems, model);
          }
          _triggerItemEvent(this, 'addItem', null, insertIndex, this.models[insertIndex]);
          insertIndex++;
          result = true;
        } else {
          throw 'Only objects can be added to a Collection.';
        }
      }

      return result;
    },
    /**
     * Adds one or more items to the collection. Items with IDs matching an item already in this collection will replace instead of add.
     * @method add
     *
     * @params {Object} item  One or more items to add to the collection
     * @return {Boolean}  True if an item was added, false otherwise
     */
    /**
     * Adds one or more items to the collection. Items with IDs matching an item already in this collection will replace instead of add.
     * @method add
     *
     * @params {Array} items  An array of items to add to the collection
     * @return {Boolean}  True if an item was added, false otherwise
     */
// * @event addItem
    add: function(/* item1, item2, itemN */) {
      if (arguments.length && arguments[0] instanceof Array) {
        return this.add.apply(this, arguments[0]);
      }
      return this.insert.call(this, this.count(), Array.prototype.slice.call(arguments, 0));
    },
    /**
     * Moves an item
     * @method moveTo
     *
     * @param {Lavaca.mvc.Model} model  The model to move
     * @param {Number} newIndex  The new index at which the model should be placed
     *
     */
    /**
     * Moves an item
     * @method moveTo
     *
     * @param {Number} oldIndex  The current index of the model
     * @param {Number} newIndex  The new index at which the model should be placed
     */
// * @event moveItem
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
     * Removes an item from the collection
     * @method remove
     * @params {Number} index  The index of the model to remove
     * @return {Boolean}  True if an item was removed, false otherwise
     *
     */
    /**
     * Removes an item from the collection
     * @method remove
     * @params {Lavaca.mvc.Model} item  The models to remove from the collection
     * @return {Boolean}  True if an item was removed, false otherwise
     *
     */
    /**
     * Removes an item from the collection
     * @method remove
     * @param {Object} item  One object containing attributes matching any models to remove
     * @return {Boolean}  True if at least one item was removed, false otherwise
     *
     */
    /**
     * Removes an item from the collection
     * @method remove
     * @param {Object} item  N number of object arguments containing attributes matching any models to remove
     * @return {Array}  An array of booleans indicating if at least one item was removed by matching each argument
     *
     */
    /**
     * Removes an item from the collection
     * @method remove
     * @param {Array} items  An array of objects containing attributes matching any models to remove
     * @return {Array}  An array of booleans indicating if at least one item was removed by matching each element in the array
     */
    /**
     * Removes an item from the collection
     * @method remove
     * @param {Function} test  A function to check each model in the collection in the form
     *     test(index, model). If the test function returns true, the model will be removed
     * @return {Boolean}  True if at least one item was removed, false otherwise
     */
//* @event removeItem

    remove: function(item /*, item1, item2, item3...*/) {
      var n, it, items, index, i, removed;

      if (arguments.length === 1 && ArrayUtils.isArray(item)) {
        n = 0;
        removed = [];
        while (!!(it = item[n++])) {
          removed.push(this.remove(it));
        }
        return removed;
      } else if (arguments.length > 1) {
        // Prevent passing multiple numeric arguments,
        // which could have unexpected behavior
        if (typeof item === 'number' && item % 1 === 0) { // is integer
          return this.remove(item);
        } else {
          return this.remove([].slice.call(arguments));
        }
      }

      if (item instanceof this.TModel) {
        index = ArrayUtils.remove(this.models, item);
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
      } else if (typeof item === 'number' && item % 1 === 0) { // is integer
        if (item >= 0 && item < this.count()) {
          return this.remove(this.itemAt(item));
        } else {
          return false;
        }
      } else {
        items = this.filter(item),
        i = -1,
        removed = false;
        while (!!(item = items[++i])) {
          removed = this.remove(item) || removed;
        }
        return removed;
      }
    },
    /**
     * Compiles a list of items matching an attribute hash
     * @method filter
     *
     * @param {Object} The attributes to test against each model
     * @return {Array}  A list of this collection's models that matched the attributes
     */
    /**
     * Compiles a list of items matching an attribute hash
     * @method filter
     *
     * @param {Object} attributes  The attributes to test against each model
     * @param {Number} maxResults  The maximum number of results to return
     * @return {Array}  A list of this collection's models that matched the attributes
     */
    /**
     * Compiles a list of items matching an attribute hash
     * @method filter
     *
     * @param {Function} test  A function to check each model in the collection in the form
     *     test(index, model). If the test function returns true, the model will be included
     *     in the result
     * @return {Array}  A list of this collection's models that passed the test
     */

    /**
     * Compiles a list of items matching an attribute hash
     * @method filter
     *
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
          attrs;
      if (typeof test !== 'function') {
        attrs = test;
        test = function(index, item) {
          for (var n in attrs) {
            if (item.get(n) !== attrs[n]) {
              return false;
            }
          }
          return true;
        };
      }
      while (!!(item = this.models[++i])) {
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
     * Finds the first item matching an attribute hash
     * @method first
     *
     * @param {Object} attributes  The attributes to test against each model
     * @return {Lavaca.mvc.Model}  The first model that matched the attributes (or null)
     */
     /**
     * Finds the first item that passed a functional test
     * @method first
     *
     * @param {Function} test  A function to check each model in the collection in the form
     *     test(index, model). If the test function returns true, the model will be included
     *     as the result
     * @return {Lavaca.mvc.Model}  The first model that passed the test (or null)
     */
    first: function(test) {
      return this.filter(test, 1)[0] || null;
    },
    /**
     * Finds the index of the first item matching an attribute hash
     * @method indexOf
     *
     * @sig
     * Finds the index of the first item matching an attribute hash
     * @param {Object} attributes  The attributes to test against each model
     * @return {Number}  Index of the matching model, or -1 if no match is found
     */
    /**
     * Finds the index of the first item that passed a functional test
     * @method indexOf
     * @param {Function} test  A function to check each model in the collection in the form
     *     test(index, model). If the test function returns true, the model will be included
     *     as the result
     * @return {Number}  Index of the matching model, or -1 if no match is found
     */
    indexOf: function(test) {
      var match = this.first(test);
      return match ? ArrayUtils.indexOf(this.models, match) : -1;
    },
    /**
     * Gets the item at a specific index
     * @method itemAt
     *
     * @param {Number} index  The index of the item
     * @return {Lavaca.mvc.Model}  The model at that index
     */
    itemAt: function(index) {
      return this.models[index];
    },
    /**
     * Gets the number of items in the collection
     * @method count
     *
     * @return {Number}  The number of items in the collection
     */
    count: function() {
      return this.models.length;
    },
    /**
     * Executes a callback for each model in the collection. To stop iteration immediately,
     * return false from the callback.
     * @method each
     *
     * @param {Function} callback  A function to execute for each item, callback(index, model)
     */
    /**
     * Executes a callback for each model in the collection. To stop iteration immediately,
     * return false from the callback.
     * @method each
     * @param {Function} callback  A function to execute for each item, callback(index, model)
     * @param {Object} thisp  The context of the callback
     */
    each: function(cb, thisp) {
      var i = -1,
          returned,
          item;
      while (!!(item = this.itemAt(++i))) {
        returned = cb.call(thisp || this, i, item);
        if (returned === false) {
          break;
        }
      }
    },
    /**
     * Sorts the models in the collection using the specified attribute, in ascending order.
     * @method sort
     *
     * @param {String} attribute  Attribute to sort by
     * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
     */
    /**
     * Sorts the models in the collection using the specified attribute, in either ascending or descending order.
     * @method sort
     *
     * @param {String} attribute  Attribute to sort by
     * @param {Boolean}  descending  Use descending sort. Defaults to false
     * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
     *
     */
    /**
     * Sorts the models in the collection according to the specified compare function.
     * @method sort
     *
     * @param {Function} compareFunction  A function that compares two models. It should work
     *     in the same manner as the default Array.sort method in javascript.  i.e. the function
     *     should have a signature of function(modelA, modelB) and should return a negative integer
     *     if modelA should come before modelB, a positive integer if modelB should come before modelA
     *     and integer 0 if modelA and modelB are equivalent.
     * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
     */
//* @event moveItem

    sort: function(attribute, descending) {
      var comparator = typeof attribute === "function" ? attribute : _getComparator(attribute, descending),
          oldModels = clone(this.models),
          oldIndex;
      this.models.sort(comparator, this);
      if (!this.suppressTracking) {
        this.changedOrder = true;
      }
      if (!this.suppressEvents) {
        this.each(function(index, model) {
          oldIndex = ArrayUtils.indexOf(oldModels, model);
          if (oldIndex !== index) {
            _triggerItemEvent(this, 'moveItem', ArrayUtils.indexOf(oldModels, model), index, model);
          }
        });
      }
      return this;
    },
    /**
     * Reverses the order of the models in the collection
     * @method reverse
     *
     * @return {Lavaca.mvc.Collection}  The updated collection (for chaining)
     */
//* @event moveItem
    reverse: function() {
      var oldModels = clone(this.models),
          oldIndex;
      this.models.reverse();
      if (!this.suppressTracking) {
        this.changedOrder = true;
      }
      if (!this.suppressEvents) {
        this.each(function(index, model) {
          oldIndex = ArrayUtils.indexOf(oldModels, model);
          if (oldIndex !== index) {
            _triggerItemEvent(this, 'moveItem', ArrayUtils.indexOf(oldModels, model), index, model);
          }
        });
      }
      return this;
    },
    /**
     * Handler invoked when an item in the collection has an event. Triggers an [[Lavaca.mvc.ItemEvent]].
     * @method onItemEvent
     *
     * @param {Lavaca.mvc.ModelEvent} e  The item event
     */
    onItemEvent: function(e) {
      var model = e.target,
          index = ArrayUtils.indexOf(this.models, model);
      if (e.type === 'change') {
        ArrayUtils.pushIfNotExists(this.changedItems, model);
      } else if (e.type === 'saveSuccess') {
        ArrayUtils.remove(this.changedItems, model);
      }
      this.trigger(e.type + 'Item', merge({}, e, {
        target: model,
        model: model,
        index: index,
        previousIndex: null
      }));
    },
    /**
     * Processes the data received from a fetch request
     * @method onFetchSuccess
     *
     * @param {Object} response  The response data
     */
    onFetchSuccess: function(response) {
      var list;
      response = this.parse(response);
      if (this.responseFilter && typeof this.responseFilter === 'function') {
        response = this.responseFilter(response);
      }
      list = response;
      if (!(list instanceof Array)) {
        this.apply(response);
        if (response && response.hasOwnProperty(this.itemsProperty)) {
          list = response[this.itemsProperty];
        }
      }
      this.add.apply(this, list);
      this.trigger('fetchSuccess', {response: response});
    },
    /**
     * Saves the model to the server via POST
     * @method saveToServer
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
        return (new Promise(this)).when(Connectivity.ajax({
          url: url,
          cache: false,
          type: 'POST',
          data: data,
          dataType: 'json'
        }));
      });
    },
    /**
     * Converts this model to a key-value hash
     * @method toObject
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
      while (!!(item = this.models[++i])) {
        items[obj[prop].length] = idOnly && !item.isNew() ? item.id() : item.toObject();
      }
      return obj;
    },
    /**
    * Filters the raw response from onFetchSuccess() down to a custom object. (Meant to be overriden)
    * @method responseFilter
    *
    * @param {Object} response  The raw response passed in onFetchSuccess()
    * @return {Object}  An object or array to be applied to this collection instance
    */
    responseFilter: function(response) {
      return response;
    }
  });

  return Collection;

});
