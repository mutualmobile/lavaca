module.exports = function(grunt) {
	'use strict';

	var path = require('path');
	var _ = require('underscore');
	var jade = require('jade');
	var amd = require('grunt-lib-amd');

	var testDir = path.resolve(process.cwd() + '/test');
	var testRunner = path.resolve(__dirname + '/tpl/runner.jade');


	var _generateRunner = function(mode, config, modules) {
		config = _.clone(config);
		config.baseUrl = path.relative(testDir, config.baseUrl);

		modules = modules.map(function(mod) {
			var modPath = path.resolve(process.cwd() + '/' + mod);
			return path.relative(testDir, modPath);
		});

		var styles;
		var scripts;

		switch (mode) {
			case 'jasmine':
				styles = ['lib/jasmine.css'];
				scripts = [
					'lib/jasmine.js',
					'lib/jasmine-html.js'
				];
				break;
			case 'qunit':
				styles = ['lib/qunit-1.11.0.css'];
				scripts = ['lib/qunit-1.11.0.js'];
				break;
		}

		scripts = scripts.concat(['lib/es5-shim.js']);
		scripts = scripts.concat(['lib/require.js']);

		styles = styles.map(function(s) {
			return path.relative(testDir, path.resolve(__dirname + '/' + s));
		});

		scripts = scripts.map(function(s) {
			return path.relative(testDir, path.resolve(__dirname + '/' + s));
		});

		var tpl = grunt.file.read(testRunner, 'utf-8');
		tpl = jade.compile(tpl, {filename: testRunner, pretty: true});
		var data = tpl({
			mode: mode, 
			styles: styles, 
			scripts: scripts, 
			rjsconfig: JSON.stringify(config, false, 4), 
			modules: JSON.stringify(modules, false, 4)
		});
		var outPath = testDir + '/runner.html';
		grunt.file.write(outPath, data, 'utf-8');

		return outPath;
	};


	grunt.registerTask('amd-test', 'Generates QUnit/jasmine html', function() {
		var config = grunt.config.get(this.name);
		var modules = grunt.file.expand({filter: 'isFile'}, config.files);
		var rjsconfig = amd.loadConfig(grunt.config.get('requirejs'));
		_generateRunner(config.mode, rjsconfig, modules);
	});
};
