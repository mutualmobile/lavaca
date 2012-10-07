/*
Lavaca 1.0.4
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, $, BaseView, util) {

function _showErrors(inputs) {
  var messages = [],
      i,
      message,
      name,
      input;
  for (name in inputs) {
    input = inputs[name];
    i = -1;
    while (message = input.messages[++i]) {
      messages.push(util.StringUtils.format(util.Translation.get(message), input.label));
    }
  }
  app.showErrors(messages);
}

var _TForm = Lavaca.ui.Form.extend({
  onSubmitSuccess: function(values) {
    app.router.exec('/sign-in/submit', null, values);
  },
  onSubmitError: function(inputs) {
    _showErrors(inputs);
  }
});

/**
 * @class app.ui.SignInView
 * @super app.ui.BaseView
 * Sign-in view type
 */
ns.SignInView = BaseView.extend(function() {
  BaseView.apply(this, arguments);
  this.mapWidget('form', _TForm);
}, {
  /**
   * @field {String} template
   * @default 'sign-in'
   * The name of the template used by the view
   */
  template: 'sign-in',
  /**
   * @field {String} className
   * @default 'sign-in'
   * A class name added to the view container
   */
  className: 'sign-in popover',
  /**
   * @field {String} animation
   * @default 'slide-up'
   * The name of the animation used by the view
   */
  animation: 'slide-up'
});

})(app.ui.views, Lavaca.$, app.ui.views.BaseView, Lavaca.util);