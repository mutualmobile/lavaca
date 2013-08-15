define(function(require) {

  var $ = require('$'),
      Widget = require('lavaca/ui/Widget'),
      Promise = require('lavaca/util/Promise');

  function _required(value) {
    return value ? null : 'error_required';
  }

  function _pattern(value, input) {
    if (value) {
      var pattern = new RegExp(input.attr('pattern'));
      if (!pattern.test(value)) {
        return 'error_pattern';
      }
    }
    return null;
  }

  function _email(value) {
    if (value && !/^\w+@\w+(\.\w+)*\.\w+$/.test(value)) {
      return 'error_email';
    }
    return null;
  }

  function _tel(value) {
    if (value && !/^\d?(\d{3})?\d{7}$/.test(value.replace(/\D/g, ''))) {
      return 'error_email';
    }
    return null;
  }

  function _number(value) {
    if (value && !/^\d+(\.\d+)?$/.test(value)) {
      return 'error_number';
    }
    return null;
  }

  function _url(value) {
    if (value && !/^https?:\/\/\w+(\.\w+)*\.\w(:\d+)?\/\S+$/.test(value)) {
      return 'error_url';
    }
    return null;
  }

  /**
   * Basic form type
   * @class lavaca.ui.Form
   * @extends lavaca.ui.Widget
   *
   * @constructor
   * @param {jQuery} el  The DOM element that is the root of the widget
   */
  var Form = Widget.extend(function() {
    Widget.apply(this, arguments);
    var self = this;
    this.pendingSync = {};
    this._onChangeInput = function(e) {
      self.onChangeInput(e);
    };
    this._onSubmit = function(e) {
      self.onSubmit(e);
    };
    this.el.on('submit', this._onSubmit);
    this.addRule(this.defaultRules());
  }, {
    /**
     * Event handler for when the form is submitted
     * @method onSubmit
     *
     * @param {Event} e  The submit event
     */
    onSubmit: function(e) {
      e.preventDefault();
      this.validate()
        .success(this.onSubmitSuccess)
        .error(this.onSubmitError);
    },
    /**
     * Event handler for when the user attempts to submit a valid form
     * @method onSubmitSuccess
     *
     * @param {Object} values  Key-value map of the form's input names and values
     */
    onSubmitSuccess: function() {
      // Placeholder
    },
    /**
     * Event handler for when the user attempts to submit an invalid form
     * @method onSubmitError
     *
     * @param {Object} invalidInputs  A key-value map of all invalid inputs
     */
    onSubmitError: function() {
      // Placeholder
    },
    /**
     * Event handler for when an input on the form changes
     * @method onChangeInput
     *
     * @param {Event} e  The change event
     */
    onChangeInput: function(e) {
      if (this.model) {
        var input = $(e.target),
            name = input.attr('name'),
            value = input.val();
        this.pendingSync[name] = true;
        this.model.set(name, value);
        this.pendingSync[name] = false;
      }
    },
    /**
     * Event handler for when an attribute on the bound model changes
     * @method onChangeModel
     *
     * @param {Event} e  The change event
     */
    onChangeModel: function(e) {
      if (!this.pendingSync[e.attribute]) {
        this.set(e.attribute, e.value);
      }
    },
    /**
     * Binds this form to a model, forcing the two to stay in sync
     * @method bind
     *
     * @param {Lavaca.mvc.Model} model  The model being bound
     */
    bind: function(model) {
      this.unbind();
      this.model = model;
      model.on('change', this.onChangeModel, this);
      this.el.on('change', this._onChangeInput);
    },
    /**
     * Unbinds this form from its model
     * @method unbind
     */
    unbind: function() {
      if (this.model) {
        this.el.off('change', this._onChangeInput);
        this.model.off('change', this.onchangeModel, this);
        this.model = null;
      }
    },
    /**
     * Retrieve an input from the form with a given name
     * @method input
     *
     * @param {String} name  The name of the input
     * @return {jQuery}  The input
     */
    input: function(name) {
      return this.el.find('input, select, textarea').filter('[name="' + name + '"]');
    },
    /**
     * Gets the value of an input on the form
     * @method get
     *
     * @param {String} name  The name of the input
     * @return {String}  The value of the input
     */
    get: function(name) {
      return this.input(name).val();
    },
    /**
     * Sets an input on the form's value
     * @method set
     *
     * @param {String} name  The name of the input
     * @param {Object} value  The new value of the input
     */
    set: function(name, value) {
      this.input(name).val(value || null);
    },
    /**
     * The default validation rules for the form
     * @method defaultRules
     *
     * @return {Object}  The form's default rules1
     */
    defaultRules: function() {
      return {
        '[required]': _required,
        '[pattern]': _pattern,
        '[type=email]': _email,
        '[type=tel]': _tel,
        '[type=number]': _number,
        '[type=url]': _url
      };
    },
    /**
     * Adds multiple validation rules to this form
     * @method addRule
     *
     * @param {Object} map  A hash of selectors and callbacks to add as rules
     */
    /**
     * Adds multiple validation rules to this form
     * @method addRule
     * @param {String} selector  A jQuery selector associated with the rule
     * @param {Function} callback  A function that tests the value of inputs matching the
     *   selector in the form callback(value, input, form) and
     *   return a string message if validation fails
     */
    addRule: function(selector, callback) {
      if (!this.rules) {
        this.rules = [];
      }
      if (typeof selector === 'object') {
        for (var n in selector) {
          this.addRule(n, selector[n]);
        }
      } else {
        this.rules.push({selector: selector, callback: callback});
      }
    },
    /**
     * Collects all input values on the form
     * @method values
     *
     * @return {Object}  A hash of input names and their values
     */
    values: function() {
      var inputs = this.el.find('input, select, textarea'),
          result = {},
          i = -1,
          input,
          name,
          current,
          value,
          type;
      while (!!(input = inputs[++i])) {
        input = $(input);
        type = input.attr('type');
        if ((type === 'radio' || type === 'checkbox') && !input[0].checked) {
          continue;
        }
        name = input.attr('name');
        current = result[name];
        value = input.val();
        if (current instanceof Array) {
          current.push(value);
        } else if (current !== undefined) {
          result[name] = [current, value];
        } else {
          result[name] = value;
        }
      }
      return result;
    },
    /**
     * Checks the entire form to see if it's in a valid state
     * @method validate
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Checks the entire form to see if it's in a valid state
     * @method validate
     * @param {Function} succcess  A callback to execute when the form is valid
     * @param {Function} error  A callback to execute when the form is invalid
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Checks the entire form to see if it's in a valid state
     * @method validate
     * @param {jQuery} input  An input to check
     * @return {Lavaca.util.Promise}  A promise
     */
    /**
     * Checks the entire form to see if it's in a valid state
     * @method validate
     * @param {Function} succcess  A callback to execute when the input is valid
     * @param {Function} error  A callback to execute when the input is invalid
     * @param {jQuery} input  An input to check
     * @return {Lavaca.util.Promise}  A promise
     */
    validate: function(success, error, input) {
      if (success && typeof success !== 'function') {
        input = success;
        success = null;
      }
      if (input) {
        input = $(input);
      }
      var result = null,
          promise = new Promise(this),
          i = -1,
          j,
          rule,
          inputs,
          ip,
          message,
          name,
          label,
          id,
          value;
      while (!!(rule = this.rules[++i])) {
        if (input) {
          inputs = input.filter(rule.selector);
        } else {
          inputs = this.el.find(rule.selector);
        }
        j = -1;
        while (!!(ip = inputs[++j])) {
          ip = $(ip);
          value = ip.val();
          message = rule.callback.call(this, value, ip, this);
          if (message) {
            name = ip.attr('name');
            if (!result) {
              result = {};
            }
            if (!result[name]) {
              id = ip.attr('id');
              label = null;
              if (id) {
                label = this.el.find('label[for="' + id + '"]').text();
              }
              result[name] = {
                id: id,
                name: name,
                label: label,
                el: ip,
                value: value,
                messages: []
              };
            }
            result[name].messages.push(message);
          }
        }
      }
      if (result) {
        promise.reject(result);
      } else {
        promise.resolve(this.values());
      }
      return promise
        .error(function(inputs) {
          this.trigger('invalid', {inputs: inputs});
        })
        .success(function(values) {
          this.trigger('valid', values);
        })
        .success(success)
        .error(error);
    },
    /**
     * Ready the form for garbage collection
     * @method dispose
     */
    dispose: function() {
      this.unbind();
      Widget.prototype.dispose.call(this);
    }
  });
  /**
   * Extends the form with new submit handlers
   * @method withSubmit
   * @static
   *
   * @param {Function} success  The success handler
   * @param {Function} error  The error handler
   * @return {Function}  A new [@Lavaca.ui.Form]-derived type
   */
  Form.withSubmit = function(success, error) {
    return Form.extend({
      onSubmitSuccess: function(values) {
        success.call(this, values);
      },
      onSubmitError: function(inputs) {
        error.call(this, inputs);
      }
    });
  };

  return Form;

});
