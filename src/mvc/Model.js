import Observable from '../util/Observable';
import extend from '../util/extend';

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
let Model = extend(Observable, function Model() {
  return Observable.apply(this, arguments);
},{

  /**
   * Sets a value and calls $apply() to trigger a change event
   * @method $set
   * @param {String} key  The property name you want to change/set
   * @param {Object} value  Sets the value in of the property
   */
  /**
   * Sets a value and calls $apply() to trigger a change event
   * @method $set
   * @param {String} key  The property name you want to change/set
   * @param {Object} value  Sets the value in of the property
   * @param {Boolean} mergeIn  Merges value with previous value
   */
  $set(key, value, mergeIn){
    try{
      this[key] = merge ? merge(this[key],value) : value;
    }catch(e){
      this[key] = value;
    }
    this.$apply();
  }
});

export default Model;
