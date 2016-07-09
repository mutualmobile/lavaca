define(function(require) {

  var EventDispatcher = require('lavaca/events/EventDispatcher'),
      uuid = require('lavaca/util/uuid');

  var _isAndroid = navigator.userAgent.indexOf('Android') > -1,
      _standardsMode = !_isAndroid && typeof history.pushState === 'function',
      _hasPushed = false,
      _shouldUseHashBang = false,
      _lastHash,
      _hist,
      _currentId,
      _pushCount = 0,
      _silentPop = false;

  function checkForParams() {
    var str = window.location.href; 
    str = str.split('?')[1] || ''; 
    str = str.split('#')[0] || '';
    var paramArray = str.split('&') || [];
    for (var i=0; i<paramArray.length; i++) {
      str = paramArray[i];
      var ar = str.split('=');
      var ob = {};
      if (ar && ar.length === 2) {
        ob[ar[0]] = ar[1];
        paramArray[i] = ob;
        if (ar[0] === 'gclid') {
          return true;
        }
      }
    }
    return false;
  }

  function _insertState(hist, position, id, state, title, url) {
    hist.position = position;
    var record = {
          id: id,
          state: state,
          title: title,
          url: url
        };
    hist.sequence[position] = record;
    var hashReplacement = url + '#@' + id;
    _lastHash = hashReplacement;
    if (!checkForParams() || id !== 0) {
      location.hash = _shouldUseHashBang ? '!' + hashReplacement : hashReplacement;
    }
    return record;
  }

  /**
   * HTML5 history abstraction layer
   * @class lavaca.net.History
   * @extends lavaca.events.EventDispatcher
   *
   * @event popstate
   *
   * @constructor
   */
  var History = EventDispatcher.extend(function() {
    EventDispatcher.call(this);
    /**
     * A list containing history states generated by the app (not used for HTML5 history)
     * @property {Array} sequence
     */
    this.sequence = [];
    /**
     * The current index in the history sequence (not used for HTML5 history)
     * @property {Number} position
     */
    this.position = -1;
    var self = this;
    if (_standardsMode) {
      /**
       * Auto-generated callback executed when a history event occurs
       * @property {Function} onPopState
       */
       var self = this;
      this.onPopState = function(e) {
        if (e.state) {
          _pushCount--;
          var previousId = _currentId;
          _currentId = e.state.id;

          self.trigger('popstate', {
            bypassLoad: _silentPop,
            state: e.state.state,
            title: e.state.title,
            url: e.state.url,
            id: e.state.id,
            direction: _currentId > previousId ? 'forward' : 'back'
          });
          _silentPop = false;
          
        }
      };
      window.addEventListener('popstate', this.onPopState, false);
    } else {
      this.onPopState = function() {
        var hash = location.hash,
            code,
            record,
            item,
            previousCode,
            i = -1;
        if (hash) {
          hash = _shouldUseHashBang ? hash.replace(/^#!/, '') : hash.replace(/^#/, '');
        }
        if (hash !== _lastHash) {
          previousCode = _lastHash.split('#@')[1];
          _lastHash = hash;
          if (hash) {
            _pushCount--;
            code = hash.split('#@')[1];
            if (!code) {
              window.location.reload();
            }
            while (!!(item = self.sequence[++i])) {
              if (item.id === parseInt(code, 10)) {
                record = item;
                self.position = i;
                break;
              }
            }
            if (record) {
              var hashReplacement = record.url + '#@' + record.id;
              hashReplacement = _shouldUseHashBang ? '!' + hashReplacement : hashReplacement;
              location.hash = hashReplacement;
              document.title = record.title;

              self.trigger('popstate', {
                bypassLoad: _silentPop,
                state: record.state,
                title: record.title,
                url: record.url,
                id: record.id,
                direction: record.id > parseInt(previousCode, 10) ? 'forward' : 'back'
              });
              _silentPop = false;

            }
          } else {
            History.back();
          }
        }
      };
      if (window.attachEvent) {
        window.attachEvent('onhashchange', this.onPopState);
      } else {
        window.addEventListener('hashchange', this.onPopState, false);
      }
    }
  }, {
    /**
     * Retrieve the current history record
     * @method current
     *
     * @return {Object}  The current history record
     */
    current: function() {
      return this.sequence[this.position] || null;
    },
    /**
     * Determines whether or not there are history states
     * @method hasHistory
     *
     * @returns {Boolean} True when there is a history state
     */
    hasHistory: function() {
      return _pushCount > 0;
    },
    /**
     * Adds a record to the history
     * @method push
     *
     * @param {Object} state  A data object associated with the page state
     * @param {String} title  The title of the page state
     * @param {String} url  The URL of the page state
     */
    push: function(state, title, url) {
      _pushCount++;
      if (_hasPushed) {
        document.title = title;
        _currentId = uuid('history');
        if (_standardsMode) {
          history.pushState({state: state, title: title, url: url, id: _currentId}, title, url);
        } else {
          _insertState(this, ++this.position, _currentId, state, title, url);
        }
      } else {
        this.replace(state, title, url);
      }
    },
    /**
     * Replaces the current record in the history
     * @method replace
     *
     * @param {Object} state  A data object associated with the page state
     * @param {String} title  The title of the page state
     * @param {String} url  The URL of the page state
     */
    replace: function(state, title, url) {
      _hasPushed = true;
      document.title = title;
      if (_standardsMode) {
        history.replaceState({state: state, title: title, url: url, id: _currentId}, title, url);
      } else {
        if (this.position < 0) {
          this.position = 0;
        }
        _insertState(this, this.position, typeof _currentId !== 'undefined' ? _currentId : uuid('history'), state, title, url);
      }
    },
    /**
     * Unbind the history object and ready it for garbage collection
     * @method dispose
     */
    dispose: function() {
      if (this.onPopState) {
        if (_standardsMode) {
          window.removeEventListener('popstate', this.onPopState, false);
        } else if (window.detachEvent) {
          window.detachEvent('onhashchange', this.onPopState);
        } else {
          window.removeEventListener('hashchange', this.onPopState, false);
        }
      }
      EventDispatcher.prototype.dispose.call(this);
    }
  });
  /**
   * Initialize a singleton history abstraction layer
   * @method init
   * @static
   *
   * @return {Lavaca.mvc.History}  The history instance
   */
   /**
   * Initialize a singleton history abstraction layer
   * @method init
   * @static
   *
   * @param {Boolean} useHash  When true, use the location hash to manage history state instead of HTML5 history
   * @return {Lavaca.mvc.History}  The history instance
   */
  History.init = function(useHash) {
    if (!_hist) {
      if (useHash) {
        History.overrideStandardsMode();
      }
      _hist = new History();
    }
    return _hist;
  };
  /**
   * Adds a record to the history
   * @method push
   * @static
   *
   * @param {Object} state  A data object associated with the page state
   * @param {String} title  The title of the page state
   * @param {String} url  The URL of the page state
   */
  History.push = function() {
    History.init().push.apply(_hist, arguments);
  };
  /**
   * Replaces the current record in the history
   * @method replace
   * @static
   *
   * @param {Object} state  A data object associated with the page state
   * @param {String} title  The title of the page state
   * @param {String} url  The URL of the page state
   */
  History.replace = function() {
    History.init().replace.apply(_hist, arguments);
  };
  /**
   * Goes to the previous history state
   * @method back
   * @static
   */
  History.back = function() {
    history.back();
  };
  /**
   * Goes to the previous history state without notifying router
   * @method back
   * @static
   */
  History.silentBack = function() {
    _silentPop = true;
    history.back();
  };
  /**
   * Goes to the next history state
   * @method forward
   * @static
   */
  History.forward = function() {
    history.forward();
  };
  /**
   * Unbind the history object and ready it for garbage collection
   * @method dispose
   * @static
   */
  History.dispose = function() {
    if (_hist) {
      _hist.dispose();
      _hist = null;
    }
  };
  /**
   * Binds an event handler to the singleton history
   * @method on
   * @static
   *
   * @param {String} type  The type of event
   * @param {Function} callback  The function to execute when the event occurs
   * @return {Lavaca.mvc.History}  The history object (for chaining)
   */
  History.on = function() {
    return History.init().on.apply(_hist, arguments);
  };
  /**
   * Unbinds an event handler from the singleton history
   * @method off
   * @static
   *
   * @param {String} type  The type of event
   * @param {Function} callback  The function to stop executing when the
   *    event occurs
   * @return {Lavaca.mvc.History}  The history object (for chaining)
   */
  History.off = function() {
    return History.init().off.apply(_hist, arguments);
  };

  /**
   * Sets Histroy to hash mode
   * @method overrideStandardsMode
   * @static
   */
  History.overrideStandardsMode = function() {
    _standardsMode = false;
  };

  /**
   * Sets Histroy to use google crawlable #!
   * @method useHashBang
   * @static
   */
  History.useHashBang = function() {
    _shouldUseHashBang = true;
  };

  /**
   * Stores the page transition animations so that if you route back, it will animate correctly
   * @property {Array} animationBreadcrumb
   */
  History.animationBreadcrumb = [];

  /**
   * Flag to notify when history back is being called
   * @property {Boolean} isRoutingBack
   */
  History.isRoutingBack = false;

  return History;

});
