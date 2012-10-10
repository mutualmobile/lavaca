/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, PopoverView) {

/**
 * @class app.ui.ErrorsView
 * @super app.ui.PopoverView
 * Errors view type
 */
ns.ErrorsView = PopoverView.extend({
  /**
   * @field {Number} column
   * @default 1
   * The horizontal column in which the view should live
   */
  column: 1,
  /**
   * @field {String} template
   * @default 'errors'
   * The name of the template used by the view
   */
  template: 'errors',
  /**
   * @field {String} className
   * @default 'errors'
   * A class name added to the view container
   */
  className: 'errors'
});

})(app.ui.views, Lavaca.$, app.ui.views.PopoverView);