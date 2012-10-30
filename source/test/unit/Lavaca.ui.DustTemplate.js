(function(DustTemplate, Translation) {
  var noop,
      template;

  function _newTemplate(code, name) {
    name = name || 'tmpl';
    $('body').append('<script data-name="' + name + '" type="text/dust-template" class="script-tmpl">' + code + '</script>');
    Lavaca.ui.Template.init();
    return Lavaca.ui.Template.get(name);
  }

  function _newTranslation(code) {
    $('body').append('<script type="text/x-translation" data-name="en_US" class="script-translation">' + code + '</script>');
    Translation.init('en_US');
  }

  describe('DustTemplate', function() {
    beforeEach(function() {
      noop = {
        success: function() { },
        error: function() { }
      };
      spyOn(noop, 'success');
      spyOn(noop, 'error');
    });
    afterEach(function() {
      template.dispose();
      $('.script-tmpl').remove();
      $('.script-translation').remove();
      Translation.dispose();
    });
    it('can render a basic template from a string', function() {
      var source = '{#names}{.}{~n}{/names}',
          context = { names: ['Moe', 'Larry', 'Curly'] };

      template = new DustTemplate('tmpl', null, source);
      template.render(context)
        .success(function(html) {
          expect(html).toEqual('Moe\nLarry\nCurly\n');
        })
        .error(noop.error);

      expect(noop.error).not.toHaveBeenCalled();
    });
    it('can render a basic template from an inline script', function() {
      var source = '{#names}{.}{~n}{/names}',
          context = { names: ['Moe', 'Larry', 'Curly'] },
          template = _newTemplate(source);

      template.render(context)
        .success(function(html) {
          expect(html).toEqual('Moe\nLarry\nCurly\n');
        })
        .error(noop.error);

      expect(noop.error).not.toHaveBeenCalled();
    });
    it('can use a LinkedIn helper', function() {
      var source = '{@eq key="{val}" value="foo"}equal{/eq}',
          context = { val: 'foo' },
          template = _newTemplate(source);

      template.render(context)
        .success(function(html) {
          expect(html).toEqual('equal');
        })
        .error(noop.error);

      expect(noop.error).not.toHaveBeenCalled();
    });
    it('can use a translation', function() {
      var source = '{@msg key="test-value"/}',
          context = {},
          template;

      _newTranslation('{"test-value": "hello world"}');
      template = _newTemplate(source);

      template.render(context)
        .success(function(html) {
          expect(html).toEqual('hello world');
        })
        .error(noop.error);

      expect(noop.error).not.toHaveBeenCalled();
    });
    it('can use an include', function() {
      var parentSource = '<h1>{name}</h1>{@include name="titleTmpl"/}',
          childSource = '<h2>{title}</h2>',
          context = {name: 'Larry', title: 'Developer'},
          parentTemplate = _newTemplate(parentSource),
          childTemplate = _newTemplate(childSource, 'titleTmpl');

      parentTemplate.render(context)
        .success(function(html) {
          expect(html).toEqual('<h1>Larry</h1><h2>Developer</h2>');
        })
        .error(noop.error);

      expect(noop.error).not.toHaveBeenCalled();
    });
  });

})(Lavaca.resolve('Lavaca.ui.DustTemplate', true), Lavaca.resolve('Lavaca.util.Translation', true));

