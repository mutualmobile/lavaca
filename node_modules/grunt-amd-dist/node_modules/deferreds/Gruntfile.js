module.exports = function( grunt ) {

	"use strict";

	//grunt's jshint helper expects options to be in an 'options' property
	function readJshint( path ) {
		var data = {};
		try {
			data = grunt.file.readJSON( path );
			grunt.utils._.each(data, function(val, key, o) {
				o.options = o.options || {};
				if (key !== 'globals') {
					o.options[key] = val;
					delete o[key];
				}
			});
			grunt.verbose.write( "Reading " + path + "..." ).ok();
		} catch(e) {}
		return data;
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		'amd-dist': {
			all: {
				options: {
					//remove requirejs dependency from built package (almond)
					standalone: true,
					//build standalone for node or browser
					env: 'node',
					//env: 'browser',
					exports: 'deferreds'
				},
				//Grunt files configuration object for which to trace dependencies
				//(more: http://gruntjs.com/configuring-tasks)
                files: [{
					src: 'src/deferreds/**/*.js',
					dest: 'dist/deferreds.js'
				}]
			}
		},


		'amd-doc': {
			all: {
				src: 'src/deferreds/**/*.js',
				options: {
					out: 'doc/out',
					cache: 'doc/cache',
					mixin: 'doc/mixin',
					repoview: 'https://github.com/zship/deferreds.js/blob/develop/',
					types: (function() {
						var types = [];

						['Number', 'String', 'Object', 'Function', 'Array', 'RegExp', 'Boolean'].forEach(function(val) {
							types.push({
								name: val,
								link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/' + val
							});
						});

						types.push({
							name: 'Any',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects'
						});

						types.push({
							name: 'void',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/undefined'
						});

						types.push({
							name: 'Element',
							link: 'https://developer.mozilla.org/en-US/docs/DOM/element'
						});

						types.push({
							name: 'Constructor',
							link: 'https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/constructor'
						});

						types.push({
							name: 'jQuery',
							link: 'http://api.jquery.com/jQuery/'
						});

						types.push({
							name: 'jquery',
							link: 'http://api.jquery.com/jQuery/'
						});

						types.push({
							name: 'require',
							link: 'http://requirejs.org/'
						});

						types.push({
							regexp: /amd-utils\/.*/,
							link: 'http://millermedeiros.github.com/amd-utils/'
						});

						types.push({
							regexp: /dojo\/(.*)/,
							link: 'http://dojotoolkit.org/reference-guide/1.8/dojo/$1.html'
						});

						return types;
					})()
				}
			}
		},


		uglify: {
			all: {
				options: {
					banner: '/*! <%= pkg.title %> v<%= pkg.version %> | MIT license */\n'
				},
				files: [
					{
						src: 'dist/deferreds.js',
						dest: 'dist/deferreds.min.js'
					}
				]
			}
		},


		jshint: {
			src: {
				options: {
					jshintrc: 'src/.jshintrc'
				},
				files: {
					src: 'src/**/*.js'
				}
			},
			test: {
				options: {
					jshintrc: 'test/unit/.jshintrc'
				},
				files: {
					src: 'test/unit/**/*.js'
				}
			}
		},


		'amd-test': {
			mode: 'qunit',
			files: 'test/unit/*.js'
		},


		qunit: {
			all: ['test/runner.html']
		},


		'amd-check': {
			files: ['src/**/*.js', 'test/unit/**/*.js']
		},


		requirejs: {
			baseUrl: 'src/deferreds',
			optimize: 'none',
			paths: {
				'mout': '../../lib/mout'
			},
			keepBuildDir: true,
			locale: "en-us",
			useStrict: false,
			skipModuleInsertion: false,
			findNestedDependencies: false,
			removeCombined: false,
			preserveLicenseComments: false,
			logLevel: 0
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-amd-dist');
	grunt.loadNpmTasks('grunt-amd-doc');
	grunt.loadNpmTasks('grunt-amd-test');
	grunt.loadNpmTasks('grunt-amd-check');

	grunt.registerTask('test', ['amd-test', 'qunit']);
	grunt.registerTask('dist', ['amd-dist', 'uglify']);

};
