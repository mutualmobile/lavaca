
/**
 * Establishes inheritance between types. After a type is extended, it receives its own static
 * convenience method, extend(TSub, overrides).
 * @class lavaca.util.extend
 */
 /**
 * Establishes inheritance between types. After a type is extended, it receives its own static
 * convenience method, extend(TSub, overrides).
 * @method extend
 * @static
 *
 */
 /**
 * Establishes inheritance between types. After a type is extended, it receives its own static
 * convenience method, extend(TSub, overrides).
 * @method extend
 * @static
 * @param {Function} TSub  The child type which will inherit from superType
 * @param {Object} overrides  A hash of key-value pairs that will be added to the subType
 * @return {Function}  The subtype
 *
 */
 /**
 * Establishes inheritance between types. After a type is extended, it receives its own static
 * convenience method, extend(TSub, overrides).
 * @method extend
 * @static
 * @param {Function} TSuper  The base type to extend
 * @param {Function} TSub  The child type which will inherit from superType
 * @param {Object} overrides  A hash of key-value pairs that will be added to the subType
 * @return {Function}  The subtype
 */
var extend = function (TSuper, TSub, overrides){
  if (typeof TSuper === 'object') {
    overrides = TSuper;
    TSuper = Object;
    TSub = () => {/* Empty*/};
  } else if (typeof TSub === 'object') {
    overrides = TSub;
    TSub = TSuper;
    TSuper = Object;
  }
  let ctor = function() {/*Empty*/}
  ctor.prototype = TSuper.prototype;
  TSub.prototype = new ctor;
  TSub.prototype.constructor = TSub;
  if (overrides) {
    for (var name in overrides) {
      TSub.prototype[name] = overrides[name];
    }
  }
  TSub.extend = function (T, overrides){
    if (typeof T === 'object') {
      overrides = T;
      T = function() {
        return TSub.apply(this, arguments);
      };
    }
    extend(TSub, T, overrides);
    return T;
  };
  return TSub;
};

export default extend;
