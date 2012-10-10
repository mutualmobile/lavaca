/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, Widget) {

/**
 * @class app.ui.Nav
 * @super Lavaca.ui.Widget
 * Global navigation widget
 *
 * @constructor
 *
 * @param {jQuery} el  The DOM element that is the root of the widget
 */
ns.Nav = Widget.extend({
  /** 
   * @field {String} template
   * @default 'nav'
   * The name of the template used by the global nav
   */
  template: 'nav',
  /**
   * @method bindTo
   * Binds the navigation to the application state
   *
   * @param {Lavaca.mvc.Model} state  The application state
   */
  bindTo: function(state) {
    this.model = state
      .on('change', 'user', this.redraw, this)
      .on('change', 'lang', this.redraw, this);
    this.redraw();
  },
  /**
   * @method redraw
   * Redraws the nav widget
   *
   * @param {Object} user  The user model
   */
  redraw: function() {
    var user = this.model.get('user'),
        el = this.el,
        key = user ? 'auth' : 'unauth',
        unkey = user ? 'unauth' : 'auth';
    Lavaca.ui.Template.render(this.template, user || {}).then(function(html) {
      el.html(html);
      el
        .find('a[data-' + key + '-url], a[data-' + key + '-text]')
        .each(function(i, elem) {
          elem = $(elem);
          var href = elem.attr('href'),
              newHref = elem.attr('data-' + key + '-url') || href,
              text = elem.text(),
              newText = elem.attr('data-' + key + '-text') || text;
          elem
            .attr('data-' + unkey + '-url', href)
            .attr('href', newHref)
            .attr('data-' + unkey + '-text', text)
            .text(newText);
        });
    });
  }
});

})(Lavaca.resolve('app.ui', true), Lavaca.$, Lavaca.ui.Widget);