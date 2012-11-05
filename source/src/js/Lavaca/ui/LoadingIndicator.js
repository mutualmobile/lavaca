/*
Lavaca 1.0.5
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Widget) {

/**
 * @class Lavaca.ui.LoadingIndicator
 * @super Lavaca.ui.Widget
 * Type that shows/hides a loading indicator
 *
 * @constructor
 * @param {jQuery} el  The DOM element that is the root of the widget
 */
ns.LoadingIndicator = Widget.extend({
  /**
   * @field {String} className
   * @default 'loading'
   * Class name applied to the root
   */
  className: 'loading',
  /**
   * @method show
   * Activates the loading indicator
   */
  show: function() {
    this.el.addClass(this.className);
  },
  /**
   * @method hide
   * Deactivates the loading indicator
   */
  hide: function() {
    this.el.removeClass(this.className);
  }
});
/** 
 * @method init
 * @static
 * Creates a loading indicator and binds it to the document's AJAX events
 *
 * @sig
 *
 * @sig
 * @param {Function} TLoadingIndicator  The type of loading indicator to create (should derive from [[Lavaca.ui.LoadingIndicator]])
 */
ns.LoadingIndicator.init = function(TLoadingIndicator) {
  TLoadingIndicator = TLoadingIndicator || ns.LoadingIndicator;
  var indicator = new TLoadingIndicator(document.body);
  function show() {
    indicator.show();
  }
  function hide() {
    indicator.hide();
  }
  $(document)
    .on('ajaxStart', show)
    .on('ajaxStop', hide)
    .on('ajaxError', hide);
  return indicator;
};

})(Lavaca.ui, Lavaca.$, Lavaca.ui.Widget);