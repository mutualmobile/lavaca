/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Map) {

var _cache = new ns.Cache();

function _construct(name, src, code) {
  if (code) {
    code = JSON.parse(code);
  }
  return new ns.Config(name, src, code);
}

/**
 * @class Lavaca.util.Config
 * @super Lavaca.util.Map
 * Configuration management type
 */
ns.Config = Map.extend({
  // Empty (no overrides)
});
/**
 * @method setDefault
 * @static
 * Sets the application's default config
 *
 * @param {String} name  The name of the default config
 */
ns.Config.setDefault = function(name) {
  Map.setDefault(_cache, name);
};
/**
 * @method currentEnvironment
 * @static
 * Gets the application's current config environment name
 *
 * @return {String} The name of the current environment
 */
ns.Config.currentEnvironment = function() {
  return _cache.get('default').name;
};
/**
 * @method get
 * @static
 * Retrieves a value from the configuration
 *
 * @sig
 * @param {String} code  The name of the parameter
 * @return {Object}  The value of the parameter
 *
 * @sig
 * @param {String} name  The name of the config
 * @param {String} code  The name of the parameter
 * @return {Object}  The value of the parameter
 */
ns.Config.get = function(name, code) {
  return Map.get(_cache, name, code, 'default');
};
/**
 * @method init
 * @static
 * Scans the document for all translations and prepares them
 *
 * @sig
 *
 * @sig
 * @param {jQuery} scope  The element to which to limit the scan
 */
ns.Config.init = function(scope) {
  Map.init(_cache, 'text/x-config', _construct, scope);
};
/**
 * @method dispose
 * @static
 * Disposes of all translations
 */
ns.Config.dispose = function() {
  Map.dispose(_cache);
};

})(Lavaca.util, Lavaca.$, Lavaca.util.Map);