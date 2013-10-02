define(function(require) {
  var Form = require('lavaca/ui/Form'),
      Model = require('lavaca/mvc/Model'),
      $ = require('$');

  var noop;

  function _createForm(inputs, opts) {
    var $form = $('<form>'),
        $input,
        $temp,
        name,
        attr,
        attrs,
        opt,
        form,
        i;
    for (name in inputs) {
      attrs = inputs[name];
      attrs.name = name;
      if (attrs.type === 'select') {
        $input = $('<select/>');
        if (attrs.options) {
          for (opt in attrs.options) {
            $input.append('<option value="' + opt + '">' + attrs.options[opt] + '</option>');
          }
          delete attrs.options;
        }
        delete attrs.type;
      } else if (attrs.type === 'textarea') {
        $input = $('<textarea/>');
        delete attrs.type;
      } else if (attrs.type === 'radio') {
        $input = $();
        for (i = 0; i < attrs.values.length; i++) {
          $temp = $('<input/>').val(attrs.values[i]);
          $input = $input.add($temp);
        }
        delete attrs.values;
      } else {
        $input = $('<input/>');
      }
      for (attr in attrs) {
        $input.attr(attr, attrs[attr]);
      }
      $form.append($input);
    }
    form = new Form($form, opts);
    form.onSubmitSuccess = noop.success;
    form.onSubmitError = noop.error;
    return form;
  }

  function _expectError(name, message) {
    expect(noop.success).not.toHaveBeenCalled();
    expect(noop.error).toHaveBeenCalled();
    expect(noop.error.mostRecentCall.args[0][name].messages[0]).toEqual(message);
  }
  function _expectErrorCount(expectedCount) {
    var count = 0,
        inputs;
    try {
      inputs = noop.error.mostRecentCall.args[0];
      for (var input in inputs) {
        count += inputs[input].messages.length;
      }
    } catch (e) {}
    expect(count).toEqual(expectedCount);
  }

  describe('Form', function() {
    beforeEach(function() {
      noop = {
        success: function() { },
        error: function() { }
      };
      spyOn(noop, 'success').andCallThrough();
      spyOn(noop, 'error').andCallThrough();
    });
    afterEach(function() {
    });

    describe('can get', function() {
      it('an input by name', function() {
        var form = _createForm({
              test: {}
            }),
            input;
        input = form.input('test');
        expect(input[0]).toBeTruthy();
        expect(input[0].nodeName.toLowerCase()).toEqual('input');
        expect(input[0].value).toEqual('');
      });
      it('an input value by name', function() {
        var form = _createForm({
              test: {
                value: 'hi'
              }
            });
        expect(form.get('test')).toEqual('hi');
      });
      it('all form values', function() {
        var form = _createForm({
              myInput: {
                value: 'abc'
              },
              myRadio: {
                type: 'radio',
                values: ['1','2','3']
              },
              myCheckboxOn: {
                type: 'checkbox',
                value: 'testOnCheckbox'
              },
              myCheckboxOff: {
                type: 'checkbox',
                value: 'testOffCheckbox'
              },
              mySingleSelect: {
                type: 'select',
                options: ['1','2','3']
              },
              myMultipleSelect1: {
                type: 'select',
                multiple: '',
                options: ['1','2','3', '4']
              },
              myMultipleSelect2: {
                type: 'select',
                multiple: '',
                options: ['1','2','3', '4']
              }
            }),
            values;
        form.set('myRadio', '2');
        form.set('mySingleSelect', '2');
        form.set('myMultipleSelect1', '2');
        form.set('myMultipleSelect2', ['2', '3']);
        form.set('myCheckboxOn', true);
        values = form.values();
        expect(values.myInput).toEqual('abc');
        expect(values.myRadio).toEqual('2');
        expect(values.myCheckboxOn).toEqual('testOnCheckbox');
        expect(values.myCheckboxOff).toBeFalsy();
        expect(values.mySingleSelect).toEqual('2');
        expect(values.myMultipleSelect1).toEqual(['2']);
        expect(values.myMultipleSelect2).toEqual(['2', '3']);
      });
    });

    describe('can set', function() {
      it('an input value by name', function() {
        var form = _createForm({
              test: {
                value: 'hi'
              }
            });
        form.set('test', 'bye');
        expect(form.get('test')).toEqual('bye');
      });
      it('multiple input values with a hash', function() {
        var form = _createForm({
              test: {
                value: 'hi'
              },
              otherTest: {
                value: '1234'
              }
            });
        form.set({
          test: 'bye',
          otherTest: '5678'
        });
        expect(form.get('test')).toEqual('bye');
        expect(form.get('otherTest')).toEqual('5678');
      });
    });

    describe('can automatically trim', function() {
      it('values from input fields', function() {
        var inputData = {
              test: {
                value: ' abc '
              }
            },
            origForm = _createForm(inputData),
            trimmedForm = _createForm(inputData);
        trimmedForm.autoTrim = true;
        expect(origForm.get('test')).toEqual(' abc ');
        expect(trimmedForm.get('test')).toEqual('abc');
      });
    });

    describe('can validate', function() {
      it('a required field', function() {
        var form = _createForm({
          test: {
            required: ''
          },
          testFulfill: {
            required: '',
            value: '1234'
          }
        });
        form.el.submit();
        _expectError('test', 'error_required');
        _expectErrorCount(1);
      });
      it('a pattern', function() {
        var form = _createForm({
          allNumsTrue: {
            pattern: '^[0-9]+$',
            value: '1234'
          },
          allNumsFalse: {
            pattern: '^[0-9]+$',
            value: '1234a'
          }
        });
        form.el.submit();
        _expectError('allNumsFalse', 'error_pattern');
        _expectErrorCount(1);
      });
      it('an email field', function() {
        var form = _createForm({
          shouldPass: {
            type: 'email',
            value: 'test@test.com'
          },
          shouldFail1: {
            type: 'email',
            value: 'test'
          },
          shouldFail2: {
            type: 'email',
            value: 'test@'
          },
          shouldFail3: {
            type: 'email',
            value: 'test@test'
          },
          shouldFail4: {
            type: 'email',
            value: 'test@test.'
          }
        });
        form.el.submit();
        _expectError('shouldFail1', 'error_email');
        _expectError('shouldFail2', 'error_email');
        _expectError('shouldFail3', 'error_email');
        _expectError('shouldFail4', 'error_email');
        _expectErrorCount(4);
      });
      it('a tel field', function() {
        var form = _createForm({
          shouldPass1: {
            type: 'tel',
            value: '1234567890'
          },
          shouldPass2: {
            type: 'tel',
            value: '4567890'
          },
          shouldFail1: {
            type: 'tel',
            value: '1'
          },
          shouldFail2: {
            type: 'tel',
            value: '123456789a'
          },
        });
        form.el.submit();
        _expectError('shouldFail1', 'error_tel');
        _expectError('shouldFail2', 'error_tel');
        _expectErrorCount(2);
      });
      it('a url field', function() {
        var form = _createForm({
          shouldPass1: {
            type: 'url',
            value: 'http://apple.com'
          },
          shouldPass2: {
            type: 'url',
            value: 'https://apple.com'
          },
          shouldPass3: {
            type: 'url',
            value: 'https://www.apple.com'
          },
          shouldFail1: {
            type: 'url',
            value: 'a.a'
          },
          shouldFail2: {
            type: 'url',
            value: 'aaaa/aa.com'
          },
        });
        form.el.submit();
        _expectError('shouldFail1', 'error_url');
        _expectError('shouldFail2', 'error_url');
        _expectErrorCount(2);
      });
      it('using a custom function', function() {
        var form = _createForm({
          shouldPass1: {
            value: 'abc123'
          },
          shouldFail1: {
            value: 'asdf'
          },
        });
        form.addRule('input', function(value) {
          return value === 'abc123' ? null: 'error_custom';
        });
        form.el.submit();
        _expectError('shouldFail1', 'error_custom');
        _expectErrorCount(1);
      });
      it('multiple fields as a group', function() {
        var form = _createForm({
          shouldPass1: {
            'data-should-have-abc': '',
            'value': 'abc'
          },
          shouldPass2: {
            'data-should-have-abc': '',
            'value': 'abc'
          },
          shouldBeExcluded: {
            'value': 'abc1234'
          },
          shouldPass3: {
            'data-should-have-abc': '',
            'value': 'abc'
          },
        });

        var handler = {
          callback: function(values, inputs) {
            var passing = values.length === 3 && inputs.length === 3;
            for (var i = 0; i < values.length; i++) {
              passing = passing && values[i] === 'abc';
            }
            return passing ? null: 'error_custom';
          }
        };
        spyOn(handler, 'callback').andCallThrough();
        form.addRule('input[data-should-have-abc]', handler.callback, true);
        form.el.submit();
        _expectErrorCount(0);
        expect(handler.callback.callCount).toEqual(1);
        expect(noop.success).toHaveBeenCalled();
        expect(noop.error).not.toHaveBeenCalled();
      });
    });

    describe('can bind to a model', function() {
      it('and update the model when an input changes', function() {
        var form = _createForm({
              test: {
                value: 'hi'
              }
            }),
            model = new Model();
        form.bind(model);
        form.set('test', 'bye');
        expect(model.get('test')).toEqual('bye');
      });
      it('and update the fields when the model changes', function() {
        var form = _createForm({
              myInput: {
                value: 'hi'
              },
              myRadio: {
                type: 'radio',
                values: ['1', '2', '3']
              },
              myCheckboxOn: {
                type: 'checkbox',
                value: 'testOnCheckbox'
              },
              myCheckboxOff: {
                type: 'checkbox',
                checked: true,
                value: 'testOffCheckbox'
              },
              mySingleSelect: {
                type: 'select',
                options: ['1', '2', '3', '4']
              },
              myMultiSelect1: {
                type: 'select',
                multiple: '',
                options: ['1', '2', '3', '4']
              },
              myMultiSelect2: {
                type: 'select',
                multiple: '',
                options: ['1', '2', '3', '4']
              }
            }),
            model = new Model();
        form.bind(model);
        model.set('myInput', 'abc');
        model.set('myRadio', '2');
        model.set('myCheckboxOn', true);
        model.set('myCheckboxOff', false);
        model.set('mySingleSelect', '2');
        model.set('myMultiSelect1', '2');
        model.set('myMultiSelect2', ['2', '3']);
        expect(form.get('myInput')).toEqual('abc');
        expect(form.get('myRadio')).toEqual('2');
        expect(form.get('myCheckboxOn')).toEqual('testOnCheckbox');
        expect(form.get('myCheckboxOff')).toBeFalsy();
        expect(form.get('mySingleSelect')).toEqual('2');
        expect(form.get('myMultiSelect1')).toEqual(['2']);
        expect(form.get('myMultiSelect2')).toEqual(['2', '3']);
      });
    });
  });
});