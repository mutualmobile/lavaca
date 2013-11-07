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
    if (value && !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(value.toLowerCase())) { //' fix SublimeText syntax highlighting
      return 'error_email';
    }
    return null;
  }

  function _tel(value) {
    if (value && !/^\d?(\d{3})?\d{7}$/.test(value.replace(/\D/g, ''))) {
      return 'error_tel';
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
    if (value && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2})/.test(value)) {
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
    this.el.on('input', function(e) {
      this.autoAdvanceIfNecessary($(e.target));
    }.bind(this));
    this.formatters = [];
    this.rules = [];
    this.addRule(this.defaultRules());
  }, {
    /**
     * Whether input values should automatically be trimmed
     * @property autoTrim
     * @default false
     * @type Boolean
     */
    autoTrim: false,
    /**
     * Whether the focus should automatically advance to the
     * next input when the input's value is equal to it's maxlength
     * @property autoAdvance
     * @default false
     * @type Boolean
     */
    autoAdvance: false,
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
     * Calls submit on the Form's element
     * @method submit
     */
    submit: function() {
      this.el.submit();
    },
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
            value = _trim.call(this, input.val());
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
    /**
     * Gets the value of an input on the form
     * @method get
     *
     * @param {jQuery} input  The input, textarea, or select
     * @return {String}  The value of the input
     */
    get: function(inputs) {
      var result = null,
          i = -1,
          input,
          value,
          type;
      if (typeof inputs === 'string') {
        inputs = this.input(inputs);
      }
      while (!!(input = inputs[++i])) {
        input = $(input);
        type = (input.attr('type') || '').toLowerCase();
        if ((type === 'radio' || type === 'checkbox') && !input[0].checked) {
          continue;
        }
        value = _trim.call(this, input.val());
        if (result instanceof Array) {
          result.push(value);
        } else if (result !== null) {
          result = [result, value];
        } else {
          result = value;
        }
      }
      return result;
    },
    /**
     * Sets the value of an input on the form
     * @method set
     *
     * @param {String} name  The name of the input
     * @param {String} value  The new value of the input
     */
    /**
     * Sets the values of multiple inputs on the form
     * @method set
     *
     * @param {Object} values  A hash of input names and values
     */
    set: function(name, value) {
      var input, type;
      if (typeof name === 'object') {
        for (var key in name) {
          this.set(key, name[key]);
        }
      } else {
        input = this.input(name);
        type = (input.attr('type') || '').toLowerCase();
        if (type === 'radio') {
          input.each(function() {
            this.checked = this.value === value;
          });
        } else if (type === 'checkbox') {
          input.prop('checked', !!value);
        } else {
          input.val(value || null);
        }
        input.trigger('change', {manual: true});
      }
    },
    /**
     * Adds a validation rule to the form
     * @method addRule
     * @param {String} selector  A jQuery selector associated with the rule
     * @param {Function} callback  A function that tests the value of inputs matching the
     *   selector in the form callback(value, input, form) and
     *   return a string message if validation fails
     * @param {Boolean} [treatAsGroup]  (Optional) If true, the callback will be fired once
     *   with an array of values and inputs, one for each matching element. If false or ommitted,
     *   the callback will be fired once for each element that matches the selector.
     */
    /**
     * Adds multiple validation rules to this form. The keys of the object
     * should be the selectors and the object's values can either be a callback
     * or an object with the properties 'callback' and 'treatAsGroup'.
     * @method addRule
     *
     * @param {Object} map  A hash of selectors and callbacks to add as rules
     */
    addRule: function(selector, callback, treatAsGroup) {
      if (typeof selector === 'object') {
        for (var n in selector) {
          if (typeof selector[n] === 'object') {
            this.addRule(n, selector[n].callback, selector[n].treatAsGroup);
          } else {
            this.addRule(n, selector[n]);
          }
        }
      } else {
        this.rules.push({selector: selector, callback: callback, treatAsGroup: treatAsGroup});
      }
    },
    /**
     * Adds a formatter to the form
     * @method addFormatter
     * @param {String} selector  A jQuery selector associated with the formatter
     * @param {Function} callback  A function that takes three arguments (value, input, form) and
     *   returns a string which will be set as the value of the input.
     * @param {Boolean} [treatAsGroup]  (Optional) If true, the callback will be fired once
     *   with an array of values and inputs, one for each matching element. If false or ommitted,
     *   the callback will be fired once for each element that matches the selector.
     */
    /**
     * Adds multiple formatters to this form. The keys of the object
     * should be the selectors and the object's values can either be a callback
     * or an object with the properties 'callback' and 'treatAsGroup'.
     * @method addFormatter
     *
     * @param {Object} map  A hash of selectors and callbacks to add as formatters
     */
    addFormatter: function(selector, callback, treatAsGroup) {
      if (typeof selector === 'object') {
        for (var n in selector) {
          if (typeof selector[n] === 'object') {
            this.addFormatter(n, selector[n].callback, selector[n].treatAsGroup);
          } else {
            this.addFormatter(n, selector[n]);
          }
        }
      } else {
        this.formatters.push({selector: selector, callback: callback, treatAsGroup: treatAsGroup});
      }
    },
    /**
     * Collects all input values on the form
     * @method values
     *
     * @return {Object}  A hash of input names and their values
     */
    values: function() {
      var result = {};
      this.el.find('input, select, textarea').each(function(index, el) {
        var $el = $(el),
            name = $el.attr('name'),
            value;
        if (name) {
          value = this.get($el);
          if (value) {
            result[name] = value;
          }
        }
      }.bind(this));
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
          promise = new Promise(this);

      function validate(rule, value, ip, form) {
        var message = rule.callback.call(form, value, ip, form),
            name,
            id,
            label;
        if (message) {
          ip.each(function(index, el) {
            var $el = $(el);
            name = $el.attr('name');
            if (!result) {
              result = {};
            }
            if (!result[name]) {
              id = $el.attr('id');
              label = null;
              if (id) {
                label = form.el.find('label[for="' + id + '"]').text();
              }
              result[name] = {
                id: id,
                name: name,
                label: label,
                el: $el,
                value: value,
                messages: []
              };
            }
            result[name].messages.push(message);
          });
        }
      }
      _matchAllInputs.call(this, this.rules, validate, input);
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
     * Formats all inputs
     * @method format
     */
    /**
     * Formats the specified inputs
     * @method format
     *
     * @param {jQuery} input  The inputs to format
     */
    format: function(input) {
      function cb(handler, value, ip, form) {
        var formattedValue = handler.callback.call(form, value, ip, form),
            event = jQuery.Event('format'),
            unformattedValue = ip.val();
        ip.val(formattedValue);
        event.unformattedValue = unformattedValue;
        event.formattedValue = formattedValue;
        ip.trigger(event);
      }
      _matchAllInputs.call(this, this.formatters, cb, input);
    },
    /**
     * Automatically advances the focus to the
     * next input if autoAdvance is true and the
     * currently focussed input's value is greater
     * than or equal to its maxlength
     * @method autoAdvanceIfNecessary
     *
     * @param {jQuery} [input]  (Optional) The current input. This
     *   parameter is just for speed optimization if the current input
     *   is already known. If not passed, it will be determined automatically.
     */
    autoAdvanceIfNecessary: function(input) {
      var $current, maxlength, value, $allInputs, $next;
      if (this.autoAdvance) {
        $current = input || this.el.find(':focus');
        maxlength = $current.attr('maxlength');
        value = $current.val();
        if (maxlength) {
          maxlength = parseInt(maxlength, 10);
          if (value.length >= maxlength) {
            $allInputs = this.el.find('input, text');
            $next = $allInputs.eq($allInputs.index($current) + 1);
            if ($next.length) {
              $next.focus();
            } else {
              $current.blur();
            }
          }
        }
      }
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

  function _trim(value) {
    if (this.autoTrim) {
      return value ? value.trim() : value;
    }
    return value;
  }

  // Common code used by formatters and rules
  function _matchAllInputs(handlers, callback, filterToInputs) {
    var i = -1,
        inputs,
        handler,
        value,
        j;
    while (!!(handler = handlers[++i])) {
      if (filterToInputs) {
        inputs = filterToInputs.filter(handler.selector);
        if (inputs.length && handler.treatAsGroup) {
          inputs = inputs.add(this.el.find(handler.selector));
        }
      } else {
        inputs = this.el.find(handler.selector);
      }
      if (handler.treatAsGroup) {
        value = [];
        inputs.each(function(index, el) {
          value.push(this.get($(el)));
        }.bind(this));
        if (value.length) {
          callback.call(this, handler, value, inputs, this);
        }
      } else {
        j = -1;
        while (!!(ip = inputs[++j])) {
          ip = $(ip);
          value = this.get(ip);
          callback.call(this, handler, value, ip, this);
        }
      }
    }
  }

  return Form;

});
