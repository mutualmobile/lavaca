import {removeAll, contains} from 'mout/array';
import {merge} from 'mout/object';
import { default as Cache } from '../util/Cache';
import { default as EventDispatcher } from '../events/EventDispatcher';

var UNDEFINED;

let _triggerAttributeEvent = (model, event, attribute, previous, value, messages) => {
  model.trigger(event, {
    attribute: attribute,
    previous: previous === UNDEFINED ? null : previous,
    value: value === UNDEFINED ? model.get(attribute) : value,
    messages: messages || []
  });
}

let _setFlagOn = (model, name, flag) => {
  var keys = model.flags[flag];
  if (!keys) {
    keys = model.flags[flag] = [];
  }
  if (!contains(keys, name)) {
    keys.push(name);
  }
}

let _suppressChecked = (model, suppress, callback) => {
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

let _isValid = (messages) => {
  var isValid = true;
  for(let attribute in messages){
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
 *
 * @constructor
 * @param {Object} [map]  A parameter hash to apply to the model
 */
var Model = EventDispatcher.extend(function Model(map) {
  var suppressEvents, suppressTracking;
  EventDispatcher.call(this);
  this.attributes = new Cache();
  this.rules = new Cache();
  this.unsavedAttributes = [];
  this.flags = {};
  if (this.defaults) {
    map = merge({}, this.defaults, map);
  }
  if (map) {
    suppressEvents = this.suppressEvents;
    suppressTracking = this.suppressTracking;
    this.suppressEvents
      = this.suppressTracking
      = true;
    this.apply(map);
    this.suppressEvents = suppressEvents;
    this.suppressTracking = suppressTracking;
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
   * The name of the ID attribute
   * @property id
   * @default 'id'
   *
   * @type String
   */

  idAttribute: 'id',
  /**
   * Gets the value of a attribute
   * @method get
   *
   * @param {String} attribute  The name of the attribute
   * @return {Object}  The value of the attribute, or null if there is no value
   */
  get(attribute) {
    var attr = this.attributes.get(attribute),
        flags;
    if (typeof attr === 'function') {
      flags = this.flags[Model.DO_NOT_COMPUTE];
      return !flags || flags.indexOf(attribute) === -1 ? attr.call(this) : attr;
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
  canSet(){
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


  set(attribute, value, flag, suppress) {
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
              && !contains(this.unsavedAttributes, attribute)) {
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
  has(attribute) {
    return this.get(attribute) !== null;
  },
  /**
   * Gets the ID of the model
   * @method id
   *
   * @return {String}  The ID of the model
   */
  id() {
    return this.get(this.idAttribute);
  },
  /**
   * Determines whether or not this model has been saved before
   * @method isNew
   *
   * @return {Boolean}  True when the model has no ID associated with it
   */
  isNew() {
    return null === this.id();
  },
  /**
   * Ensures that a map is suitable to be applied to this model
   * @method parse
   *
   * @param {Object} map  The string or key-value hash to parse
   * @return {Object}  The parsed version of the map
   */
  parse(map) {
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
  apply(map, suppress) {
    _suppressChecked(this, suppress, () => {
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
  clear(flag) {
    if (flag) {
      var attrs = this.flags[flag],
          i = -1,
          attr,
          item;
      if (attrs) {
        while (!!(attr = attrs[++i])) {
          removeAll(this.unsavedAttributes, attr);
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
  clone() {
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
  addRule(attribute, callback, message) {
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
  validate(attribute, value) {
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
      this.rules.each((attributeName) => {
        messages[attributeName] = this.validate(attributeName);
      }, this);
      return _isValid(messages);
    }
  },
  /**
   * Converts this model to a key-value hash
   * @method toObject
   *
   * @return {Object}  The key-value hash
   */
  toObject() {
    var obj = this.attributes.toObject(),
        flags;
    for(var key in obj) {
      if(typeof obj[key] === "function") {
        flags = this.flags[Model.DO_NOT_COMPUTE];
        if (!flags || flags.indexOf(key) === -1) {
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
  toJSON() {
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
  on(type, attr, callback, thisp) {
    if (typeof attr === 'function') {
      thisp = callback;
      callback = attr;
      attr = null;
    }
    let handler = (e) => {
      if (callback && (!attr || e.attribute === attr)) {
        callback.call(thisp || this, e);
      }
    }
    handler.fn = callback;
    handler.thisp = thisp;
    return EventDispatcher.prototype.on.call(this, type, handler, thisp);
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

export default Model;