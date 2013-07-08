define(function(require) {

  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      Connectivity = require('lavaca/net/Connectivity'),
      ArrayUtils = require('lavaca/util/ArrayUtils'),
      Cache = require('lavaca/util/Cache'),
      Promise = require('lavaca/util/Promise'),
      clone = require('mout/lang/deepClone'),
      merge = require('mout/object/merge'),
      Config = require('lavaca/util/Config');


  var UNDEFINED;

  function _triggerAttributeEvent(model, event, attribute, previous, value, messages) {
    model.trigger(event, {
      attribute: attribute,
      previous: previous === UNDEFINED ? null : previous,
      value: value === UNDEFINED ? model.get(attribute) : value,
      messages: messages || []
    });
  }

  function _setFlagOn(model, name, flag) {
    var keys = model.flags[flag];
    if (!keys) {
      keys = model.flags[flag] = [];
    }
    if (!ArrayUtils.contains(keys, name)) {
      keys.push(name);
    }
  }

  function _suppressChecked(model, suppress, callback) {
    suppress = !!suppress;
    var props = ['suppressValidation', 'suppressEvents', 'suppressTracking'],
        old = {},
        i = -1,
        prop,
        result;
    while (!!(prop = props[++i])) {
      old[prop] = model[prop];
      model[prop] = suppress || model[prop];
    }
    result = callback.call(model);
    i = -1;
    while (!!(prop = props[++i])) {
      model[prop] = old[prop];
    }
    return result;
  }

  function _isValid(messages){
    var isValid = true;
    for(var attribute in messages){
      if (messages[attribute].length > 0){
        isValid = false;
      }
    }
    messages.isValid = isValid;
    return messages;
  }


  // Virtual type
  /**
   * Event type used when an attribute is modified
   * @class lavaca.mvc.AttributeEvent
   * @extends Event
   */
   /**
   * The name of the event-causing attribute
   * @property {String} attribute
   * @default null
   */
   /**
   * The value of the attribute before the event
   * @property {Object} previous
   * @default null
   */
   /**
   * The value of the attribute after the event
   * @property {Object} value
   * @default null
   */
   /**
   * A list of validation messages the change caused
   * @property {Array} messages
   * @default []
   */

  /**
   * Basic model type
   * @class lavaca.mvc.Model
   * @extends lavaca.events.EventDispatcher
   *
   * Place the events where they are triggered in the code, see the yuidoc syntax reference and view.js for rendersuccess trigger
   * @event change
   * @event invalid
   * @event fetchSuccess
   * @event fetchError
   * @event saveSuccess
   * @event saveError
   *
   * @constructor
   * @param {Object} [map]  A parameter hash to apply to the model
   */
  var Model = EventDispatcher.extend(function(map) {
    EventDispatcher.call(this);
    this.attributes = new Cache();
    this.rules = new Cache();
    this.unsavedAttributes = [];
    this.flags = {};
    if (this.defaults) {
      map = merge({}, this.defaults, map);
    }
    if (map) {
      this.suppressEvents
        = this.suppressTracking
        = true;
      this.apply(map);
      this.suppressEvents
        = this.suppressTracking
        = false;
    }
  }, {
    /**
     * When true, attributes are not validated
     * @property suppressValidation
     * @default false
     *
     * @type Boolean
     */

    suppressValidation: false,
    /**
     * When true, changes to attributes are not tracked
     * @property suppressTracking
     * @default false
     *
     * @type Boolean
     */

    suppressTracking: false,
    /**
     * Gets the value of a attribute
     * @method get
     *
     * @param {String} attribute  The name of the attribute
     * @return {Object}  The value of the attribute, or null if there is no value
     */
    get: function(attribute) {
      var attr = this.attributes.get(attribute),
          flags;
      if (typeof attr === 'function') {
        flags = this.flags[Model.DO_NOT_COMPUTE];
        return !flags || ArrayUtils.indexOf(flags, attribute) === -1 ? attr.call(this) : attr;
      }
      return attr;
    },
    /**
     * Determines whether or not an attribute can be assigned
     * @method canSet
     *
     * @param {String} attribute  The name of the attribute
     * @return {Boolean}  True if you can assign to the attribute
     */
    canSet: function() {
      return true;
    },
    /**
     * Sets the value of the attribute, if it passes validation
     * @method set
     *
     * @param {String} attribute  The name of the attribute
     * @param {Object} value  The new value
     * @return {Boolean}  True if attribute was set, false otherwise
     *
     */
    /**
     * Sets the value of the attribute, if it passes validation
     * @method set
     *
     * @param {String} attribute  The name of the attribute
     * @param {Object} value  The new value
     * @param {String} flag  A metadata flag describing the attribute
     * @param {Boolean} suppress  When true, validation, events and tracking are suppressed
     * @return {Boolean}  True if attribute was set, false otherwise
     */
//* @event invalid
//* @event change


    set: function(attribute, value, flag, suppress) {
      return _suppressChecked(this, suppress, function() {
        if (!this.canSet(attribute)) {
          return false;
        }
        var previous = this.attributes.get(attribute),
            messages = this.suppressValidation ? [] : this.validate(attribute, value);
        if (messages.length) {
          _triggerAttributeEvent(this, 'invalid', attribute, previous, value, messages);
          return false;
        } else {
          if (previous !== value) {
            this.attributes.set(attribute, value);
            if (flag) {
              _setFlagOn(this, attribute, flag);
            }
            _triggerAttributeEvent(this, 'change', attribute, previous, value);
            if (!this.suppressTracking
                && !ArrayUtils.contains(this.unsavedAttributes, attribute)) {
              this.unsavedAttributes.push(attribute);
            }
          }
          return true;
        }
      });
    },
    /**
     * Determines whether or not this model has a named attribute
     * @method has
     *
     * @param {String} attribute  The name of the attribute
     * @return {Boolean}  True if the attribute exists and has a value
     */
    has: function(attribute) {
      return this.get(attribute) !== null;
    },
    /**
     * The name of the ID attribute
     * @property id
     * @default 'id'
     *
     * @type String
     */

    idAttribute: 'id',
    /**
     * Gets the ID of the model
     * @method id
     *
     * @return {String}  The ID of the model
     */
    id: function() {
      return this.get(this.idAttribute);
    },
    /**
     * Determines whether or not this model has been saved before
     * @method isNew
     *
     * @return {Boolean}  True when the model has no ID associated with it
     */
    isNew: function() {
      return null === this.id();
    },
    /**
     * Ensures that a map is suitable to be applied to this model
     * @method parse
     *
     * @param {Object} map  The string or key-value hash to parse
     * @return {Object}  The parsed version of the map
     */
    parse: function(map) {
      if (typeof map === 'string') {
        map = JSON.parse(map);
      }
      return map;
    },
    /**
     * Sets each attribute of this model according to the map
     * @method apply
     *
     * @param {Object} map  The string or key-value map to parse and apply
     */
    /**
     * Sets each attribute of this model according to the map
     * @method apply
     *
     * @param {Object} map  The string or key-value map to parse and apply
     * @param {Boolean} suppress  When true, validation, events and tracking are suppressed
     */
    apply: function(map, suppress) {
      _suppressChecked(this, suppress, function() {
        map = this.parse(map);
        for (var n in map) {
          this.set(n, map[n]);
        }
      });
    },
    /**
     * Removes all data from the model or removes selected flag from model.
     * @method clear
     *
     * @sig
     * Removes all flagged data from the model
     * @param {String} flag  The metadata flag describing the data to remove
     */
    clear: function(flag) {
      if (flag) {
        var attrs = this.flags[flag],
            i = -1,
            attr,
            item;
        if (attrs) {
          while (!!(attr = attrs[++i])) {
            ArrayUtils.remove(this.unsavedAttributes, attr);
            item = this.get(attr);
            if (item && item.dispose) {
              item.dispose();
            }
            this.set(attr, null);
          }
        }
      } else {
        this.attributes.dispose();
        this.attributes = new Cache();
        this.unsavedAttributes.length = 0;
      }
    },
    /**
     * Makes a copy of this model
     * @method clone
     *
     * @return {Lavaca.mvc.Model}  The copy
     */
    clone: function() {
      return new this.constructor(this.attributes.toObject());
    },
    /**
     * Adds a validation rule to this model
     * @method addRule
     *
     * @param {String} attribute  The name of the attribute to which the rule applies
     * @param {Function} callback  The callback to use to validate the attribute, in the
     *   form callback(attribute, value)
     * @param {String} message  A text message used when a value fails the test
     */
    addRule: function(attribute, callback, message) {
      this.rules.get(attribute, []).push({rule: callback, message: message});
    },
    /**
     * Validates all attributes on the model
     * @method validate
     *
     * @return {Object}  A map of attribute names to validation error messages
     */
    /**
     * Runs validation tests for a specific attribute
     * @method validate
     *
     * @param {String}  The name of the attribute to test
     * @return {Array}  A list of validation error messages
     */
    /**
     * Runs validation against a potential value for a attribute
     * @method validate
     * @param {String} attribute  The name of the attribute
     * @param {Object} value  The potential value for the attribute
     * @return {Array}  A list of validation error messages
     */
    validate: function(attribute, value) {
      var messages,
          rules,
          i = -1,
          rule;
      if (attribute) {
        messages = [];
        value = value === UNDEFINED ? this.get(attribute, value) : value;
        rules = this.rules.get(attribute);
        if (rules) {
          while (!!(rule = rules[++i])) {
            if (!rule.rule(attribute, value)) {
              messages.push(rule.message);
            }
          }
        }
        return messages;
      } else {
        messages = {};
        this.rules.each(function(attributeName) {
          messages[attributeName] = this.validate(attributeName);
        }, this);
        return _isValid(messages);
      }
    },
    /**
     * Processes the data received from a fetch request
     * @method onFetchSuccess
     *
     * @param {Object} response  The response data
     */
    onFetchSuccess: function(response) {
      response = this.parse(response);
      if (this.responseFilter && typeof this.responseFilter === 'function') {
        response = this.responseFilter(response);
      }
      this.apply(response, true);
      this.trigger('fetchSuccess', {response: response});
    },
    /**
     * Triggered when the model is unable to fetch data
     * @method onFetchError
     *
     * @param {Object} value  The error value
     */
    onFetchError: function(response) {
      this.trigger('fetchError', {response: response});
    },
    /**
     * Loads the data for this model from the server and only apply to this model attributes (Note: Does not clear the model first)
     * @method fetch
     *
     * @event fetchSuccess
     * @event fetchError
     */
    /**
     * Loads the data for this model from the server and only apply to this model attributes (Note: Does not clear the model first)
     * @method fetch
     *
     * @param {String} url  The URL from which to load the data
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Loads the data for this model from the server and only apply to this model attributes (Note: Does not clear the model first)
     * @method fetch
     *
     * @param {Object} options  jQuery AJAX settings. If url property is missing, fetch() will try to use the url property on this model
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Loads the data for this model from the server and only apply to this model attributes (Note: Does not clear the model first)
     * @method fetch
     *
     * @param {String} url  The URL from which to load the data
     * @param {Object} options  jQuery AJAX settings
     * @return {Lavaca.util.Promise}  A promise
     */
    fetch: function(url, options) {
      if (typeof url === 'object') {
        options = url;
      } else {
        options = clone(options || {});
        options.url = url;
      }
      options.url = this.getApiURL(options.url || this.url);
      return Promise.when(this, Connectivity.ajax(options))
        .success(this.onFetchSuccess)
        .error(this.onFetchError);
    },
    /**
     * Converts a relative path to an absolute api url based on environment config 'apiRoot'
     * @method getApiURL
     *
     * @param {String} relPath  A relative path
     * @return {String}  A formated api url or an apparently bad url '/please_set_model_url' if relPath argument is faslsy
     */
    getApiURL: function(relPath) {
      var badURL = '/please_set_model_url',
          apiRoot = Config.get('apiRoot'),
          apiURL;
      if (!relPath) {
        return badURL;
      }
      apiURL = (apiRoot || '') + relPath;
      return apiURL;
    },
    /**
     * Saves the model
     * @method save
     *
     *
     * @param {Function} callback  A function callback(model, changedAttributes, attributes)
     *   that returns either a promise or a truthy value
     *   indicating whether the operation failed or succeeded
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Saves the model
     * @method save
     *
     * @param {Function} callback  A function callback(model, changedAttributes, attributes)
     *   that returns either a promise or a truthy value
     *   indicating whether the operation failed or succeeded
     * @param {Object} thisp  The context for the callback
     * @return {Lavaca.util.Promise}  A promise
     */

//* @event saveSuccess
//* @event saveError

    save: function(callback, thisp) {
      var promise = new Promise(this),
          attributes = this.toObject(),
          changedAttributes = {},
          i = -1,
          attribute,
          result;
      while (!!(attribute = this.unsavedAttributes[++i])) {
        changedAttributes[attribute] = attributes[attribute];
      }
      promise
        .success(function(value) {
          var idAttribute = this.idAttribute;
          if (this.isNew() && value[idAttribute] !== UNDEFINED) {
            this.set(idAttribute, value[idAttribute]);
          }
          this.unsavedAttributes = [];
          this.trigger('saveSuccess', {response: value});
        })
        .error(function(value) {
          this.trigger('saveError', {response: value});
        });
      result = callback.call(thisp || this, this, changedAttributes, attributes);
      if (result instanceof Promise) {
        promise.when(result);
      } else if (result) {
        promise.resolve(result);
      } else {
        promise.reject(result);
      }
      return promise;
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
        return Promise.when(this, Connectivity.ajax({
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
     * @return {Object}  The key-value hash
     */
    toObject: function() {
      var obj = this.attributes.toObject(),
          flags;
      for(var key in obj) {
        if(typeof obj[key] === "function") {
          flags = this.flags[Model.DO_NOT_COMPUTE];
          if (!flags || ArrayUtils.indexOf(flags, key) === -1) {
            obj[key] = obj[key].call(this);
          }
        }
      }
      return obj;
    },
    /**
     * Converts this model to JSON
     * @method toJSON
     *
     * @return {String}  The JSON string representing the model
     */
    toJSON: function() {
      return JSON.stringify(this.toObject());
    },
    /**
     * Bind an event handler to this object
     * @method on
     *
     *
     * @param {String} type  The name of the event
     * @param {Function} callback  The function to execute when the event occurs
     * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
     */
    /**
     * Bind an event handler to this object
     * @method on
     *
     * @param {String} type  The name of the event
     * @param {String} attr  An attribute to which to limit the scope of events
     * @param {Function} callback  The function to execute when the event occurs
     * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
     */
    /**
     * Bind an event handler to this object
     * @method on
     * @param {String} type  The name of the event
     * @param {Function} callback  The function to execute when the event occurs
     * @param {Object} thisp  The context of the handler
     * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
     */
    /**
     * Bind an event handler to this object
     * @method on
     * @param {String} type  The name of the event
     * @param {String} attr  An attribute to which to limit the scope of events
     * @param {Function} callback  The function to execute when the event occurs
     * @param {Object} thisp  The context of the handler
     * @return {Lavaca.events.EventDispatcher}  This event dispatcher (for chaining)
     */
    on: function(type, attr, callback, thisp) {
      if (typeof attr === 'function') {
        thisp = callback;
        callback = attr;
        attr = null;
      }
      function handler(e) {
        if (!attr || e.attribute === attr) {
          callback.call(thisp || this, e);
        }
      }
      handler.fn = callback;
      handler.thisp = thisp;
      return EventDispatcher.prototype.on.call(this, type, handler, thisp);
    },
    /**
    * Filters the raw response from onFetchSuccess() down to a custom object. (Meant to be overriden)
    * @method responseFilter
    *
    * @param {Object} response  The raw response passed in onFetchSuccess()
    * @return {Object}  An object to be applied to this model instance
    */
    responseFilter: function(response) {
      return response;
    }
  });
  /**
   * @field {String} SENSITIVE
   * @static
   * @default 'sensitive'
   * Flag indicating that data is sensitive
   */
  Model.SENSITIVE = 'sensitive';
  /**
   * @field {String} DO_NOT_COMPUTE
   * @static
   * @default 'do_not_compute'
   * Flag indicating that the selected attribute should not be executed
   * as a computed property and should instead just return the function.
   */
  Model.DO_NOT_COMPUTE = 'do_not_compute';

  return Model;

});
