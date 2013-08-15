define(function(require) {

  var $ = require('$'),
      Widget = require('./Widget'),
      iScroll = require('iScroll'),
      delay = require('lavaca/util/delay');

  var _props = ['overflowScrolling', 'webkitOverflowScrolling', 'MozOverflowScrolling', 'OOverflowScrolling', 'MSOverflowScrolling'],
      _isSupported,
      _isIOS5;

  (function() {
    var div = document.createElement('div'),
        style = div.style,
        i = -1,
        s;

    _isIOS5 = /OS 5_\d(_\d)? like Mac OS X/i.test(navigator.userAgent);
    while (!!(s = _props[++i])) {
      if (s in style) {
        _isSupported = true;
        return;
      }
    }
    _isSupported = typeof div.ontouchstart !== 'function';
  })();

  /**
   * Overflow Scroll Container for mobile using overflow scrolling: touch or iScroll
   * @class lavaca.ui.Scrollable
   * @extends lavaca.ui.Widget
   * 
   * @constructor
   * @param {jQuery} el  The DOM element that is the root of the widget
   */
  var Scrollable = Widget.extend(function() {
    Widget.apply(this, arguments);
    if (!this.iScrollOptions) {
      this.iScrollOptions = {};
    }
    if (this.supportsOverflow) {
      this.initOverflowScroll();
    } else {
      this.className = 'synthetic-scroll';
      this.initIScroll();
    }
  }, {
    /**
     * True when overflowScrolling is supported in the Browser
     * @property {Boolean} supportsOverflow
     * @default false
     */
    supportsOverflow: _isSupported,
    /**
     * Activates the loading indicator
     * @property {String} className
     * @default 'overflow-scroll'
     */
    className: 'overflow-scroll',
    /**
     * iScroll options hash
     * @property {Object} iScrollOptions
     * @default null
     */
    iScrollOptions: null,
    /**
     * Creates a wrapper for iScroll's scrolling content
     * @method wrapper
     *
     * @return {jQuery}  The wrapper element
     */
    wrapper: function() {
      return $('<div class="scroll-wrapper"></div>');
    },
    /**
     * Initializes native overflow scrolling
     * @method createOverflowScroll
     */
    initOverflowScroll: function() {
      delay(function() {
        this.addOverflowClass();
      }, this);
      this.preventParentScroll();
    },
    /**
     * Instantiates iScroll
     * @method createOverflowScroll
     */
    initIScroll: function() {
      var wrapper = this.wrapper(),
        options = {},
        opt,
        value;
      for (opt in this.iScrollOptions) {
        value = this.iScrollOptions[opt];
        if (typeof value === 'function') {
          value = $.proxy(value, this);
        }
        options[opt] = value;
      }
      value = options.onBeforeScrollStart;
      options.onBeforeScrollStart = function(e) {
        var nodeType = (e.explicitOriginalTarget || e.target).nodeName;
        if (nodeType !== 'SELECT' && nodeType !== 'OPTION' && nodeType !== 'INPUT' && nodeType !== 'TEXTAREA' && nodeType !== 'LABEL') {
          e.preventDefault();
          e.stopPropagation();
        }
        if (value) {
          value.apply(this, arguments);
        }
      };
      this.el.addClass(this.className);
      wrapper.append(this.el.children());
      this.el.append(wrapper);
      this.iScroll = new iScroll(this.el[0], options);
      this.refresh();
    },
    /**
     * Delegates to public iScroll method with delay.
     * Must be called every time content changes inside of scrolling container.
     * @method refresh
     */
     refresh: function() {
       if (!this.supportsOverflow) {
         delay(function() {
           this.iScroll && this.iScroll.refresh();
         }, this, 10);
       } else if (_isIOS5) {
         this.el.removeClass(this.className);
         delay(function() {
           this.addOverflowClass();
         }, this, 10);
       }
     },
     /**
      * Prevents a page from scrolling when overflow container reaches boundries
      * 
      * Based on ScrollFix v0.1
      * http://www.joelambert.co.uk
      *
      * Copyright 2011, Joe Lambert.
      * Free to use under the MIT license.
      * http://www.opensource.org/licenses/mit-license.php
      * @method preventParentScroll
     */
    preventParentScroll: function() {
      var el = this.el[0];
      this.el.off('.preventParentScroll').on('touchstart.preventParentScroll', function() {
        var startTopScroll = el.scrollTop;
        if (startTopScroll <= 0) {
          el.scrollTop = 1;
        }
        if (startTopScroll + el.offsetHeight >= el.scrollHeight) {
          el.scrollTop = el.scrollHeight - el.offsetHeight - 1;
        }
      });
    },
    addOverflowClass: function() {
      // Fix iOS5 scrolling bug
      if (_isIOS5) {
        var rawEl = this.el[0];
        if (rawEl.scrollHeight > rawEl.clientHeight) {
          this.el.addClass(this.className);
        } else {
          this.el.removeClass(this.className);
        }
      } else {
        this.el.addClass(this.className);
      }
    },
     /**
      * Cleans up the widget
      * @method dispose
      */
    dispose: function() {
      if (this.isScroll) {
        this.iScroll.destroy();
      }
      Widget.prototype.dispose.call(this);
    }
  });

  return Scrollable;

});
