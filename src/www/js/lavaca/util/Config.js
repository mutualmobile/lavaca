define(function(require) {

  var Cache = require('./Cache'),
      Map = require('./Map');

  var _cache = new Cache();

  function _construct(name, src, code) {
    if (code) {
      code = JSON.parse(code);
    }
    return new Config(name, src, code);
  }

  /**
   * Configuration management type
   * @class lavaca.util.Config
   * @extends lavaca.util.Map
   */
  var Config = Map.extend({
    // Empty (no overrides)
  });
  /**
   * Sets the application's default config
   * @method setDefault
   * @static
   *
   * @param {String} name  The name of the default config
   */
  Config.setDefault = function(name) {
    Map.setDefault(_cache, name);
  };
  /**
   * Gets the application's current config environment name
   * @method currentEnvironment
   * @static
   *
   * @return {String} The name of the current environment
   */
  Config.currentEnvironment = function() {
    return _cache.get('default').name;
  };
  /**
   * Retrieves a value from the configuration
   * @method get
   * @static
   * @param {String} code  The name of the parameter
   * @return {Object}  The value of the parameter
   */
   /**
   * Retrieves a value from the configuration
   * @method get
   * @static
   * @param {String} name  The name of the config
   * @param {String} code  The name of the parameter
   * @return {Object}  The value of the parameter
   */
  Config.get = function(name, code) {
    return Map.get(_cache, name, code, 'default');
  };
  /**
   * Scans the document for all translations and prepares them
   * @method init
   * @static
   */
   /**
   * Scans the document for all translations and prepares them
   * @method init
   * @static
   * @param {jQuery} scope  The element to which to limit the scan
   */
  Config.init = function(scope) {
    Map.init(_cache, 'text/x-config', _construct, scope);
  };
  /**
   * Disposes of all translations
   * @method dispose
   * @static
   */
  Config.dispose = function() {
    Map.dispose(_cache);
  };

  Config.init();

  return Config;

});
