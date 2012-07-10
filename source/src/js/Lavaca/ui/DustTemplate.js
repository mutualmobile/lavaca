/*
Lavaca 1.0.1
Copyright (c) 2012 Mutual Mobile

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function(ns, xdust, Template, Translation) {

/**
 * @class Lavaca.ui.DustTemplate
 * @super Lavaca.ui.Template
 * Base type for templates that use the x-dust engine
 *
 * @constructor
 * @param {String} name  The unique name of the template
 * @param {String} src  A URL from which to load the template
 * @param {String} code  The raw string code of the template's body
 */
ns.DustTemplate = Template.extend(function(name, src, code) {
  Template.apply(this, arguments);
  var helper = this.prepareHelper(),
      n;
  for (n in helper) {
    xdust.helpers[n] = helper[n];
  }
}, {
  /**
   * @method prepareHelper
   * Gets the basis for the template helper object
   *
   * @return {Object}  A map of helper function names to functions
   */
  prepareHelper: function() {
    return {
      msg: this.helperMsg,
      include: this.helperInclude
    };
  },
  /**
   * @method helperMsg
   * Helper function, exposed in dust templates, that uses
   *   [[Lavaca.util.Translation]] to get localized strings. Accessed as:
   *
   * <dl>
   *
   * <dt>{#msg}code{/msg}</dt>
   *   <dd>code&mdash;The key under which the message is stored</dd>
   *
   * <dt>{#msg}code{:or}default{/msg}</dt>
   *   <dd>code&mdash;The key under which the message is stored</dd>
   *   <dd>default&mdash;Text to use if no message exists</dd>
   *
   * <dt>{#msg locale="en_US"}code{/msg}</dt>
   *   <dd>locale&mdash;The locale from which to get the message ("en_US")</dd>
   *   <dd>code&mdash;The key under which the message is stored</dd>
   *
   * <dt>{#msg p0="first" p1=variable}code{/msg}</dt>
   *   <dd>p0, p1, &hellip; pN&mdash;String format parameters for the message
   *       (See [[Lavaca.util.StringUtils]].format()</dd>
   *   <dd>code&mdash;The key under which the message is stored</dd>
   *
   * </dl>
   *
   * @param {RenderChain} chain  Dust render chain
   * @param {Context} context  Dust context
   * @param {Object} model  Model object passed to template
   * @return {String}  Rendered output
   */
  helperMsg: function(chain, context, model) {
    var node = chain.tail,
        code = node.renderBody('block', chain, context, model),
        locale = node.params[locale],
        args = [Translation.get(code, locale) || ''],
        i = -1,
        arg;
    while (arg = node.params['p' + (++i)]) {
      args.push(arg.render(chain, context, model));
    }
    return Lavaca.util.StringUtils.format.apply(this, args);
  },
  /**
   * @method helperInclude
   * Helper function, exposed in dust templates, that uses
   *   [[Lavaca.ui.Template]] to include other templates. Accessed as:
   *
   * <dl>
   *
   * <dt>{#include name="template-name"/}</dt>
   *   <dd>name&mdash;The name under which the template can be referenced</dd>
   *
   * </dl>
   *
   * <strong>Note:</strong> You should always use the include helper instead of
   * the dust.js partial syntax. The dust.js partial syntax may not work as expected.
   *
   * @param {RenderChain} chain  Dust render chain
   * @param {Context} context  Dust context
   * @param {Object} model  Model object passed to template
   * @return {String}  Rendered output
   */
  helperInclude: function(chain, context, model) {
    var node = chain.tail,
        name = node.params['name'].render(chain, context, model),
        result;
    // Note - this is potentially an async call
    Template
      .render(name, model)
      .then(function(html) {
        result = html;
      });
    return result;
  },
  /**
   * @method compile
   * Compiles the template
   */
  compile: function() {
    Template.prototype.compile.call(this);
    xdust.compile(this.code, this.name);
  },
  /**
   * @method render
   * Renders the template to a string
   *
   * @param {Object} model  The data model to provide to the template
   * @return {Lavaca.util.Promise}  A promise
   */
  render: function(model) {
    var promise = new Lavaca.util.Promise(this);
    if (!this.code && this.src) {
      this.load(this.src);
    }
    if (this.code && !this.compiled) {
      this.compile();
      this.compiled = true;
    }
    xdust.render(this.name, model, function(err, html) {
      if (err) {
        promise.reject(err);
      } else {
        promise.resolve(html);
      }
    });
    return promise;
  },
  /**
   * @method dispose
   * Makes this template ready for disposal
   */
  dispose: function() {
    delete xdust.cache[this.name];
    Template.prototype.dispose.call(this);
  }
});

// Register the Dust template type for later use
ns.Template.register('text/x-dust-template', ns.DustTemplate);

})(Lavaca.ui, xdust, Lavaca.ui.Template, Lavaca.util.Translation);