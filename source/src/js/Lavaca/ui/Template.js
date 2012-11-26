/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Map) {

var _cache = new Lavaca.util.Cache(),
    _types = [];

function _construct(name, src, code) {
  return new ns.Template(name, src, code);
}

/**
 * @class Lavaca.ui.Template
 * @super Lavaca.util.Map
 * Abstract type for templates
 */
ns.Template = Map.extend({
  /**
   * @method compile
   * Compiles the template
   */
  compile: function() {
    // Do nothing
  },
  /**
   * @method render
   * Renders the template to a string
   *
   * @param {Object} model  The data model to provide to the template
   * @return {Lavaca.util.Promise}  A promise
   */
  render: function(model) {
    throw 'Abstract';
  },
  /**
   * @method process
   * Parses server data to include in this lookup
   *
   * @param {String} text  The server data string
   */
  process: function(text) {
    this.code = text;
  }
});
/**
 * @method get
 * @static
 * Finds the template with a given name
 *
 * @param {String} name  The name of the template
 * @return {Lavaca.ui.Template}  The template (or null if no such template exists)
 */
ns.Template.get = function(name) {
  return _cache.get(name);
};
/**
 * @method init
 * @static
 * Scans the document for all templates with registered types and
 *   prepares template objects from them
 *
 * @sig
 *
 * @sig
 * @param {jQuery} scope  The element to which to limit the scan
 */
ns.Template.init = function(scope) {
  var i = -1,
      type;
  while (type = _types[++i]) {
    function construct(name, src, code) {
      return new type.js(name, src, code);
    }
    Map.init(_cache, type.mime, construct, scope);
  }
};
/**
 * @method dispose
 * @static
 * Disposes of all templates
 */
ns.Template.dispose = function() {
  Map.dispose(_cache);
};
/**
 * @method render
 * @static
 * Finds the named template and renders it to a string
 *
 * @param {String} name  The name of the template
 * @param {Object} model  The data model to provide to the template
 * @return {Lavaca.util.Promise}  A promise
 */
ns.Template.render = function(name, model) {
  var template = ns.Template.get(name);
  if (!template) {
    throw 'No template named "' + name + '"';
  } else {
    return template.render(model);
  }
};
/**
 * @method register
 * @static
 * Registers a type of template to look for on intilization
 *
 * @param {String} mimeType  The mime-type associated with the template
 * @param {Function} TTemplate  The JavaScript type used for the template (should derive from [[Lavaca.ui.Template]])
 */
ns.Template.register = function(mimeType, TTemplate) {
  _types[_types.length] = {mime: mimeType, js: TTemplate};
};

})(Lavaca.resolve('Lavaca.ui', true), Lavaca.$, Lavaca.util.Map);