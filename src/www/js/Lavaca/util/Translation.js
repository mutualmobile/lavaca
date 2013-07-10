define(function(require) {

  var Cache = require('./Cache'),
      Map = require('./Map');

  var _cache = new Cache();

  function _construct(name, src, code) {
    if (code) {
      code = JSON.parse(code);
    }
    var map = new Translation(name, src, code);
    if (!_cache.get(map.language)) {
      _cache.set(map.language, map);
    }
    return map;
  }

  /**
   * Translation dictionary
   * @class lavaca.util.Translation
   * @extends lavaca.util.Map
   *
   * @constructor
   * @param {String} name  The name of the map
   * @param {String} src  The URL of the map's data (or null if code is supplied)
   * @param {String} code  The raw string data for the map (or null if src is supplied)
   */
  var Translation = Map.extend(function(name) {
    Map.apply(this, arguments);
    var locale = name.toLowerCase().split('_');
    /**
     * The ISO 639-2 code for the translation's language
     * @property {String} language
     * @default null
     */
    this.language = locale[0];
    /**
     * The ISO 3166-1 code for the translation's country
     * @property {String} country
     * @default ''
     */
    this.country = locale[1] || '';
    /**
     * The locale of this translation (either lang or lang_COUNTRY)
     * @property {String} locale
     * @default null
     */
    this.locale = this.country
      ? this.language + '_' + this.country
      : this.language;
  }, {
    /**
     * Determines whether or not this translation works for a locale
     * @method is
     * @param {String} language  The locale's language
     * @return {Boolean}  True if this translation applies
     */
    /**
     * Determines whether or not this translation works for a locale
     * @method is
     * @param {String} language  The locale's language
     * @param {String} country   (Optional) The locale's country
     * @return {Boolean}  True if this translation applies
     */
    is: function(language, country) {
      return language === this.language
        && (!country || !this.country || country === this.country);
    }
  });
  /**
   * Sets the application's default locale
   * @method setDefault
   * @static
   *
   * @param {String} locale  A locale string (ie, "en", "en_US", or "es_MX")
   */
  Translation.setDefault = function(locale) {
    _cache.remove('default');
    Map.setDefault(_cache, Translation.forLocale(locale));
  };
  /**
   * Finds the most appropriate translation for a given locale
   * @method forLocale
   * @static
   *
   * @param {String} locale  The locale
   * @return {Lavaca.util.Translation}  The translation
   */
  Translation.forLocale = function(locale) {
    locale = (locale || 'default').toLowerCase();
    return _cache.get(locale)
      || _cache.get(locale.split('_')[0])
      || _cache.get('default');
  };
  /**
   * Finds the most appropriate translation of a message for the default locale
   * @method get
   * @static
   * @param {String} code  The code under which the message is stored
   * @return {Lavaca.util.Translation}  The translation
   */
  /**
   * Finds the most appropriate translation of a message for the default locale
   * @method get
   * @static
   * @param {String} locale  The locale
   * @param {String} code  The code under which the message is stored
   * @return {Lavaca.util.Translation}  The translation
   */
  Translation.get = function(locale, code) {
    if (!code) {
      code = locale;
      locale = 'default';
    }
    var translation = Translation.forLocale(locale),
        result = null;
    if (translation) {
      result = translation.get(code);
    }
    if (result === null) {
      translation = Translation.forLocale(locale.split('_')[0]);
      if (translation) {
        result = translation.get(code);
      }
    }
    if (result === null) {
      translation = Translation.forLocale('default');
      if (translation) {
        result = translation.get(code);
      }
    }
    return result;
  };
  /**
   * Scans the document for all translations and prepares them
   * @method init
   * @static
   * @param {String} locale  The default locale
   */
  /**
   * Scans the document for all translations and prepares them
   * @method init
   * @static
   * @param {String} locale  The default locale
   * @param {jQuery} scope  The element to which to limit the scan
   */
  Translation.init = function(locale, scope) {
    Map.init(_cache, 'text/x-translation', _construct, scope);
    Translation.setDefault(locale);
  };
  /**
   * Disposes of all translations
   * @method dispose
   * @static
   */
  Translation.dispose = function() {
    Map.dispose(_cache);
  };

  return Translation;

});
