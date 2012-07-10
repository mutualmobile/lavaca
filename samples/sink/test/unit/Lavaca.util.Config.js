(function(Config, Map, Cache, $) { 

var scope = '.scripts';

describe('A Config', function() {
	beforeEach(function() {
		var result = [];
		result.push('<div class="scripts">'); 
		result.push('<script type="text/x-config" data-name="local" data-default>{"protocol": "http:","hostname": "src.boilerplate.mm.dev","port": ""}</script>');
		result.push('<script type="text/x-config" data-name="staging">{"protocol": "http:","hostname": "src.boilerplate.mm.staging","port": ""}</script>');
		result.push('<script type="text/x-config" data-name="production">{"protocol": "http:","hostname": "src.boilerplate.mm.production","port": ""}</script>');
		result.push('</div>');
		$('body').append(result.join(''));
		Config.init(scope);
  });
  afterEach(function() {
    Config.dispose();
  	$('.scripts').remove();
  });
  it('can be intitialized with a cache of config attributes', function() {
    expect(Config.get('hostname')).toEqual('src.boilerplate.mm.dev');
  	expect(Config.get('local', 'hostname')).toEqual('src.boilerplate.mm.dev');
  	expect(Config.get('staging', 'hostname')).toEqual('src.boilerplate.mm.staging');
  	expect(Config.get('production', 'hostname')).toEqual('src.boilerplate.mm.production');
  });
  it('can set the default config', function() {
    expect(Config.get('hostname')).toEqual('src.boilerplate.mm.dev');
    Config.setDefault('staging');
    expect(Config.get('hostname')).toEqual('src.boilerplate.mm.staging');
  });
  it('can be disposed', function() {
    Config.dispose();
    expect(Config.get('hostname')).toBeNull();
  });
});

})(Lavaca.resolve('Lavaca.util.Config', true), Lavaca.resolve('Lavaca.util.Map', true), Lavaca.resolve('Lavaca.util.Cache', true), Lavaca.$);
