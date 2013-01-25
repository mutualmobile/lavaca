define(function() {

  /**
   * @method resolve
   * @static
   * Looks up or creates an object, given its global path (ie, 'Lavaca.resolve' resolves to this function,
   * 'no.obj.exists' resolves to null)
   *
   * @sig
   * @param {String} name  The fully-qualified name of the object to look up
   * @return {Object}  The resolved object
   *
   * @sig
   * @param {String} name  The fully-qualified name of the object to look up
   * @param {Boolean} createIfNotExists  When true, any part of the name that doesn't already exist will be created
   * as an empty object
   * @return {Object}  The resolved object
   */
  var resolve = function(name, createIfNotExists) {
    if (!name) {
      return null;
    }
    name = name.split('.');
    var last = window,
        o = window,
        i = -1,
        segment;
    while (!!(segment = name[++i])) {
      o = o[segment];
      if (!o) {
        if (createIfNotExists) {
          o = last[segment] = {};
        } else {
          return null;
        }
      }
      last = o;
    }
    return o;
  };


  return resolve;

});
