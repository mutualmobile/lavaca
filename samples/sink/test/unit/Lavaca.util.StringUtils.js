(function(StringUtils) { 

describe('StringUtils', function() {
  it('can format a string', function() {
    var str = 'Bye {0}, hope you find your {1}';
    expect(StringUtils.format(str, ['Buddy', 'Dad'])).toEqual('Bye Buddy, hope you find your Dad');
    str = 'Hello {0}, bye {0}';
    expect(StringUtils.format(str, ['Dave'])).toEqual('Hello Dave, bye Dave')
  });
  it('can escape html', function() {
    var str = '<div>"Ben & Jerry\'s"</div>';
    expect(StringUtils.escapeHTML(str)).toEqual('&lt;div&gt;&quot;Ben &amp; Jerry&apos;s&quot;&lt;/div&gt;');
  });
  it('can compress and decompress a string or object', function() {
    var compressed,
        ob = {
          name: 'Lavaca',
          what: 'js framework'
        };
    compressed = StringUtils.compress(ob);
    expect(StringUtils.decompress(compressed)).toEqual('{"name":"Lavaca","what":"js framework"}');
  });
});

})(Lavaca.resolve('Lavaca.util.StringUtils', true));
