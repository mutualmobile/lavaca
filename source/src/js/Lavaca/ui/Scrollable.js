/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Widget, iScroll) {

var _props = ['overflowScrolling', 'webkitOverflowScrolling', 'MozOverflowScrolling', 'OOverflowScrolling', 'MSOverflowScrolling'],
    _prop,
    _isSupported;

(function() {
  var style = document.createElement('div').style,
      i = -1,
      s;
  while (s = _props[++i]) {
    if (s in style) {
      _prop = s;
      break;
    }
  }
})();

/**
 * @class Lavaca.ui.Scrollable
 * @super Lavaca.ui.Widget
 * Overflow Scroll Container for mobile using overflow scrolling: touch or iScroll
 *
 * @constructor
 * @param {jQuery} el  The DOM element that is the root of the widget
 */
ns.Scrollable = Widget.extend(function() {
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
   * @field {Boolean} supportsOverflow
   * @default false
   * True when overflowScrolling is supported in the Browser 
   */
  supportsOverflow: !!_prop,
  /**
   * @field {String} className
   * @default 'overflow-scroll'
   * Activates the loading indicator
   */
  className: 'overflow-scroll',
  /**
   * @field {Object} iScrollOptions
   * @default null
   * iScroll options hash
   */
  iScrollOptions: null,
  /**
   * @method wrapper
   * Creates a wrapper for iScroll's scrolling content
   *
   * @return {jQuery}  The wrapper element
   */
  wrapper: function() {
    return $('<div class="scroll-wrapper"></div>');
  },
  /**
   * @method createOverflowScroll
   * Initializes native overflow scrolling
   */
  initOverflowScroll: function() {
    this.el.addClass(this.className);
    this.preventParentScroll();
  },
  /**
   * @method createOverflowScroll
   * Instantiates iScroll
   */
  initIScroll: function() {
    var wrapper = this.wrapper(),
      options = {},
      opt,
      value;
    for (opt in this.iScrollOptions) {
      value = this.iScrollOptions[opt];
      if (typeof value == 'function') {
        value = $.proxy(value, this);
      }
      options[opt] = value;
    }
    value = options.onBeforeScrollStart;
    options.onBeforeScrollStart = function(e) {
      var nodeType = (e.explicitOriginalTarget || e.target).nodeName;
      if (nodeType != 'SELECT' && nodeType != 'OPTION' && nodeType != 'INPUT' && nodeType != 'TEXTAREA' && nodeType != 'LABEL') {
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
   * @method refresh
   * Delegates to public iScroll method with delay.
   * Must be called every time content changes inside of scrolling container.
   */
   refresh: function() {
     if (!this.supportsOverflow) {
       Lavaca.delay(function() {
         this.iScroll.refresh();
       }, this, 10);
     }
   },
   /**
    * @method preventParentScroll
    * Prevents a page from scrolling when overflow container reaches boundries
    *
   * Based on ScrollFix v0.1
   * http://www.joelambert.co.uk
   *
   * Copyright 2011, Joe Lambert.
   * Free to use under the MIT license.
   * http://www.opensource.org/licenses/mit-license.php
   */
  preventParentScroll: function() {
    var el = this.el[0];
    this.el.on('touchstart', function(e) {
      startTopScroll = el.scrollTop;
      if (startTopScroll <= 0) {
        el.scrollTop = 1;
      }
      if (startTopScroll + el.offsetHeight >= el.scrollHeight) {
        el.scrollTop = el.scrollHeight - el.offsetHeight - 1;
      }
    });
  },
   /**
    * @method dispose
    * Cleans up the widget
    */
   dispose: function() {
     if (this.isScroll) {
       this.iScroll.destroy();
     }
     Widget.prototype.dispose.call(this);
   }
});

})(Lavaca.ui, Lavaca.$, Lavaca.ui.Widget, iScroll);