define(function(require) {

  var $ = require('$'),
      Cache = require('./Cache'),
      Disposable = require('./Disposable'),
      Connectivity = require('lavaca/net/Connectivity');

  function _absolute(url) {
    if (url && url.indexOf('http') !== 0) {
      if (url.charAt(0) === '/') {
        url = location.protocol + '//'
          + location.hostname
          + (location.port ? ':' + location.port : '')
          + (url.indexOf('/') === 0 ? url : '/' + url);
      } else {
        url = location.toString().split('#')[0].split('?')[0].replace(/\w+\.\w+$/, '') + url;
      }
    }
    return url;
  }

  /**
   * Abstract type for lookup tables
   * @class lavaca.util.Map
   * @extends lavaca.util.Disposable
   *
   * @constructor
   * @param {String} name  The name of the map
   * @param {String} src  The URL of the map's data (or null if code is supplied)
   * @param {String} code  The raw string data for the map (or null if src is supplied)
   */
  var Map = Disposable.extend(function(name, src, code) {
    Disposable.call(this);
    /**
     * Whether or not the map has loaded
     * @property {Boolean} hasLoaded
     * @default false
     */
    this.hasLoaded = false;
    /**
     * The name of the map
     * @property {String} name
     * @default null
     */
    this.name = name;
    /**
     * The source URL for the map
     * @property {String} src
     * @default null
     */
    this.src = _absolute(src);
    /**
     * The raw string data for the map
     * @property {String} code
     * @default null
     */
    this.code = code;
    /**
     * The cache in which this map stores data
     * @property {Lavaca.util.Cache} cache
     * @default new Lavaca.util.Cache()
     */
    this.cache = new Cache();
  }, {
    /**
     * Determines whether or not this is the desired lookup
     * @method is
     *
     * @param {String} name  The name of the lookup
     * @return {Boolean}  True if this is the lookup
     */
    is: function(name) {
      return this.name === name;
    },
    /**
     * Gets the value stored under a code
     * @method get
     *
     * @param {String} code  The code
     * @return {Object}  The value (or null)
     */
    get: function(code) {
      if (!this.hasLoaded) {
        if (this.code) {
          this.add(this.code);
        } else if (this.src) {
          this.load(this.src);
        }
        this.hasLoaded = true;
      }
      return this.cache.get(code);
    },
    /**
     * Adds parameters to this map
     * @method add
     *
     * @param {Object} data  The parameters to add
     */
    add: function(data) {
      for (var n in data) {
        this.cache.set(n, data[n]);
      }
    },
    /**
     * Processes server data to include in this lookup
     * @method process
     *
     * @param {String} text  The server data string
     */
    process: function(text) {
      this.add(typeof text === 'string' ? JSON.parse(text) : text);
    },
    /**
     * Adds JSON data to this map (synchronous)
     * @method load
     *
     * @param {String} url  The URL of the data
     */
    load: function(url) {
      var self = this;
      Connectivity.ajax({
        async: false,
        url: url,
        success: function(resp) {
          self.process(resp);
        }
      });
    }
  });
  /**
   * Sets the application's default config
   * @method setDefault
   * @static
   *
   * @param {Lavaca.util.Cache} cache  The map cache
   * @param {String} name  The name of the config
   */
  Map.setDefault = function(cache, name) {
    var map = name;
    if (typeof map === 'string') {
      map = cache.get(name);
    }
    cache.set('default', map);
  };
  /**
   * Finds the most appropriate value for a code
   * @method get
   * @static
   *
   * @param {Lavaca.util.Cache} cache  The maps cache
   * @param {String} name  The name of the map
   * @param {String} code  The name of the parameter
   * @param {String} defaultName  The name of the default map
   * @return {Object}  The value of the parameter
   */
  Map.get = function(cache, name, code, defaultName) {
    if (!code) {
      code = name;
      name = defaultName;
    }
    if (name) {
      var map = cache.get(name);
      if (map) {
        return map.get(code);
      }
    }
    return null;
  };
  /**
   * Scans the document for all maps and prepares them
   * @method init
   * @static
   *
   * @param {Lavaca.util.Cache} cache  The map cache
   * @param {String} mimeType  The MIME type of the scripts
   * @param {Function} construct  A function that returns a new map, in
   *   the form construct(name, src, code)
   * @param {jQuery} scope  The element to which to limit the scan
   */
  Map.init = function(cache, mimeType, construct, scope) {
    $(scope || document.documentElement)
      .find('script[type="' + mimeType + '"]')
      .each(function() {
        var item = $(this),
            src = item.attr('data-src'),
            name = item.attr('data-name'),
            isDefault = typeof item.attr('data-default') === 'string',
            code = item.text(),
            map;
        map = construct(name, src, code);
        cache.set(map.name, map);
        if (isDefault) {
          Map.setDefault(cache, name);
        }
      });
  };
  /**
   * Disposes of all maps
   * @method dispose
   * @static
   *
   * @param {Lavaca.util.Cache} cache  The map cache
   */
  Map.dispose = function(cache) {
    cache.dispose();
  };

  return Map;

});
