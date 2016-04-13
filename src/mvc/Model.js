import Observable from '../util/Observable';

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
class Model extends Observable {}

export default Model;
