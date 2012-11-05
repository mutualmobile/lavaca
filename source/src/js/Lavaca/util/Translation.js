/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, Map) {

var _cache = new ns.Cache();

function _construct(name, src, code) {
  if (code) {
    code = JSON.parse(code);
  }
  var map = new ns.Translation(name, src, code);
  if (!_cache.get(map.language)) {
    _cache.set(map.language, map);
  }
  return map;
}

/**
 * @class Lavaca.util.Translation
 * @super Lavaca.util.Map
 * Translation dictionary
 *
 * @constructor
 * @param {String} name  The name of the map
 * @param {String} src  The URL of the map's data (or null if code is supplied)
 * @param {String} code  The raw string data for the map (or null if src is supplied)
 */
ns.Translation = Map.extend(function(name, src, code) {
  Map.apply(this, arguments);
  var locale = name = name.toLowerCase().split('_');
  /**
   * @field {String} language
   * @default null
   * The ISO 639-2 code for the translation's language
   */
  this.language = locale[0];
  /**
   * @field {String} country
   * @default ''
   * The ISO 3166-1 code for the translation's country
   */
  this.country = locale[1] || '';
  /**
   * @field {String} locale
   * @default null
   * The locale of this translation (either lang or lang_COUNTRY)
   */
  this.locale = this.country
    ? this.language + '_' + this.country
    : this.language;
}, {
  /**
   * @method is
   * Determines whether or not this translation works for a locale
   *
   * @sig
   * @param {String} language  The locale's language
   * @return {Boolean}  True if this translation applies
   *
   * @sig
   * @param {String} language  The locale's language
   * @param {String} country   (Optional) The locale's country
   * @return {Boolean}  True if this translation applies
   */
  is: function(language, country) {
    return language == this.language
      && (!country || !this.country || country == this.country);
  }
});
/**
 * @method setDefault
 * @static
 * Sets the application's default locale
 *
 * @param {String} locale  A locale string (ie, "en", "en_US", or "es_MX")
 */
ns.Translation.setDefault = function(locale) {
  _cache.remove('default');
  Map.setDefault(_cache, ns.Translation.forLocale(locale));
};
/**
 * @method forLocale
 * @static
 * Finds the most appropriate translation for a given locale
 *
 * @param {String} locale  The locale
 * @return {Lavaca.util.Translation}  The translation
 */
ns.Translation.forLocale = function(locale) {
  locale = (locale || 'default').toLowerCase();
  return _cache.get(locale)
    || _cache.get(locale.split('_')[0])
    || _cache.get('default');
};
/**
 * @method get
 * @static
 * Finds the most appropriate translation of a message for the default locale
 *
 * @sig
 * @param {String} code  The code under which the message is stored
 * @return {Lavaca.util.Translation}  The translation
 *
 * @sig
 * @param {String} locale  The locale
 * @param {String} code  The code under which the message is stored
 * @return {Lavaca.util.Translation}  The translation
 */
ns.Translation.get = function(locale, code) {
  if (!code) {
    code = locale;
    locale = 'default';
  }
  var translation = ns.Translation.forLocale(locale),
      result = null;
  if (translation) {
    result = translation.get(code);
  }
  if (result === null) {
    translation = ns.Translation.forLocale(locale.split('_')[0]);
    if (translation) {
      result = translation.get(code);
    }
  }
  if (result === null) {
    translation = ns.Translation.forLocale('default');
    if (translation) {
      result = translation.get(code);
    }
  }
  return result;
};
/**
 * @method init
 * @static
 * Scans the document for all translations and prepares them
 *
 * @sig
 * @param {String} locale  The default locale
 *
 * @sig
 * @param {String} locale  The default locale
 * @param {jQuery} scope  The element to which to limit the scan
 */
ns.Translation.init = function(locale, scope) {
  Map.init(_cache, 'text/x-translation', _construct, scope);
  ns.Translation.setDefault(locale);
};
/**
 * @method dispose
 * @static
 * Disposes of all translations
 */
ns.Translation.dispose = function() {
  Map.dispose(_cache);
};

})(Lavaca.util, Lavaca.util.Map);